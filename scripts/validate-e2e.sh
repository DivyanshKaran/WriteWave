#!/usr/bin/env bash

# WriteWave End-to-End Validation Script
# This script validates the entire system: infrastructure, services, Kafka, and Kong

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
KAFKA_COMPOSE="$ROOT_DIR/infrastructure/message-queue/kafka/docker-compose.yml"
KONG_COMPOSE="$ROOT_DIR/backend/kong/docker-compose.real.yml"
INFRA_COMPOSE="$ROOT_DIR/infrastructure/docker-compose.yml"

# Service ports
USER_SERVICE_PORT=8001
CONTENT_SERVICE_PORT=8002
PROGRESS_SERVICE_PORT=8003
COMMUNITY_SERVICE_PORT=8004
NOTIFICATION_SERVICE_PORT=8005
ANALYTICS_SERVICE_PORT=8006
ARTICLES_SERVICE_PORT=8007
KONG_PROXY_PORT=8000
KONG_ADMIN_PORT=8001

# Helper function to wait for a service
wait_for_service() {
  local url=$1
  local name=$2
  local max_attempts=${3:-30}
  local attempt=1

  echo -e "${YELLOW}Waiting for $name to be ready...${NC}"
  while [ $attempt -le $max_attempts ]; do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo -e "${GREEN}✓ $name is ready${NC}"
      return 0
    fi
    echo -n "."
    sleep 2
    attempt=$((attempt + 1))
  done
  echo -e "\n${RED}✗ $name failed to start after $max_attempts attempts${NC}"
  return 1
}

# Helper function to check health endpoint
check_health() {
  local url=$1
  local name=$2
  local expected_status=${3:-200}

  if response=$(curl -sf -w "\n%{http_code}" "$url" 2>/dev/null); then
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
      echo -e "${GREEN}✓ $name health check passed (HTTP $status_code)${NC}"
      return 0
    else
      echo -e "${YELLOW}⚠ $name returned HTTP $status_code (expected $expected_status)${NC}"
      return 1
    fi
  else
    echo -e "${RED}✗ $name health check failed (unreachable)${NC}"
    return 1
  fi
}

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   WriteWave End-to-End Validation Script                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Step 1: Start Infrastructure
echo -e "${BLUE}=== Step 1: Starting Infrastructure ===${NC}\n"

if [ ! -f "$KAFKA_COMPOSE" ]; then
  echo -e "${RED}Kafka compose file not found: $KAFKA_COMPOSE${NC}"
  exit 1
fi

echo -e "${YELLOW}Starting Kafka cluster...${NC}"
cd "$(dirname "$KAFKA_COMPOSE")"
docker compose -f "$(basename "$KAFKA_COMPOSE")" up -d zookeeper kafka-1 kafka-2 kafka-3 kafka-topics-init
cd "$ROOT_DIR"

wait_for_service "http://localhost:9092" "Kafka Broker 1" 60
wait_for_service "http://localhost:8080" "Kafka UI" 30

echo -e "${YELLOW}Starting Redis cluster (if using shared)...${NC}"
if [ -f "$INFRA_COMPOSE" ]; then
  cd "$(dirname "$INFRA_COMPOSE")"
  docker compose -f "$(basename "$INFRA_COMPOSE")" up -d redis-cluster-proxy 2>/dev/null || echo -e "${YELLOW}Redis cluster already running or not needed${NC}"
  cd "$ROOT_DIR"
fi

# Step 2: Start All Services
echo -e "\n${BLUE}=== Step 2: Starting All Microservices ===${NC}\n"

