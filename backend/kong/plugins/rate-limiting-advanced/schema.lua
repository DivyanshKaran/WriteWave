-- Schema for Advanced Rate Limiting Plugin

return {
  name = "rate-limiting-advanced",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            user_limit_per_minute = {
              type = "number",
              required = true,
              default = 100,
              description = "Rate limit per user per minute"
            }
          },
          {
            ip_limit_per_minute = {
              type = "number",
              required = true,
              default = 1000,
              description = "Rate limit per IP per minute"
            }
          },
          {
            user_limit_per_hour = {
              type = "number",
              required = true,
              default = 1000,
              description = "Rate limit per user per hour"
            }
          },
          {
            ip_limit_per_hour = {
              type = "number",
              required = true,
              default = 10000,
              description = "Rate limit per IP per hour"
            }
          },
          {
            user_limit_per_day = {
              type = "number",
              required = true,
              default = 10000,
              description = "Rate limit per user per day"
            }
          },
          {
            ip_limit_per_day = {
              type = "number",
              required = true,
              default = 100000,
              description = "Rate limit per IP per day"
            }
          },
          {
            redis_host = {
              type = "string",
              required = true,
              default = "redis",
              description = "Redis host for rate limiting"
            }
          },
          {
            redis_port = {
              type = "number",
              required = true,
              default = 6379,
              description = "Redis port for rate limiting"
            }
          },
          {
            redis_database = {
              type = "number",
              required = true,
              default = 0,
              description = "Redis database for rate limiting"
            }
          },
          {
            redis_timeout = {
              type = "number",
              required = true,
              default = 1000,
              description = "Redis connection timeout in milliseconds"
            }
          },
          {
            redis_password = {
              type = "string",
              description = "Redis password for authentication"
            }
          },
          {
            hide_client_headers = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to hide rate limit headers from client"
            }
          },
          {
            error_message = {
              type = "string",
              required = true,
              default = "Rate limit exceeded",
              description = "Error message when rate limit is exceeded"
            }
          },
          {
            error_code = {
              type = "number",
              required = true,
              default = 429,
              description = "HTTP status code when rate limit is exceeded"
            }
          },
          {
            fault_tolerant = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to allow requests when Redis is unavailable"
            }
          },
          {
            identifier = {
              type = "string",
              required = true,
              default = "ip",
              description = "Identifier to use for rate limiting (ip, consumer, credential)"
            }
          },
          {
            window_size = {
              type = "number",
              required = true,
              default = 60,
              description = "Window size in seconds for rate limiting"
            }
          },
          {
            sync_rate = {
              type = "number",
              required = true,
              default = 0.01,
              description = "Rate of synchronization with Redis"
            }
          },
          {
            namespace = {
              type = "string",
              required = true,
              default = "kong_rate_limiting",
              description = "Namespace for rate limiting keys"
            }
          },
          {
            strategy = {
              type = "string",
              required = true,
              default = "redis",
              description = "Strategy for rate limiting (local, redis, cluster)"
            }
          }
        }
      }
    }
  }
}
