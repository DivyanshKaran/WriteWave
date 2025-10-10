-- Circuit Breaker Plugin for Kong
-- Implements circuit breaker pattern for service failures

local cjson = require "cjson"
local redis = require "resty.redis"

local CircuitBreakerHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
}

-- Circuit breaker states
local CIRCUIT_STATES = {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half_open"
}

-- Redis connection
local function get_redis_connection()
  local red = redis:new()
  red:set_timeout(1000)
  
  local ok, err = red:connect("redis", 6379)
  if not ok then
    kong.log.err("Failed to connect to Redis: ", err)
    return nil
  end
  
  return red
end

-- Get circuit breaker key
local function get_circuit_key(service_name)
  return "circuit_breaker:" .. service_name
end

-- Get circuit breaker state
local function get_circuit_state(service_name)
  local red = get_redis_connection()
  if not red then
    return CIRCUIT_STATES.CLOSED
  end
  
  local key = get_circuit_key(service_name)
  local state, err = red:get(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return CIRCUIT_STATES.CLOSED
  end
  
  red:close()
  return state or CIRCUIT_STATES.CLOSED
end

-- Set circuit breaker state
local function set_circuit_state(service_name, state, ttl)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = get_circuit_key(service_name)
  local ok, err = red:setex(key, ttl or 60, state)
  
  if not ok then
    kong.log.err("Failed to set circuit state: ", err)
    red:close()
    return false
  end
  
  red:close()
  return true
end

-- Get failure count
local function get_failure_count(service_name)
  local red = get_redis_connection()
  if not red then
    return 0
  end
  
  local key = "failures:" .. service_name
  local count, err = red:get(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return 0
  end
  
  red:close()
  return tonumber(count) or 0
end

-- Increment failure count
local function increment_failure_count(service_name, ttl)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "failures:" .. service_name
  local count, err = red:incr(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return false
  end
  
  -- Set expiration on first increment
  if count == 1 then
    red:expire(key, ttl or 300) -- 5 minutes default
  end
  
  red:close()
  return count
end

-- Reset failure count
local function reset_failure_count(service_name)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "failures:" .. service_name
  local ok, err = red:del(key)
  
  if not ok then
    kong.log.err("Redis error: ", err)
    red:close()
    return false
  end
  
  red:close()
  return true
end

-- Check if request should be allowed
local function should_allow_request(service_name, conf)
  local state = get_circuit_state(service_name)
  
  if state == CIRCUIT_STATES.CLOSED then
    return true
  elseif state == CIRCUIT_STATES.OPEN then
    return false
  elseif state == CIRCUIT_STATES.HALF_OPEN then
    -- Allow limited requests in half-open state
    return true
  end
  
  return true
end

-- Record success
local function record_success(service_name, conf)
  local state = get_circuit_state(service_name)
  
  if state == CIRCUIT_STATES.HALF_OPEN then
    -- If we get enough successes, close the circuit
    local success_count = get_success_count(service_name)
    if success_count >= conf.healthy then
      set_circuit_state(service_name, CIRCUIT_STATES.CLOSED)
      reset_failure_count(service_name)
      kong.log.info("Circuit breaker closed for service: ", service_name)
    end
  else
    -- Reset failure count on success
    reset_failure_count(service_name)
  end
end

-- Record failure
local function record_failure(service_name, conf)
  local failure_count = increment_failure_count(service_name, conf.timeout)
  
  if failure_count >= conf.threshold then
    set_circuit_state(service_name, CIRCUIT_STATES.OPEN, conf.timeout)
    kong.log.warn("Circuit breaker opened for service: ", service_name, " after ", failure_count, " failures")
  end
end

-- Get success count
local function get_success_count(service_name)
  local red = get_redis_connection()
  if not red then
    return 0
  end
  
  local key = "successes:" .. service_name
  local count, err = red:get(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return 0
  end
  
  red:close()
  return tonumber(count) or 0
end

-- Increment success count
local function increment_success_count(service_name, ttl)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "successes:" .. service_name
  local count, err = red:incr(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return false
  end
  
  -- Set expiration on first increment
  if count == 1 then
    red:expire(key, ttl or 300) -- 5 minutes default
  end
  
  red:close()
  return count
end

-- Main access phase
function CircuitBreakerHandler:access(conf)
  local service_name = kong.service.get_name()
  
  if not service_name then
    return
  end
  
  -- Check if request should be allowed
  if not should_allow_request(service_name, conf) then
    local state = get_circuit_state(service_name)
    
    return kong.response.exit(503, {
      error = "Service temporarily unavailable",
      message = "Circuit breaker is " .. state,
      service = service_name,
      retry_after = conf.timeout
    }, {
      ["Retry-After"] = conf.timeout,
      ["X-Circuit-Breaker-State"] = state
    })
  end
  
  -- Store service name for response phase
  kong.ctx.shared.circuit_breaker_service = service_name
end

-- Response phase
function CircuitBreakerHandler:response(conf)
  local service_name = kong.ctx.shared.circuit_breaker_service
  
  if not service_name then
    return
  end
  
  local status_code = kong.response.get_status()
  
  -- Check if response indicates success or failure
  if status_code >= 200 and status_code < 400 then
    record_success(service_name, conf)
  else
    record_failure(service_name, conf)
  end
  
  -- Add circuit breaker headers
  local state = get_circuit_state(service_name)
  kong.response.set_header("X-Circuit-Breaker-State", state)
  
  if state == CIRCUIT_STATES.OPEN then
    kong.response.set_header("Retry-After", conf.timeout)
  end
end

-- Error phase
function CircuitBreakerHandler:error(conf)
  local service_name = kong.ctx.shared.circuit_breaker_service
  
  if not service_name then
    return
  end
  
  -- Record failure on error
  record_failure(service_name, conf)
  
  -- Add circuit breaker headers
  local state = get_circuit_state(service_name)
  kong.response.set_header("X-Circuit-Breaker-State", state)
  
  if state == CIRCUIT_STATES.OPEN then
    kong.response.set_header("Retry-After", conf.timeout)
  end
end

-- Timer phase for half-open state management
function CircuitBreakerHandler:timer(conf)
  -- This phase runs periodically to check circuit breaker states
  -- and transition from open to half-open when timeout expires
  
  local red = get_redis_connection()
  if not red then
    return
  end
  
  -- Get all circuit breaker keys
  local keys, err = red:keys("circuit_breaker:*")
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return
  end
  
  for _, key in ipairs(keys) do
    local service_name = key:match("circuit_breaker:(.+)")
    if service_name then
      local state = get_circuit_state(service_name)
      
      if state == CIRCUIT_STATES.OPEN then
        -- Check if timeout has expired
        local ttl, err = red:ttl(key)
        if not err and ttl <= 0 then
          -- Transition to half-open state
          set_circuit_state(service_name, CIRCUIT_STATES.HALF_OPEN, conf.timeout)
          kong.log.info("Circuit breaker transitioned to half-open for service: ", service_name)
        end
      end
    end
  end
  
  red:close()
end

return CircuitBreakerHandler
