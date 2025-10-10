-- Schema for Circuit Breaker Plugin

return {
  name = "circuit-breaker",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            threshold = {
              type = "number",
              required = true,
              default = 5,
              description = "Number of failures before opening the circuit"
            }
          },
          {
            timeout = {
              type = "number",
              required = true,
              default = 60,
              description = "Time in seconds before attempting to close the circuit"
            }
          },
          {
            unhealthy = {
              type = "number",
              required = true,
              default = 3,
              description = "Number of failures to consider service unhealthy"
            }
          },
          {
            healthy = {
              type = "number",
              required = true,
              default = 2,
              description = "Number of successes to consider service healthy"
            }
          },
          {
            redis_host = {
              type = "string",
              required = true,
              default = "redis",
              description = "Redis host for storing circuit breaker state"
            }
          },
          {
            redis_port = {
              type = "number",
              required = true,
              default = 6379,
              description = "Redis port for storing circuit breaker state"
            }
          },
          {
            redis_database = {
              type = "number",
              required = true,
              default = 0,
              description = "Redis database for storing circuit breaker state"
            }
          },
          {
            failure_threshold_percentage = {
              type = "number",
              required = true,
              default = 50,
              description = "Percentage of failed requests to trigger circuit breaker"
            }
          },
          {
            success_threshold_percentage = {
              type = "number",
              required = true,
              default = 80,
              description = "Percentage of successful requests to close circuit breaker"
            }
          },
          {
            window_size = {
              type = "number",
              required = true,
              default = 100,
              description = "Number of requests to consider for threshold calculations"
            }
          },
          {
            enable_half_open = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to enable half-open state"
            }
          },
          {
            half_open_max_calls = {
              type = "number",
              required = true,
              default = 3,
              description = "Maximum number of calls allowed in half-open state"
            }
          },
          {
            fallback_response = {
              type = "string",
              required = true,
              default = "Service temporarily unavailable",
              description = "Fallback response when circuit is open"
            }
          },
          {
            include_headers = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include circuit breaker headers in response"
            }
          }
        }
      }
    }
  }
}
