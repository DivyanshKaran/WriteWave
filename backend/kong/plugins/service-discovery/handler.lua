-- Service Discovery Plugin for Kong
-- Handles dynamic service discovery and load balancing

local cjson = require "cjson"
local redis = require "resty.redis"

local ServiceDiscoveryHandler = {
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

-- Get service instances from Redis
local function get_service_instances(service_name)
  local red = get_redis_connection()
  if not red then
    return nil
  end
  
  local key = "service_instances:" .. service_name
  local instances, err = red:smembers(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return nil
  end
  
  red:close()
  return instances
end

-- Get healthy service instances
local function get_healthy_instances(service_name)
  local red = get_redis_connection()
  if not red then
    return nil
  end
  
  local key = "healthy_instances:" .. service_name
  local instances, err = red:smembers(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return nil
  end
  
  red:close()
  return instances
end

-- Select instance using round-robin
local function select_instance_round_robin(instances)
  if not instances or #instances == 0 then
    return nil
  end
  
  local key = "round_robin_index"
  local red = get_redis_connection()
  if not red then
    return instances[1]
  end
  
  local index, err = red:incr(key)
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return instances[1]
  end
  
  red:close()
  return instances[((index - 1) % #instances) + 1]
end

-- Select instance using least connections
local function select_instance_least_connections(instances)
  if not instances or #instances == 0 then
    return nil
  end
  
  local red = get_redis_connection()
  if not red then
    return instances[1]
  end
  
  local min_connections = math.huge
  local selected_instance = instances[1]
  
  for _, instance in ipairs(instances) do
    local key = "connections:" .. instance
    local connections, err = red:get(key)
    
    if not err and connections then
      local count = tonumber(connections) or 0
      if count < min_connections then
        min_connections = count
        selected_instance = instance
      end
    end
  end
  
  red:close()
  return selected_instance
end

-- Select instance using weighted round-robin
local function select_instance_weighted_round_robin(instances, weights)
  if not instances or #instances == 0 then
    return nil
  end
  
  local total_weight = 0
  for _, weight in ipairs(weights) do
    total_weight = total_weight + weight
  end
  
  if total_weight == 0 then
    return instances[1]
  end
  
  local random = math.random() * total_weight
  local current_weight = 0
  
  for i, weight in ipairs(weights) do
    current_weight = current_weight + weight
    if random <= current_weight then
      return instances[i]
    end
  end
  
  return instances[#instances]
end

-- Register service instance
local function register_service_instance(service_name, instance_url, health_check_url)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "service_instances:" .. service_name
  local ok, err = red:sadd(key, instance_url)
  
  if not ok then
    kong.log.err("Failed to register service instance: ", err)
    red:close()
    return false
  end
  
  -- Set expiration for service instance
  red:expire(key, 300) -- 5 minutes
  
  -- Store health check URL
  local health_key = "health_check:" .. instance_url
  red:setex(health_key, 300, health_check_url or instance_url .. "/health")
  
  red:close()
  return true
end

-- Unregister service instance
local function unregister_service_instance(service_name, instance_url)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "service_instances:" .. service_name
  local ok, err = red:srem(key, instance_url)
  
  if not ok then
    kong.log.err("Failed to unregister service instance: ", err)
    red:close()
    return false
  end
  
  -- Remove from healthy instances
  local healthy_key = "healthy_instances:" .. service_name
  red:srem(healthy_key, instance_url)
  
  -- Remove health check URL
  local health_key = "health_check:" .. instance_url
  red:del(health_key)
  
  red:close()
  return true
end

-- Health check service instance
local function health_check_instance(instance_url)
  local http = require "resty.http"
  local httpc = http.new()
  
  local res, err = httpc:request_uri(instance_url .. "/health", {
    method = "GET",
    timeout = 5000,
    headers = {
      ["User-Agent"] = "Kong-Service-Discovery/1.0"
    }
  })
  
  if not res then
    return false, err
  end
  
  return res.status == 200, res.status
end

-- Update service health status
local function update_service_health(service_name, instance_url, is_healthy)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "healthy_instances:" .. service_name
  
  if is_healthy then
    red:sadd(key, instance_url)
  else
    red:srem(key, instance_url)
  end
  
  red:expire(key, 300) -- 5 minutes
  red:close()
  return true
end

-- Main access phase
function ServiceDiscoveryHandler:access(conf)
  local service_name = kong.service.get_name()
  
  if not service_name then
    return
  end
  
  -- Get service instances
  local instances = get_service_instances(service_name)
  
  if not instances or #instances == 0 then
    kong.log.warn("No service instances found for: ", service_name)
    return
  end
  
  -- Get healthy instances
  local healthy_instances = get_healthy_instances(service_name)
  
  if not healthy_instances or #healthy_instances == 0 then
    kong.log.warn("No healthy service instances found for: ", service_name)
    healthy_instances = instances
  end
  
  -- Select instance based on strategy
  local selected_instance = nil
  
  if conf.load_balancing_strategy == "round_robin" then
    selected_instance = select_instance_round_robin(healthy_instances)
  elseif conf.load_balancing_strategy == "least_connections" then
    selected_instance = select_instance_least_connections(healthy_instances)
  elseif conf.load_balancing_strategy == "weighted_round_robin" then
    selected_instance = select_instance_weighted_round_robin(healthy_instances, conf.instance_weights)
  else
    selected_instance = healthy_instances[1]
  end
  
  if not selected_instance then
    kong.log.err("Failed to select service instance for: ", service_name)
    return kong.response.exit(503, {
      error = "Service unavailable",
      message = "No healthy service instances available"
    })
  end
  
  -- Update the service URL
  kong.service.set_target(selected_instance)
  
  -- Store selected instance for response phase
  kong.ctx.shared.selected_instance = selected_instance
  
  -- Increment connection count
  local red = get_redis_connection()
  if red then
    local key = "connections:" .. selected_instance
    red:incr(key)
    red:expire(key, 300) -- 5 minutes
    red:close()
  end
  
  kong.log.info("Selected service instance: ", selected_instance, " for service: ", service_name)
end

-- Response phase
function ServiceDiscoveryHandler:response(conf)
  local selected_instance = kong.ctx.shared.selected_instance
  
  if not selected_instance then
    return
  end
  
  -- Decrement connection count
  local red = get_redis_connection()
  if red then
    local key = "connections:" .. selected_instance
    red:decr(key)
    red:expire(key, 300) -- 5 minutes
    red:close()
  end
  
  -- Add service instance header
  kong.response.set_header("X-Service-Instance", selected_instance)
end

-- Error phase
function ServiceDiscoveryHandler:error(conf)
  local selected_instance = kong.ctx.shared.selected_instance
  
  if not selected_instance then
    return
  end
  
  -- Decrement connection count
  local red = get_redis_connection()
  if red then
    local key = "connections:" .. selected_instance
    red:decr(key)
    red:expire(key, 300) -- 5 minutes
    red:close()
  end
  
  -- Mark instance as unhealthy if error
  local status_code = kong.response.get_status()
  if status_code >= 500 then
    update_service_health(kong.service.get_name(), selected_instance, false)
  end
end

-- Timer phase for health checks
function ServiceDiscoveryHandler:timer(conf)
  if not conf.enable_health_checks then
    return
  end
  
  local red = get_redis_connection()
  if not red then
    return
  end
  
  -- Get all service instances
  local keys, err = red:keys("service_instances:*")
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return
  end
  
  for _, key in ipairs(keys) do
    local service_name = key:match("service_instances:(.+)")
    if service_name then
      local instances, err = red:smembers(key)
      if not err and instances then
        for _, instance in ipairs(instances) do
          local health_key = "health_check:" .. instance
          local health_url, err = red:get(health_key)
          
          if not err and health_url then
            local is_healthy, status = health_check_instance(health_url)
            update_service_health(service_name, instance, is_healthy)
            
            if not is_healthy then
              kong.log.warn("Service instance unhealthy: ", instance, " status: ", status)
            end
          end
        end
      end
    end
  end
  
  red:close()
end

return ServiceDiscoveryHandler
