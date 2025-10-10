-- Request Logging Plugin for Kong
-- Logs all requests and responses with detailed information

local cjson = require "cjson"
local redis = require "resty.redis"

local RequestLoggingHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
}

-- Redis connection for logging
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

-- Get client IP address
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

-- Get user agent
local function get_user_agent()
  return kong.request.get_header("User-Agent") or "unknown"
end

-- Get request size
local function get_request_size()
  local content_length = kong.request.get_header("Content-Length")
  if content_length then
    return tonumber(content_length) or 0
  end
  return 0
end

-- Get response size
local function get_response_size()
  local content_length = kong.response.get_header("Content-Length")
  if content_length then
    return tonumber(content_length) or 0
  end
  return 0
end

-- Sanitize sensitive data
local function sanitize_data(data)
  if type(data) == "table" then
    local sanitized = {}
    for k, v in pairs(data) do
      if k:lower():match("password") or k:lower():match("token") or k:lower():match("secret") then
        sanitized[k] = "[REDACTED]"
      else
        sanitized[k] = sanitize_data(v)
      end
    end
    return sanitized
  end
  return data
end

-- Log to Redis
local function log_to_redis(log_data)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "logs:" .. os.date("%Y-%m-%d:%H")
  local log_json = cjson.encode(log_data)
  
  local ok, err = red:lpush(key, log_json)
  if not ok then
    kong.log.err("Failed to log to Redis: ", err)
    red:close()
    return false
  end
  
  -- Set expiration for log keys (7 days)
  red:expire(key, 604800)
  red:close()
  return true
end

-- Log to file
local function log_to_file(log_data)
  local log_json = cjson.encode(log_data)
  kong.log.info(log_json)
end

-- Main access phase
function RequestLoggingHandler:access(conf)
  local start_time = ngx.now()
  
  -- Store start time for response phase
  kong.ctx.shared.start_time = start_time
  
  -- Get request information
  local request_info = {
    timestamp = os.time(),
    method = kong.request.get_method(),
    path = kong.request.get_path(),
    query_string = kong.request.get_query(),
    headers = sanitize_data(kong.request.get_headers()),
    client_ip = get_client_ip(),
    user_agent = get_user_agent(),
    request_size = get_request_size(),
    service_name = kong.service.get_name(),
    route_name = kong.router.get_route().name,
    kong_request_id = kong.request.get_id()
  }
  
  -- Store request info for response phase
  kong.ctx.shared.request_info = request_info
  
  -- Log request if enabled
  if conf.log_requests then
    local log_data = {
      type = "request",
      data = request_info
    }
    
    if conf.log_to_redis then
      log_to_redis(log_data)
    end
    
    if conf.log_to_file then
      log_to_file(log_data)
    end
  end
end

-- Response phase
function RequestLoggingHandler:response(conf)
  local start_time = kong.ctx.shared.start_time
  local request_info = kong.ctx.shared.request_info
  
  if not start_time or not request_info then
    return
  end
  
  local end_time = ngx.now()
  local response_time = (end_time - start_time) * 1000 -- Convert to milliseconds
  
  -- Get response information
  local response_info = {
    timestamp = os.time(),
    status_code = kong.response.get_status(),
    headers = sanitize_data(kong.response.get_headers()),
    response_size = get_response_size(),
    response_time = response_time,
    upstream_response_time = kong.service.response.get_upstream_time(),
    upstream_status = kong.service.response.get_upstream_status()
  }
  
  -- Combine request and response info
  local log_data = {
    type = "request_response",
    request = request_info,
    response = response_info,
    total_time = response_time
  }
  
  -- Log response if enabled
  if conf.log_responses then
    if conf.log_to_redis then
      log_to_redis(log_data)
    end
    
    if conf.log_to_file then
      log_to_file(log_data)
    end
  end
  
  -- Log errors if status code indicates error
  if response_info.status_code >= 400 then
    local error_log = {
      type = "error",
      request = request_info,
      response = response_info,
      error_message = "HTTP " .. response_info.status_code
    }
    
    if conf.log_to_redis then
      log_to_redis(error_log)
    end
    
    if conf.log_to_file then
      log_to_file(error_log)
    end
  end
  
  -- Add response time header
  if conf.add_response_time_header then
    kong.response.set_header("X-Response-Time", string.format("%.2f", response_time))
  end
end

-- Error phase
function RequestLoggingHandler:error(conf)
  local start_time = kong.ctx.shared.start_time
  local request_info = kong.ctx.shared.request_info
  
  if not start_time or not request_info then
    return
  end
  
  local end_time = ngx.now()
  local response_time = (end_time - start_time) * 1000
  
  -- Get error information
  local error_info = {
    timestamp = os.time(),
    error_message = "Request failed",
    response_time = response_time,
    status_code = kong.response.get_status() or 500
  }
  
  -- Log error
  local log_data = {
    type = "error",
    request = request_info,
    error = error_info
  }
  
  if conf.log_to_redis then
    log_to_redis(log_data)
  end
  
  if conf.log_to_file then
    log_to_file(log_data)
  end
end

return RequestLoggingHandler
