-- API Versioning Plugin for Kong
-- Handles API versioning with v1, v2 support

local cjson = require "cjson"

local ApiVersioningHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
}

-- Get API version from request
local function get_api_version()
  -- Check URL path first
  local path = kong.request.get_path()
  local version = path:match("/api/v(%d+)/")
  if version then
    return tonumber(version)
  end
  
  -- Check Accept header
  local accept = kong.request.get_header("Accept")
  if accept then
    local version = accept:match("version=(%d+)")
    if version then
      return tonumber(version)
    end
  end
  
  -- Check custom header
  local version_header = kong.request.get_header("X-API-Version")
  if version_header then
    local version = version_header:match("v(%d+)")
    if version then
      return tonumber(version)
    end
  end
  
  -- Default to v1
  return 1
end

-- Get versioned service URL
local function get_versioned_service_url(version, base_url)
  if version == 2 then
    return base_url:gsub(":8001", ":8001-v2")
             :gsub(":8002", ":8002-v2")
             :gsub(":8003", ":8003-v2")
             :gsub(":8004", ":8004-v2")
             :gsub(":8005", ":8005-v2")
             :gsub(":8006", ":8006-v2")
  end
  
  return base_url
end

-- Transform request for version compatibility
local function transform_request(version, request_data)
  if version == 2 then
    -- Transform v1 request to v2 format
    local transformed = {}
    
    -- Add version-specific headers
    transformed.headers = request_data.headers or {}
    transformed.headers["X-API-Version"] = "v2"
    transformed.headers["X-Request-Version"] = "v2"
    
    -- Transform request body if present
    if request_data.body then
      local body = cjson.decode(request_data.body)
      if body then
        -- Add version-specific fields
        body.api_version = "v2"
        body.request_timestamp = os.time()
        transformed.body = cjson.encode(body)
      end
    end
    
    return transformed
  end
  
  return request_data
end

-- Transform response for version compatibility
local function transform_response(version, response_data)
  if version == 2 then
    -- Transform v2 response to v1 format if needed
    local transformed = {}
    
    -- Add version-specific headers
    transformed.headers = response_data.headers or {}
    transformed.headers["X-API-Version"] = "v2"
    transformed.headers["X-Response-Version"] = "v2"
    
    -- Transform response body if present
    if response_data.body then
      local body = cjson.decode(response_data.body)
      if body then
        -- Add version-specific fields
        body.api_version = "v2"
        body.response_timestamp = os.time()
        transformed.body = cjson.encode(body)
      end
    end
    
    return transformed
  end
  
  return response_data
end

-- Main access phase
function ApiVersioningHandler:access(conf)
  local version = get_api_version()
  
  -- Store version for later phases
  kong.ctx.shared.api_version = version
  
  -- Add version headers
  kong.service.request.set_header("X-API-Version", "v" .. version)
  kong.service.request.set_header("X-Request-Version", "v" .. version)
  
  -- Transform request if needed
  if conf.transform_requests then
    local request_data = {
      headers = kong.request.get_headers(),
      body = kong.request.get_raw_body()
    }
    
    local transformed = transform_request(version, request_data)
    
    -- Apply transformed headers
    if transformed.headers then
      for name, value in pairs(transformed.headers) do
        kong.service.request.set_header(name, value)
      end
    end
    
    -- Apply transformed body
    if transformed.body then
      kong.service.request.set_header("Content-Length", #transformed.body)
      kong.ctx.shared.transformed_body = transformed.body
    end
  end
  
  -- Log version usage
  kong.log.info("API version ", version, " requested for ", kong.request.get_path())
end

-- Response phase
function ApiVersioningHandler:response(conf)
  local version = kong.ctx.shared.api_version
  
  if not version then
    return
  end
  
  -- Add version headers to response
  kong.response.set_header("X-API-Version", "v" .. version)
  kong.response.set_header("X-Response-Version", "v" .. version)
  
  -- Transform response if needed
  if conf.transform_responses then
    local response_data = {
      headers = kong.response.get_headers(),
      body = kong.response.get_raw_body()
    }
    
    local transformed = transform_response(version, response_data)
    
    -- Apply transformed headers
    if transformed.headers then
      for name, value in pairs(transformed.headers) do
        kong.response.set_header(name, value)
      end
    end
    
    -- Apply transformed body
    if transformed.body then
      kong.response.set_header("Content-Length", #transformed.body)
      kong.ctx.shared.transformed_response_body = transformed.body
    end
  end
  
  -- Log version response
  kong.log.info("API version ", version, " response for ", kong.request.get_path())
end

-- Error phase
function ApiVersioningHandler:error(conf)
  local version = kong.ctx.shared.api_version
  
  if not version then
    return
  end
  
  -- Add version headers to error response
  kong.response.set_header("X-API-Version", "v" .. version)
  kong.response.set_header("X-Response-Version", "v" .. version)
  
  -- Log version error
  kong.log.err("API version ", version, " error for ", kong.request.get_path())
end

return ApiVersioningHandler
