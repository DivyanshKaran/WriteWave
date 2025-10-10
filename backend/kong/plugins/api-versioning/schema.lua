-- Schema for API Versioning Plugin

return {
  name = "api-versioning",
  fields = {
    {
      config = {
        type = "record",
        fields = {
          {
            supported_versions = {
              type = "array",
              required = true,
              default = { "v1", "v2" },
              description = "List of supported API versions"
            }
          },
          {
            default_version = {
              type = "string",
              required = true,
              default = "v1",
              description = "Default API version to use"
            }
          },
          {
            version_header = {
              type = "string",
              required = true,
              default = "X-API-Version",
              description = "Header name for API version"
            }
          },
          {
            version_param = {
              type = "string",
              required = true,
              default = "version",
              description = "Query parameter name for API version"
            }
          },
          {
            transform_requests = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to transform requests for version compatibility"
            }
          },
          {
            transform_responses = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to transform responses for version compatibility"
            }
          },
          {
            version_in_path = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether version is included in URL path"
            }
          },
          {
            version_in_header = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether version is included in headers"
            }
          },
          {
            version_in_query = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether version is included in query parameters"
            }
          },
          {
            strict_versioning = {
              type = "boolean",
              required = true,
              default = false,
              description = "Whether to strictly enforce version requirements"
            }
          },
          {
            fallback_version = {
              type = "string",
              required = true,
              default = "v1",
              description = "Fallback version when version is not specified"
            }
          },
          {
            version_mapping = {
              type = "record",
              required = true,
              default = {},
              description = "Mapping of versions to service endpoints"
            }
          },
          {
            deprecation_warnings = {
              type = "boolean",
              required = true,
              default = true,
              description = "Whether to include deprecation warnings in responses"
            }
          },
          {
            deprecated_versions = {
              type = "array",
              required = true,
              default = {},
              description = "List of deprecated API versions"
            }
          },
          {
            sunset_date = {
              type = "string",
              description = "Sunset date for deprecated versions"
            }
          },
          {
            migration_guide_url = {
              type = "string",
              description = "URL to migration guide for version changes"
            }
          }
        }
      }
    }
  }
}
