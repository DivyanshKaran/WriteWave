#!/usr/bin/env python3
import json

collection = {
    "info": {
        "_postman_id": "writewave-user-service-2024",
        "name": "WriteWave User Service",
        "description": "Complete API collection for WriteWave User Service - Authentication and User Management",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "Health Check",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/health",
                    "host": ["{{baseUrl}}"],
                    "path": ["health"]
                }
            }
        },
        {
            "name": "Authentication",
            "item": [
                {
                    "name": "Register User",
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 201) {",
                                "    var jsonData = pm.response.json();",
                                "    if (jsonData.data && jsonData.data.token) {",
                                "        pm.environment.set('accessToken', jsonData.data.token);",
                                "        pm.environment.set('refreshToken', jsonData.data.refreshToken);",
                                "    }",
                                "}"
                            ]
                        }
                    }],
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "demo@example.com",
                                "password": "SecurePass123!",
                                "firstName": "Demo",
                                "lastName": "User",
                                "username": "demouser"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/register",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "register"]
                        }
                    }
                },
                {
                    "name": "Login User",
                    "event": [{
                        "listen": "test",
                        "script": {
                            "exec": [
                                "if (pm.response.code === 200) {",
                                "    var jsonData = pm.response.json();",
                                "    if (jsonData.data && jsonData.data.token) {",
                                "        pm.environment.set('accessToken', jsonData.data.token);",
                                "        pm.environment.set('refreshToken', jsonData.data.refreshToken);",
                                "    }",
                                "}"
                            ]
                        }
                    }],
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "email": "demo@example.com",
                                "password": "SecurePass123!"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{baseUrl}}/auth/login",
                            "host": ["{{baseUrl}}"],
                            "path": ["auth", "login"]
                        }
                    }
                }
            ]
        }
    ]
}

# Write to file
with open('WriteWave_User_Service.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)

print("✅ Postman collection created successfully!")
