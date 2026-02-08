#!/bin/bash

BASE_URL="http://localhost:8001/api/v1"

echo "========================================="
echo "WriteWave User Service API Test"
echo "========================================="
echo ""

# 1. Health Check
echo "1. Health Check"
echo "GET $BASE_URL/health"
curl -s $BASE_URL/health | python3 -m json.tool
echo ""
echo ""

# 2. Get CSRF Token
echo "2. Getting CSRF Token"
CSRF_RESPONSE=$(curl -s $BASE_URL/csrf-token)
CSRF_TOKEN=$(echo $CSRF_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['csrfToken'])")
echo "CSRF Token: $CSRF_TOKEN"
echo ""
echo ""

# 3. Register User
echo "3. Register User"
echo "POST $BASE_URL/auth/register"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"email":"demo@writewave.app","password":"SecurePass123!","firstName":"Demo","lastName":"User","username":"demouser"}')
echo "$REGISTER_RESPONSE" | python3 -m json.tool
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null || echo "")
REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('refreshToken', ''))" 2>/dev/null || echo "")
echo ""
echo ""

# If registration failed (user exists), try login
if [ -z "$ACCESS_TOKEN" ]; then
  echo "4. Login User (registration failed, trying login)"
  echo "POST $BASE_URL/auth/login"
  LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: $CSRF_TOKEN" \
    -d '{"email":"demo@writewave.app","password":"SecurePass123!"}')
  echo "$LOGIN_RESPONSE" | python3 -m json.tool
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null || echo "")
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('refreshToken', ''))" 2>/dev/null || echo "")
  echo ""
  echo ""
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token. Stopping tests."
  exit 1
fi

echo "✅ Access Token: ${ACCESS_TOKEN:0:50}..."
echo ""
echo ""

# 5. Get Current User
echo "5. Get Current User"
echo "GET $BASE_URL/auth/me"
curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# 6. Get User Profile
echo "6. Get User Profile"
echo "GET $BASE_URL/users/profile"
curl -s $BASE_URL/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# 7. Update User Profile
echo "7. Update User Profile"
echo "PUT $BASE_URL/users/profile"
curl -s -X PUT $BASE_URL/users/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"firstName":"Updated","lastName":"Name","bio":"Japanese language enthusiast"}' | python3 -m json.tool
echo ""
echo ""

# 8. Get User Settings
echo "8. Get User Settings"
echo "GET $BASE_URL/users/settings"
curl -s $BASE_URL/users/settings \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# 9. Update User Settings
echo "9. Update User Settings"
echo "PUT $BASE_URL/users/settings"
curl -s -X PUT $BASE_URL/users/settings \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -d '{"emailNotifications":true,"theme":"dark"}' | python3 -m json.tool
echo ""
echo ""

# 10. Get User Stats
echo "10. Get User Stats"
echo "GET $BASE_URL/users/stats"
curl -s $BASE_URL/users/stats \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# 11. Search Users
echo "11. Search Users"
echo "GET $BASE_URL/users/search?q=demo"
curl -s "$BASE_URL/users/search?q=demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

# 12. Get User Sessions
echo "12. Get User Sessions"
echo "GET $BASE_URL/users/sessions"
curl -s $BASE_URL/users/sessions \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool
echo ""
echo ""

echo "========================================="
echo "✅ API Test Complete!"
echo "========================================="
