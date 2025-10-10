-- Advanced CORS Plugin for Kong
-- Handles CORS with advanced configuration for frontend

local cjson = require "cjson"

local CorsAdvancedHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
}

-- Get origin from request
local function get_origin()
  return kong.request.get_header("Origin")
end

-- Check if origin is allowed
local function is_origin_allowed(origin, allowed_origins)
  if not origin then
    return false
  end
  
  -- Check exact match
  for _, allowed in ipairs(allowed_origins) do
    if origin == allowed then
      return true
    end
  end
  
  -- Check wildcard patterns
  for _, allowed in ipairs(allowed_origins) do
    if allowed:match("%*") then
      local pattern = allowed:gsub("%*", ".*")
      if origin:match("^" .. pattern .. "$") then
        return true
      end
    end
  end
  
  return false
end

-- Get allowed methods
local function get_allowed_methods(conf)
  local methods = {}
  
  for _, method in ipairs(conf.methods) do
    table.insert(methods, method:upper())
  end
  
  return table.concat(methods, ", ")
end

-- Get allowed headers
local function get_allowed_headers(conf)
  local headers = {}
  
  for _, header in ipairs(conf.headers) do
    table.insert(headers, header)
  end
  
  return table.concat(headers, ", ")
end

-- Get exposed headers
local function get_exposed_headers(conf)
  if not conf.exposed_headers or #conf.exposed_headers == 0 then
    return nil
  end
  
  return table.concat(conf.exposed_headers, ", ")
end

-- Handle preflight request
local function handle_preflight_request(conf, origin)
  if not is_origin_allowed(origin, conf.origins) then
    return kong.response.exit(403, {
      error = "CORS policy violation",
      message = "Origin not allowed"
    })
  end
  
  -- Set CORS headers
  kong.response.set_header("Access-Control-Allow-Origin", origin)
  kong.response.set_header("Access-Control-Allow-Methods", get_allowed_methods(conf))
  kong.response.set_header("Access-Control-Allow-Headers", get_allowed_headers(conf))
  
  if conf.credentials then
    kong.response.set_header("Access-Control-Allow-Credentials", "true")
  end
  
  if conf.max_age then
    kong.response.set_header("Access-Control-Max-Age", conf.max_age)
  end
  
  local exposed_headers = get_exposed_headers(conf)
  if exposed_headers then
    kong.response.set_header("Access-Control-Expose-Headers", exposed_headers)
  end
  
  -- Return 204 No Content for preflight
  return kong.response.exit(204)
end

-- Handle actual request
local function handle_actual_request(conf, origin)
  if not is_origin_allowed(origin, conf.origins) then
    return kong.response.exit(403, {
      error = "CORS policy violation",
      message = "Origin not allowed"
    })
  end
  
  -- Set CORS headers
  kong.response.set_header("Access-Control-Allow-Origin", origin)
  
  if conf.credentials then
    kong.response.set_header("Access-Control-Allow-Credentials", "true")
  end
  
  local exposed_headers = get_exposed_headers(conf)
  if exposed_headers then
    kong.response.set_header("Access-Control-Expose-Headers", exposed_headers)
  end
end

-- Main access phase
function CorsAdvancedHandler:access(conf)
  local origin = get_origin()
  local method = kong.request.get_method()
  
  -- Handle preflight requests
  if method == "OPTIONS" then
    return handle_preflight_request(conf, origin)
  end
  
  -- Handle actual requests
  if origin then
    handle_actual_request(conf, origin)
  end
  
  -- Store origin for response phase
  kong.ctx.shared.cors_origin = origin
end

-- Response phase
function CorsAdvancedHandler:response(conf)
  local origin = kong.ctx.shared.cors_origin
  
  if not origin then
    return
  end
  
  -- Ensure CORS headers are set
  if not is_origin_allowed(origin, conf.origins) then
    return
  end
  
  -- Set CORS headers
  kong.response.set_header("Access-Control-Allow-Origin", origin)
  
  if conf.credentials then
    kong.response.set_header("Access-Control-Allow-Credentials", "true")
  end
  
  local exposed_headers = get_exposed_headers(conf)
  if exposed_headers then
    kong.response.set_header("Access-Control-Expose-Headers", exposed_headers)
  end
end

-- Error phase
function CorsAdvancedHandler:error(conf)
  local origin = kong.ctx.shared.cors_origin
  
  if not origin then
    return
  end
  
  -- Set CORS headers even for errors
  if is_origin_allowed(origin, conf.origins) then
    kong.response.set_header("Access-Control-Allow-Origin", origin)
    
    if conf.credentials then
      kong.response.set_header("Access-Control-Allow-Credentials", "true")
    end
  end
end

return CorsAdvancedHandler
