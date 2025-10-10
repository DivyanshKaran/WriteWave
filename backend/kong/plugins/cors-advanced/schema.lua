-- Schema for Advanced CORS Plugin

return {
  name = "cors-advanced",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            origins = {
              type = "array",
              required = true,
              default = { "http://localhost:3000", "https://writewave.app" },
              description = "List of allowed origins"
            }
          },
          {
            methods = {
              type = "array",
              required = true,
              default = { "GET", "POST", "PUT", "DELETE", "OPTIONS" },
              description = "List of allowed HTTP methods"
            }
          },
          {
            headers = {
              type = "array",
              required = true,
              default = { "Accept", "Accept-Version", "Content-Length", "Content-MD5", "Content-Type", "Date", "Authorization" },
              description = "List of allowed headers"
            }
          },
          {
            exposed_headers = {
              type = "array",
              required = true,
              default = { "X-Auth-Token" },
              description = "List of headers to expose to the client"
            }
          },
          {
            credentials = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to allow credentials"
            }
          },
          {
            max_age = {
              type = "number",
              required = true,
              default = 3600,
              description = "Maximum age for preflight requests in seconds"
            }
          },
          {
            preflight_continue = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to continue with the request after preflight"
            }
          },
          {
            private_network = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to allow private network access"
            }
          },
          {
            vary_origin = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to vary the response based on origin"
            }
          },
          {
            origin_regex = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to treat origins as regex patterns"
            }
          },
          {
            origin_override = {
              type = "string",
              description = "Override the origin header value"
            }
          },
          {
            always_apply = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to always apply CORS headers"
            }
          },
          {
            allow_any_origin = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to allow any origin (use with caution)"
            }
          },
          {
            allow_any_method = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to allow any HTTP method"
            }
          },
          {
            allow_any_header = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to allow any header"
            }
          }
        }
      }
    }
  }
}
