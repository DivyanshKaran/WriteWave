-- Error Handler Plugin for Kong
-- Custom error handling middleware

local cjson = require "cjson"

local ErrorHandlerHandler = {
  PRIORITY = 1000,
  VERSION = "1.0.0"
}

-- Error response templates
local ERROR_TEMPLATES = {
  [400] = {
    error = "Bad Request",
    message = "The request could not be understood by the server due to malformed syntax"
  },
  [401] = {
    error = "Unauthorized",
    message = "Authentication is required to access this resource"
  },
  [403] = {
    error = "Forbidden",
    message = "You do not have permission to access this resource"
  },
  [404] = {
    error = "Not Found",
    message = "The requested resource was not found"
  },
  [405] = {
    error = "Method Not Allowed",
    message = "The request method is not supported for this resource"
  },
  [408] = {
    error = "Request Timeout",
    message = "The request took too long to process"
  },
  [409] = {
    error = "Conflict",
    message = "The request could not be completed due to a conflict"
  },
  [410] = {
    error = "Gone",
    message = "The requested resource is no longer available"
  },
  [411] = {
    error = "Length Required",
    message = "The request requires a Content-Length header"
  },
  [412] = {
    error = "Precondition Failed",
    message = "The precondition given in the request was not met"
  },
  [413] = {
    error = "Payload Too Large",
    message = "The request payload is too large"
  },
  [414] = {
    error = "URI Too Long",
    message = "The request URI is too long"
  },
  [415] = {
    error = "Unsupported Media Type",
    message = "The request media type is not supported"
  },
  [416] = {
    error = "Range Not Satisfiable",
    message = "The requested range cannot be satisfied"
  },
  [417] = {
    error = "Expectation Failed",
    message = "The expectation given in the request could not be met"
  },
  [418] = {
    error = "I'm a teapot",
    message = "The server refuses to brew coffee because it is a teapot"
  },
  [421] = {
    error = "Misdirected Request",
    message = "The request was directed to a server that is not able to produce a response"
  },
  [422] = {
    error = "Unprocessable Entity",
    message = "The request was well-formed but contains semantic errors"
  },
  [423] = {
    error = "Locked",
    message = "The resource is locked"
  },
  [424] = {
    error = "Failed Dependency",
    message = "The request failed due to failure of a previous request"
  },
  [425] = {
    error = "Too Early",
    message = "The server is unwilling to risk processing a request that might be replayed"
  },
  [426] = {
    error = "Upgrade Required",
    message = "The server requires an upgrade to handle the request"
  },
  [428] = {
    error = "Precondition Required",
    message = "The server requires the request to be conditional"
  },
  [429] = {
    error = "Too Many Requests",
    message = "Rate limit exceeded. Please try again later"
  },
  [431] = {
    error = "Request Header Fields Too Large",
    message = "The request header fields are too large"
  },
  [451] = {
    error = "Unavailable For Legal Reasons",
    message = "The resource is unavailable for legal reasons"
  },
  [500] = {
    error = "Internal Server Error",
    message = "An unexpected error occurred on the server"
  },
  [501] = {
    error = "Not Implemented",
    message = "The server does not support the functionality required to fulfill the request"
  },
  [502] = {
    error = "Bad Gateway",
    message = "The server received an invalid response from an upstream server"
  },
  [503] = {
    error = "Service Unavailable",
    message = "The server is temporarily unable to handle the request"
  },
  [504] = {
    error = "Gateway Timeout",
    message = "The server did not receive a timely response from an upstream server"
  },
  [505] = {
    error = "HTTP Version Not Supported",
    message = "The server does not support the HTTP protocol version used in the request"
  },
  [506] = {
    error = "Variant Also Negotiates",
    message = "The server has an internal configuration error"
  },
  [507] = {
    error = "Insufficient Storage",
    message = "The server is unable to store the representation needed to complete the request"
  },
  [508] = {
    error = "Loop Detected",
    message = "The server detected an infinite loop while processing the request"
  },
  [510] = {
    error = "Not Extended",
    message = "Further extensions to the request are required for the server to fulfill it"
  },
  [511] = {
    error = "Network Authentication Required",
    message = "The client needs to authenticate to gain network access"
  }
}

-- Get error template
local function get_error_template(status_code)
  return ERROR_TEMPLATES[status_code] or {
    error = "Unknown Error",
    message = "An unknown error occurred"
  }
}

-- Create error response
local function create_error_response(status_code, config, request_info)
  local template = get_error_template(status_code)
  local response = {
    error = template.error,
    message = template.message,
    status_code = status_code,
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    request_id = kong.request.get_id()
  }
  
  if config.include_request_details then
    response.request = {
      method = kong.request.get_method(),
      path = kong.request.get_path(),
      query = kong.request.get_query(),
      headers = kong.request.get_headers(),
      client_ip = kong.client.get_forwarded_ip(),
      user_agent = kong.request.get_header("User-Agent")
    }
  end
  
  if config.include_service_info then
    response.service = {
      name = kong.service.get_name(),
      route = kong.router.get_route().name
    }
  end
  
  if config.include_trace_id then
    response.trace_id = kong.request.get_header("X-Trace-ID")
  end
  
  return response
end

-- Log error
local function log_error(status_code, config, request_info)
  if not config.log_errors then
    return
  end
  
  local error_log = {
    timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
    level = "error",
    status_code = status_code,
    request_id = kong.request.get_id(),
    method = kong.request.get_method(),
    path = kong.request.get_path(),
    client_ip = kong.client.get_forwarded_ip(),
    user_agent = kong.request.get_header("User-Agent"),
    service_name = kong.service.get_name(),
    route_name = kong.router.get_route().name
  }
  
  if config.log_to_redis then
    -- Log to Redis (implement if needed)
    kong.log.err("Error logged to Redis: ", cjson.encode(error_log))
  end
  
  if config.log_to_file then
    kong.log.err("Error: ", cjson.encode(error_log))
  end
end

-- Main access phase
function ErrorHandlerHandler:access(conf)
  -- Store configuration for later phases
  kong.ctx.shared.error_handler_config = conf
end

-- Response phase
function ErrorHandlerHandler:response(conf)
  local status_code = kong.response.get_status()
  
  -- Only handle error status codes
  if status_code < 400 then
    return
  end
  
  local config = kong.ctx.shared.error_handler_config or conf
  
  -- Create error response
  local error_response = create_error_response(status_code, config, {})
  
  -- Log error
  log_error(status_code, config, {})
  
  -- Set error response
  kong.response.set_status(status_code)
  kong.response.set_header("Content-Type", "application/json")
  kong.response.set_header("X-Error-Handled", "true")
  kong.response.set_header("X-Request-ID", error_response.request_id)
  
  -- Return error response
  return kong.response.exit(status_code, error_response)
end

-- Error phase
function ErrorHandlerHandler:error(conf)
  local status_code = kong.response.get_status() or 500
  local config = kong.ctx.shared.error_handler_config or conf
  
  -- Create error response
  local error_response = create_error_response(status_code, config, {})
  
  -- Log error
  log_error(status_code, config, {})
  
  -- Set error response
  kong.response.set_status(status_code)
  kong.response.set_header("Content-Type", "application/json")
  kong.response.set_header("X-Error-Handled", "true")
  kong.response.set_header("X-Request-ID", error_response.request_id)
  
  -- Return error response
  return kong.response.exit(status_code, error_response)
end

return ErrorHandlerHandler
