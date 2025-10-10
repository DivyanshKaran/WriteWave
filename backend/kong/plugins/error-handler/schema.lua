-- Schema for Error Handler Plugin

return {
  name = "error-handler",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            error_response_format = {
              type = "string",
              required = true,
              default = "json",
              description = "Format for error responses (json, xml, html)"
            }
          },
          {
            include_request_details = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include request details in error responses"
            }
          },
          {
            include_service_info = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include service information in error responses"
            }
          },
          {
            include_trace_id = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include trace ID in error responses"
            }
          },
          {
            log_errors = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log errors"
            }
          },
          {
            log_to_redis = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log errors to Redis"
            }
          },
          {
            log_to_file = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to log errors to file"
            }
          },
          {
            custom_error_messages = {
              type = "record",
              required = true,
              default = {},
              description = "Custom error messages for specific status codes"
            }
          },
          {
            hide_sensitive_info = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to hide sensitive information in error responses"
            }
          },
          {
            include_stack_trace = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to include stack trace in error responses (development only)"
            }
          },
          {
            error_codes = {
              type = "array",
              required = true,
              default = {400, 401, 403, 404, 405, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 429, 431, 451, 500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511},
              description = "List of error codes to handle"
            }
          },
          {
            fallback_error_message = {
              type = "string",
              required = true,
              default = "An unexpected error occurred",
              description = "Fallback error message for unknown errors"
            }
          },
          {
            include_help_url = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include help URL in error responses"
            }
          },
          {
            help_url = {
              type = "string",
              required = true,
              default = "https://writewave.app/help",
              description = "Help URL to include in error responses"
            }
          },
          {
            include_retry_after = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include retry-after header for retryable errors"
            }
          },
          {
            retry_after_seconds = {
              type = "number",
              required = true,
              default = 60,
              description = "Default retry-after time in seconds"
            }
          }
        }
      }
    }
  }
}
