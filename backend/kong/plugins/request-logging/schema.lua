-- Schema for Request Logging Plugin

return {
  name = "request-logging",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            log_requests = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log incoming requests"
            }
          },
          {
            log_responses = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log outgoing responses"
            }
          },
          {
            log_to_redis = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log to Redis"
            }
          },
          {
            log_to_file = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log to file"
            }
          },
          {
            add_response_time_header = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to add response time header"
            }
          },
          {
            log_level = {
              type = "string",
              required = true,
              default = "info",
              description = "Log level for file logging"
            }
          },
          {
            redis_host = {
              type = "string",
              required = true,
              default = "redis",
              description = "Redis host for logging"
            }
          },
          {
            redis_port = {
              type = "number",
              required = true,
              default = 6379,
              description = "Redis port for logging"
            }
          },
          {
            redis_database = {
              type = "number",
              required = true,
              default = 0,
              description = "Redis database for logging"
            }
          },
          {
            log_retention_days = {
              type = "number",
              required = true,
              default = 7,
              description = "Number of days to retain logs in Redis"
            }
          },
          {
            sensitive_fields = {
              type = "array",
              required = true,
              default = { "password", "token", "secret", "key" },
              description = "Fields to redact from logs"
            }
          },
          {
            log_request_body = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to log request body"
            }
          },
          {
            log_response_body = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to log response body"
            }
          },
          {
            max_body_size = {
              type = "number",
              required = true,
              default = 1024,
              description = "Maximum body size to log in bytes"
            }
          }
        }
      }
    }
  }
}
