-- Schema for Service Discovery Plugin

return {
  name = "service-discovery",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            load_balancing_strategy = {
              type = "string",
              required = true,
              default = "round_robin",
              description = "Load balancing strategy (round_robin, least_connections, weighted_round_robin)"
            }
          },
          {
            instance_weights = {
              type = "array",
              required = true,
              default = {},
              description = "Weights for weighted round-robin strategy"
            }
          },
          {
            enable_health_checks = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to enable health checks for service instances"
            }
          },
          {
            health_check_interval = {
              type = "number",
              required = true,
              default = 30,
              description = "Health check interval in seconds"
            }
          },
          {
            health_check_timeout = {
              type = "number",
              required = true,
              default = 5000,
              description = "Health check timeout in milliseconds"
            }
          },
          {
            health_check_path = {
              type = "string",
              required = true,
              default = "/health",
              description = "Health check endpoint path"
            }
          },
          {
            redis_host = {
              type = "string",
              required = true,
              default = "redis",
              description = "Redis host for service discovery"
            }
          },
          {
            redis_port = {
              type = "number",
              required = true,
              default = 6379,
              description = "Redis port for service discovery"
            }
          },
          {
            redis_database = {
              type = "number",
              required = true,
              default = 0,
              description = "Redis database for service discovery"
            }
          },
          {
            service_registration_ttl = {
              type = "number",
              required = true,
              default = 300,
              description = "Service registration TTL in seconds"
            }
          },
          {
            max_retries = {
              type = "number",
              required = true,
              default = 3,
              description = "Maximum number of retries for failed requests"
            }
          },
          {
            retry_delay = {
              type = "number",
              required = true,
              default = 1000,
              description = "Delay between retries in milliseconds"
            }
          },
          {
            circuit_breaker_threshold = {
              type = "number",
              required = true,
              default = 5,
              description = "Number of failures before circuit breaker opens"
            }
          },
          {
            circuit_breaker_timeout = {
              type = "number",
              required = true,
              default = 60,
              description = "Circuit breaker timeout in seconds"
            }
          },
          {
            enable_sticky_sessions = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to enable sticky sessions"
            }
          },
          {
            session_cookie_name = {
              type = "string",
              required = true,
              default = "service_instance",
              description = "Cookie name for sticky sessions"
            }
          },
          {
            session_ttl = {
              type = "number",
              required = true,
              default = 3600,
              description = "Session TTL in seconds"
            }
          }
        }
      }
    }
  }
}
