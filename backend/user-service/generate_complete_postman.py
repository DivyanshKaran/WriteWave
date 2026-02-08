#!/usr/bin/env python3
import json

def create_request(name, method, path, auth=False, body=None, query=None, path_vars=None, test_script=None):
    """Helper to create a request object"""
    request = {
        "name": name,
        "request": {
            "method": method,
            "header": [],
            "url": {
                "raw": f"{{{{baseUrl}}}}{path}",
                "host": ["{{baseUrl}}"],
                "path": path.strip('/').split('/')
            }
        }
    }
    
    if auth:
        request["request"]["header"].append({
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
        })
    
    if body:
        request["request"]["header"].append({
            "key": "Content-Type",
            "value": "application/json"
        })
        request["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body, indent=2)
        }
    
    if query:
        request["request"]["url"]["query"] = query
    
    if path_vars:
        request["request"]["url"]["variable"] = path_vars
    
    if test_script:
        request["event"] = [{
            "listen": "test",
            "script": {"exec": test_script}
        }]
    
    return request

# Token save script
token_save_script = [
    "if (pm.response.code === 200 || pm.response.code === 201) {",
    "    var jsonData = pm.response.json();",
    "    if (jsonData.data && jsonData.data.token) {",
    "        pm.environment.set('accessToken', jsonData.data.token);",
    "        pm.environment.set('refreshToken', jsonData.data.refreshToken);",
    "        console.log('✅ Tokens saved to environment');",
    "    }",
    "}"
]

collection = {
    "info": {
        "_postman_id": "writewave-user-service-2024",
        "name": "WriteWave User Service",
        "description": "Complete API collection for WriteWave User Service with 24 endpoints",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        # Health Check
        create_request("Health Check", "GET", "/health"),
        
        # Authentication folder
        {
            "name": "Authentication",
            "item": [
                create_request(
                    "Register User",
                    "POST",
                    "/auth/register",
                    body={
                        "email": "demo@example.com",
                        "password": "SecurePass123!",
                        "firstName": "Demo",
                        "lastName": "User",
                        "username": "demouser"
                    },
                    test_script=token_save_script
                ),
                create_request(
                    "Login User",
                    "POST",
                    "/auth/login",
                    body={
                        "email": "demo@example.com",
                        "password": "SecurePass123!"
                    },
                    test_script=token_save_script
                ),
                create_request("Get Current User", "GET", "/auth/me", auth=True),
                create_request(
                    "Refresh Token",
                    "POST",
                    "/auth/refresh-token",
                    body={"refreshToken": "{{refreshToken}}"},
                    test_script=[
                        "if (pm.response.code === 200) {",
                        "    var jsonData = pm.response.json();",
                        "    if (jsonData.data && jsonData.data.token) {",
                        "        pm.environment.set('accessToken', jsonData.data.token);",
                        "    }",
                        "}"
                    ]
                ),
                create_request(
                    "Forgot Password",
                    "POST",
                    "/auth/forgot-password",
                    body={"email": "demo@example.com"}
                ),
                create_request(
                    "Reset Password",
                    "POST",
                    "/auth/reset-password",
                    body={
                        "token": "reset-token-here",
                        "password": "NewSecurePass123!"
                    }
                ),
                create_request(
                    "Verify Email",
                    "POST",
                    "/auth/verify-email",
                    body={"token": "verification-token-here"}
                ),
                create_request(
                    "Resend Verification Email",
                    "POST",
                    "/auth/resend-verification",
                    body={"email": "demo@example.com"}
                ),
                create_request(
                    "Logout",
                    "POST",
                    "/auth/logout",
                    auth=True,
                    body={"refreshToken": "{{refreshToken}}"}
                ),
                create_request("Logout All Devices", "POST", "/auth/logout-all", auth=True)
            ]
        },
        
        # User Profile folder
        {
            "name": "User Profile",
            "item": [
                create_request("Get User Profile", "GET", "/users/profile", auth=True),
                create_request(
                    "Update User Profile",
                    "PUT",
                    "/users/profile",
                    auth=True,
                    body={
                        "firstName": "Updated",
                        "lastName": "Name",
                        "bio": "Japanese language enthusiast",
                        "country": "United States",
                        "timezone": "America/New_York",
                        "language": "en"
                    }
                ),
                create_request(
                    "Update User Avatar",
                    "PUT",
                    "/users/avatar",
                    auth=True,
                    body={"avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=demo"}
                )
            ]
        },
        
        # User Settings folder
        {
            "name": "User Settings",
            "item": [
                create_request("Get User Settings", "GET", "/users/settings", auth=True),
                create_request(
                    "Update User Settings",
                    "PUT",
                    "/users/settings",
                    auth=True,
                    body={
                        "emailNotifications": True,
                        "pushNotifications": True,
                        "theme": "dark",
                        "fontSize": "medium",
                        "language": "en"
                    }
                )
            ]
        },
        
        # User Management folder
        {
            "name": "User Management",
            "item": [
                create_request("Get User Stats", "GET", "/users/stats", auth=True),
                create_request("Get User Sessions", "GET", "/users/sessions", auth=True),
                create_request(
                    "Search Users",
                    "GET",
                    "/users/search?q=demo&page=1&limit=10",
                    auth=True,
                    query=[
                        {"key": "q", "value": "demo"},
                        {"key": "page", "value": "1"},
                        {"key": "limit", "value": "10"}
                    ]
                ),
                create_request("Deactivate Account", "POST", "/users/deactivate", auth=True),
                create_request("Reactivate Account", "POST", "/users/reactivate", auth=True),
                create_request("Delete Account", "DELETE", "/users/account", auth=True)
            ]
        },
        
        # Admin folder
        {
            "name": "Admin",
            "item": [
                create_request(
                    "Get All Users",
                    "GET",
                    "/users/admin/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc",
                    auth=True,
                    query=[
                        {"key": "page", "value": "1"},
                        {"key": "limit", "value": "10"},
                        {"key": "sortBy", "value": "createdAt"},
                        {"key": "sortOrder", "value": "desc"}
                    ]
                ),
                create_request(
                    "Get User By ID",
                    "GET",
                    "/users/admin/users/:userId",
                    auth=True,
                    path_vars=[{"key": "userId", "value": "user-id-here"}]
                )
            ]
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:8001/api/v1",
            "type": "string"
        }
    ]
}

# Write collection
with open('WriteWave_User_Service.postman_collection.json', 'w') as f:
    json.dump(collection, f, indent=2)

print("✅ Complete Postman collection created!")
print("📊 Total endpoints: 24")
print("📁 Folders: 5 (Health, Auth, Profile, Settings, Management, Admin)")
print("🔐 Auto token management enabled")
print("\n📥 Import into Postman:")
print("   - WriteWave_User_Service.postman_collection.json")
print("   - WriteWave_User_Service.postman_environment.json")
