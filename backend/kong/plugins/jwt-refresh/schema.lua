-- Schema for JWT Refresh Plugin

return {
  name = "jwt-refresh",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            secret = {
              type = "string",
              required = true,
              default = "writewave-secret-key",
              description = "Secret key for JWT signing and verification"
            }
          },
          {
            token_expires_in = {
              type = "number",
              required = true,
              default = 3600,
              description = "Access token expiration time in seconds"
            }
          },
          {
            refresh_expires_in = {
              type = "number",
              required = true,
              default = 604800,
              description = "Refresh token expiration time in seconds"
            }
          },
          {
            algorithm = {
              type = "string",
              required = true,
              default = "HS256",
              description = "JWT signing algorithm"
            }
          },
          {
            key_claim_name = {
              type = "string",
              required = true,
              default = "iss",
              description = "Claim name to use for key identification"
            }
          },
          {
            secret_is_base64 = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether the secret is base64 encoded"
            }
          },
          {
            run_on_preflight = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to run on preflight requests"
            }
          },
          {
            uri_param_names = {
              type = "array",
              required = true,
              default = { "jwt" },
              description = "URI parameter names to check for JWT tokens"
            }
          },
          {
            cookie_names = {
              type = "array",
              required = true,
              default = { "jwt" },
              description = "Cookie names to check for JWT tokens"
            }
          },
          {
            header_names = {
              type = "array",
              required = true,
              default = { "authorization" },
              description = "Header names to check for JWT tokens"
            }
          },
          {
            claims_to_verify = {
              type = "array",
              required = true,
              default = { "exp" },
              description = "JWT claims to verify"
            }
          },
          {
            anonymous = {
              type = "string",
              description = "Anonymous consumer identifier for failed authentication"
            }
          },
          {
            consumer_claim = {
              type = "array",
              required = true,
              default = { "iss" },
              description = "JWT claims to use for consumer identification"
            }
          },
          {
            consumer_optional = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether consumer identification is optional"
            }
          },
          {
            leeway = {
              type = "number",
              required = true,
              default = 0,
              description = "Clock skew leeway in seconds"
            }
          },
          {
            maximum_expiration = {
              type = "number",
              required = true,
              default = 0,
              description = "Maximum expiration time in seconds"
            }
          }
        }
      }
    }
  }
}
