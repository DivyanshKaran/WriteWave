-- Advanced Rate Limiting Plugin for Kong
-- Implements per-user and per-IP rate limiting with Redis

local cjson = require "cjson"
local redis = require "resty.redis"

local RateLimitingAdvancedHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
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

-- Get user ID from JWT token
local function get_user_id()
  local user_id = kong.request.get_header("X-User-ID")
  if user_id and user_id ~= "" then
    return user_id
  end
  
  -- Try to extract from JWT token
  local auth_header = kong.request.get_header("Authorization")
  if auth_header then
    local token = auth_header:match("Bearer%s+(.+)")
    if token then
      -- Decode JWT payload (simplified)
      local payload = ngx.decode_base64(token:match("%.([^%.]+)"))
      if payload then
        local decoded = cjson.decode(payload)
        return decoded.user_id or decoded.sub
      end
    end
  end
  
  return nil
end

-- Get client IP
local function get_client_ip()
  local ip = kong.request.get_header("X-Forwarded-For")
  if not ip then
    ip = kong.request.get_header("X-Real-IP")
  end
  if not ip then
    ip = kong.client.get_forwarded_ip()
  end
  return ip or "unknown"
end

-- Get rate limit key
local function get_rate_limit_key(identifier, window, service_name)
  local timestamp = math.floor(os.time() / window)
  return string.format("rate_limit:%s:%s:%d", service_name, identifier, timestamp)
end

-- Check rate limit
local function check_rate_limit(identifier, limit, window, service_name)
  local red = get_redis_connection()
  if not red then
    return true, 0, 0 -- Allow if Redis is unavailable
  end
  
  local key = get_rate_limit_key(identifier, window, service_name)
  local current, err = red:get(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return true, 0, 0
  end
  
  current = tonumber(current) or 0
  
  if current >= limit then
    red:close()
    return false, current, limit
  end
  
  -- Increment counter
  local new_count, err = red:incr(key)
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return true, 0, 0
  end
  
  -- Set expiration on first increment
  if new_count == 1 then
    red:expire(key, window)
  end
  
  red:close()
  return true, new_count, limit
end

-- Get rate limit headers
local function get_rate_limit_headers(current, limit, window)
  local remaining = math.max(0, limit - current)
  local reset_time = os.time() + window
  
  return {
    ["X-RateLimit-Limit"] = limit,
    ["X-RateLimit-Remaining"] = remaining,
    ["X-RateLimit-Reset"] = reset_time,
    ["X-RateLimit-Window"] = window
  }
end

-- Main access phase
function RateLimitingAdvancedHandler:access(conf)
  local service_name = kong.service.get_name()
  local user_id = get_user_id()
  local client_ip = get_client_ip()
  
  -- Check user rate limit if user is authenticated
  if user_id then
    local allowed, current, limit = check_rate_limit(
      "user:" .. user_id,
      conf.user_limit_per_minute,
      60, -- 1 minute window
      service_name
    )
    
    if not allowed then
      local headers = get_rate_limit_headers(current, limit, 60)
      headers["X-RateLimit-Type"] = "user"
      
      return kong.response.exit(429, {
        error = "Rate limit exceeded",
        message = "User rate limit exceeded",
        limit = limit,
        current = current,
        reset_time = headers["X-RateLimit-Reset"]
      }, headers)
    end
    
    -- Add user rate limit headers
    local headers = get_rate_limit_headers(current, limit, 60)
    headers["X-RateLimit-Type"] = "user"
    
    for name, value in pairs(headers) do
      kong.response.set_header(name, value)
    end
  end
  
  -- Check IP rate limit
  local allowed, current, limit = check_rate_limit(
    "ip:" .. client_ip,
    conf.ip_limit_per_minute,
    60, -- 1 minute window
    service_name
  )
  
  if not allowed then
    local headers = get_rate_limit_headers(current, limit, 60)
    headers["X-RateLimit-Type"] = "ip"
    
    return kong.response.exit(429, {
      error = "Rate limit exceeded",
      message = "IP rate limit exceeded",
      limit = limit,
      current = current,
      reset_time = headers["X-RateLimit-Reset"]
    }, headers)
  end
  
  -- Add IP rate limit headers
  local headers = get_rate_limit_headers(current, limit, 60)
  headers["X-RateLimit-Type"] = "ip"
  
  for name, value in pairs(headers) do
    kong.response.set_header(name, value)
  end
  
  -- Store rate limit info for response phase
  kong.ctx.shared.rate_limit_info = {
    user_id = user_id,
    client_ip = client_ip,
    service_name = service_name
  }
end

-- Response phase
function RateLimitingAdvancedHandler:response(conf)
  local rate_limit_info = kong.ctx.shared.rate_limit_info
  
  if not rate_limit_info then
    return
  end
  
  -- Log rate limit usage
  local red = get_redis_connection()
  if red then
    local log_key = string.format("rate_limit_log:%s:%d", 
      rate_limit_info.service_name, 
      math.floor(os.time() / 60)
    )
    
    local log_data = {
      timestamp = os.time(),
      user_id = rate_limit_info.user_id,
      client_ip = rate_limit_info.client_ip,
      service_name = rate_limit_info.service_name,
      status_code = kong.response.get_status()
    }
    
    red:lpush(log_key, cjson.encode(log_data))
    red:expire(log_key, 3600) -- Keep logs for 1 hour
    red:close()
  end
end

-- Error phase
function RateLimitingAdvancedHandler:error(conf)
  local rate_limit_info = kong.ctx.shared.rate_limit_info
  
  if not rate_limit_info then
    return
  end
  
  -- Log rate limit error
  local red = get_redis_connection()
  if red then
    local log_key = string.format("rate_limit_error:%s:%d", 
      rate_limit_info.service_name, 
      math.floor(os.time() / 60)
    )
    
    local log_data = {
      timestamp = os.time(),
      user_id = rate_limit_info.user_id,
      client_ip = rate_limit_info.client_ip,
      service_name = rate_limit_info.service_name,
      error = "Rate limit exceeded"
    }
    
    red:lpush(log_key, cjson.encode(log_data))
    red:expire(log_key, 3600) -- Keep logs for 1 hour
    red:close()
  end
end

return RateLimitingAdvancedHandler
