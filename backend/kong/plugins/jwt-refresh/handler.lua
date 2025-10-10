-- JWT Refresh Plugin for Kong
-- Handles JWT token validation and refresh

local jwt = require "resty.jwt"
local cjson = require "cjson"
local redis = require "resty.redis"

local JwtRefreshHandler = {
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

-- Extract JWT token from request
local function extract_token()
  local auth_header = kong.request.get_header("Authorization")
  if not auth_header then
    return nil
  end
  
  local token = auth_header:match("Bearer%s+(.+)")
  return token
end

-- Validate JWT token
local function validate_token(token, secret)
  local jwt_obj = jwt:verify(secret, token)
  
  if not jwt_obj.valid then
    return false, jwt_obj.reason
  end
  
  return true, jwt_obj.payload
end

-- Check if token is blacklisted
local function is_token_blacklisted(token)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local res, err = red:get("blacklist:" .. ngx.md5(token))
  if err then
    kong.log.err("Redis error: ", err)
    return false
  end
  
  red:close()
  return res == "1"
end

-- Generate new JWT token
local function generate_token(payload, secret, expires_in)
  local now = os.time()
  local exp = now + (expires_in or 3600) -- Default 1 hour
  
  local new_payload = {
    iss = payload.iss,
    sub = payload.sub,
    iat = now,
    exp = exp,
    user_id = payload.user_id,
    email = payload.email,
    role = payload.role
  }
  
  local jwt_obj = jwt:sign(secret, {
    header = {
      typ = "JWT",
      alg = "HS256"
    },
    payload = new_payload
  })
  
  return jwt_obj
end

-- Store refresh token in Redis
local function store_refresh_token(user_id, refresh_token, expires_in)
  local red = get_redis_connection()
  if not red then
    return false
  end
  
  local key = "refresh_token:" .. user_id
  local ok, err = red:setex(key, expires_in or 604800, refresh_token) -- Default 7 days
  
  if not ok then
    kong.log.err("Failed to store refresh token: ", err)
    red:close()
    return false
  end
  
  red:close()
  return true
end

-- Get refresh token from Redis
local function get_refresh_token(user_id)
  local red = get_redis_connection()
  if not red then
    return nil
  end
  
  local key = "refresh_token:" .. user_id
  local res, err = red:get(key)
  
  if err then
    kong.log.err("Redis error: ", err)
    red:close()
    return nil
  end
  
  red:close()
  return res
end

-- Generate refresh token
local function generate_refresh_token()
  local random = require "resty.random"
  local str = require "resty.string"
  
  local bytes = random.bytes(32)
  return str.to_hex(bytes)
end

-- Main access phase
function JwtRefreshHandler:access(conf)
  local token = extract_token()
  
  if not token then
    return kong.response.exit(401, {
      error = "Missing or invalid token",
      message = "Authorization header required"
    })
  end
  
  -- Check if token is blacklisted
  if is_token_blacklisted(token) then
    return kong.response.exit(401, {
      error = "Token blacklisted",
      message = "Token has been revoked"
    })
  end
  
  -- Validate token
  local is_valid, payload_or_reason = validate_token(token, conf.secret)
  
  if not is_valid then
    return kong.response.exit(401, {
      error = "Invalid token",
      message = payload_or_reason
    })
  end
  
  local payload = payload_or_reason
  
  -- Check if token is about to expire (within 5 minutes)
  local now = os.time()
  local exp = payload.exp
  local time_until_expiry = exp - now
  
  if time_until_expiry < 300 then -- 5 minutes
    -- Generate new token
    local new_token = generate_token(payload, conf.secret, conf.token_expires_in)
    local refresh_token = generate_refresh_token()
    
    -- Store refresh token
    if store_refresh_token(payload.user_id, refresh_token, conf.refresh_expires_in) then
      -- Add new token to response headers
      kong.response.set_header("X-New-Token", new_token)
      kong.response.set_header("X-Refresh-Token", refresh_token)
    end
  end
  
  -- Add user info to request headers
  kong.service.request.set_header("X-User-ID", payload.user_id or "")
  kong.service.request.set_header("X-User-Email", payload.email or "")
  kong.service.request.set_header("X-User-Role", payload.role or "")
  
  -- Log successful authentication
  kong.log.info("User authenticated: ", payload.user_id)
end

-- Handle token refresh endpoint
function JwtRefreshHandler:rewrite(conf)
  local path = kong.request.get_path()
  
  if path == "/api/v1/auth/refresh" then
    local refresh_token = kong.request.get_header("X-Refresh-Token")
    local user_id = kong.request.get_header("X-User-ID")
    
    if not refresh_token or not user_id then
      return kong.response.exit(400, {
        error = "Missing refresh token or user ID"
      })
    end
    
    -- Validate refresh token
    local stored_token = get_refresh_token(user_id)
    if not stored_token or stored_token ~= refresh_token then
      return kong.response.exit(401, {
        error = "Invalid refresh token"
      })
    end
    
    -- Generate new access token
    local payload = {
      iss = "writewave",
      sub = user_id,
      user_id = user_id,
      email = kong.request.get_header("X-User-Email"),
      role = kong.request.get_header("X-User-Role")
    }
    
    local new_token = generate_token(payload, conf.secret, conf.token_expires_in)
    local new_refresh_token = generate_refresh_token()
    
    -- Store new refresh token
    if store_refresh_token(user_id, new_refresh_token, conf.refresh_expires_in) then
      return kong.response.exit(200, {
        access_token = new_token,
        refresh_token = new_refresh_token,
        expires_in = conf.token_expires_in
      })
    else
      return kong.response.exit(500, {
        error = "Failed to store refresh token"
      })
    end
  end
end

-- Handle token blacklisting on logout
function JwtRefreshHandler:response(conf)
  local path = kong.request.get_path()
  
  if path == "/api/v1/auth/logout" then
    local token = extract_token()
    if token then
      -- Blacklist the token
      local red = get_redis_connection()
      if red then
        local exp = os.time() + 3600 -- 1 hour
        red:setex("blacklist:" .. ngx.md5(token), exp, "1")
        red:close()
      end
    end
  end
end

return JwtRefreshHandler