# Start User Service
echo -e "${YELLOW}Starting User Service...${NC}"
if [ -f "$ROOT_DIR/backend/user-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/user-service"
  docker compose up -d postgres-user-primary redis-cluster-proxy user-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$USER_SERVICE_PORT/api/v1/health" "User Service" 60
else
  echo -e "${YELLOW}User Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Content Service
echo -e "${YELLOW}Starting Content Service...${NC}"
if [ -f "$ROOT_DIR/backend/content-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/content-service"
  docker compose up -d db redis content-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$CONTENT_SERVICE_PORT/api/v1/health" "Content Service" 60
else
  echo -e "${YELLOW}Content Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Progress Service
echo -e "${YELLOW}Starting Progress Service...${NC}"
if [ -f "$ROOT_DIR/backend/progress-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/progress-service"
  docker compose up -d db redis progress-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$PROGRESS_SERVICE_PORT/api/v1/health" "Progress Service" 60
else
  echo -e "${YELLOW}Progress Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Community Service
echo -e "${YELLOW}Starting Community Service...${NC}"
if [ -f "$ROOT_DIR/backend/community-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/community-service"
  docker compose up -d postgres redis community-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$COMMUNITY_SERVICE_PORT/health" "Community Service" 60
else
  echo -e "${YELLOW}Community Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Notification Service
echo -e "${YELLOW}Starting Notification Service...${NC}"
if [ -f "$ROOT_DIR/backend/notification-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/notification-service"
  docker compose up -d postgres redis notification-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$NOTIFICATION_SERVICE_PORT/health" "Notification Service" 60
else
  echo -e "${YELLOW}Notification Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Analytics Service
echo -e "${YELLOW}Starting Analytics Service...${NC}"
if [ -f "$ROOT_DIR/backend/analytics-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/analytics-service"
  docker compose up -d clickhouse redis analytics-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$ANALYTICS_SERVICE_PORT/health" "Analytics Service" 60
else
  echo -e "${YELLOW}Analytics Service docker-compose.yml not found, skipping...${NC}"
fi

# Start Articles Service
echo -e "${YELLOW}Starting Articles Service...${NC}"
if [ -f "$ROOT_DIR/backend/articles-service/docker-compose.yml" ]; then
  cd "$ROOT_DIR/backend/articles-service"
  docker compose up -d postgres redis articles-service 2>/dev/null || docker compose up -d
  cd "$ROOT_DIR"
  wait_for_service "http://localhost:$ARTICLES_SERVICE_PORT/api/health" "Articles Service" 60
else
  echo -e "${YELLOW}Articles Service docker-compose.yml not found, skipping...${NC}"
fi

# Step 3: Start Kong Gateway
echo -e "\n${BLUE}=== Step 3: Starting Kong API Gateway ===${NC}\n"

if [ ! -f "$KONG_COMPOSE" ]; then
  echo -e "${YELLOW}Kong compose file not found, trying dev compose...${NC}"
  KONG_COMPOSE="$ROOT_DIR/backend/kong/docker-compose.dev.yml"
fi

if [ -f "$KONG_COMPOSE" ]; then
  echo -e "${YELLOW}Starting Kong...${NC}"
  cd "$ROOT_DIR/backend/kong"
  docker compose -f "$(basename "$KONG_COMPOSE")" up -d kong-database redis kong 2>/dev/null || docker compose -f "$(basename "$KONG_COMPOSE")" up -d
  cd "$ROOT_DIR"
  
  wait_for_service "http://localhost:$KONG_ADMIN_PORT" "Kong Admin API" 60
  echo -e "${YELLOW}Waiting for Kong to initialize routes...${NC}"
  sleep 10
else
  echo -e "${RED}Kong compose file not found${NC}"
fi

# Step 4: Health Check Validation
echo -e "\n${BLUE}=== Step 4: Health Check Validation ===${NC}\n"

HEALTH_CHECKS_PASSED=0
HEALTH_CHECKS_FAILED=0

# Direct service health checks
echo -e "${YELLOW}Checking direct service health endpoints...${NC}"
check_health "http://localhost:$USER_SERVICE_PORT/api/v1/health" "User Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$CONTENT_SERVICE_PORT/api/v1/health" "Content Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$PROGRESS_SERVICE_PORT/api/v1/health" "Progress Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$COMMUNITY_SERVICE_PORT/health" "Community Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$NOTIFICATION_SERVICE_PORT/health" "Notification Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$ANALYTICS_SERVICE_PORT/health" "Analytics Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
check_health "http://localhost:$ARTICLES_SERVICE_PORT/api/health" "Articles Service" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))

# Kafka health checks (if endpoint exists)
echo -e "\n${YELLOW}Checking Kafka connectivity...${NC}"
if curl -sf "http://localhost:$ANALYTICS_SERVICE_PORT/api/health/kafka" >/dev/null 2>&1; then
  check_health "http://localhost:$ANALYTICS_SERVICE_PORT/api/health/kafka" "Analytics Service Kafka" && HEALTH_CHECKS_PASSED=$((HEALTH_CHECKS_PASSED + 1)) || HEALTH_CHECKS_FAILED=$((HEALTH_CHECKS_FAILED + 1))
fi

# Step 5: Kong Gateway Validation
echo -e "\n${BLUE}=== Step 5: Kong Gateway Validation ===${NC}\n"

if curl -sf "http://localhost:$KONG_ADMIN_PORT" >/dev/null 2>&1; then
  echo -e "${YELLOW}Checking Kong routes...${NC}"
  if routes=$(curl -sf "http://localhost:$KONG_ADMIN_PORT/routes" 2>/dev/null); then
    route_count=$(echo "$routes" | jq '.data | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✓ Kong Admin API accessible ($route_count routes configured)${NC}"
    
    echo -e "\n${YELLOW}Testing services through Kong proxy...${NC}"
    # Test a few routes through Kong
    check_health "http://localhost:$KONG_PROXY_PORT/users/health" "User Service via Kong" || true
  fi
else
  echo -e "${YELLOW}⚠ Kong Admin API not accessible${NC}"
fi

# Step 6: Summary
echo -e "\n${BLUE}=== Validation Summary ===${NC}\n"
echo -e "${GREEN}Passed: $HEALTH_CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $HEALTH_CHECKS_FAILED${NC}"

if [ $HEALTH_CHECKS_FAILED -eq 0 ]; then
  echo -e "\n${GREEN}✓ All health checks passed!${NC}"
  echo -e "\n${BLUE}Next steps:${NC}"
  echo -e "1. Test API endpoints through Kong at http://localhost:$KONG_PROXY_PORT"
  echo -e "2. Check Kafka topics at http://localhost:8080 (Kafka UI)"
  echo -e "3. Review service logs: docker compose logs -f <service-name>"
  echo -e "4. Run Postman collections for API testing"
  exit 0
else
  echo -e "\n${RED}✗ Some health checks failed. Review logs and try again.${NC}"
  exit 1
fi

