#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="/home/the_hero_of_ages/Desktop/IndividualProjects/writewave"
KONG_DIR="$ROOT_DIR/backend/kong"
USER_SERVICE_DIR="$ROOT_DIR/backend/user-service"
CONTENT_SERVICE_DIR="$ROOT_DIR/backend/content-service"
PROGRESS_SERVICE_DIR="$ROOT_DIR/backend/progress-service"
COMMUNITY_SERVICE_DIR="$ROOT_DIR/backend/community-service"
NOTIFICATION_SERVICE_DIR="$ROOT_DIR/backend/notification-service"
ANALYTICS_SERVICE_DIR="$ROOT_DIR/backend/analytics-service"
ARTICLES_SERVICE_DIR="$ROOT_DIR/backend/articles-service"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== WriteWave Kong API Gateway Setup (Real Services) ===${NC}"

# Check prerequisites
if ! command -v docker &>/dev/null; then
  echo -e "${RED}Docker is required but not installed.${NC}"
  exit 1
fi
if ! command -v docker compose &>/dev/null; then
  echo -e "${RED}Docker Compose v2 is required (docker compose).${NC}"
  exit 1
fi

# Function to wait for a service to be healthy
wait_for_service() {
  local service_name=$1
  local max_attempts=30
  local attempt=1
  
  echo -e "${YELLOW}Waiting for $service_name to become healthy...${NC}"
  while [ $attempt -le $max_attempts ]; do
    if docker inspect -f '{{.State.Health.Status}}' "$service_name" 2>/dev/null | grep -q "healthy"; then
      echo -e "${GREEN}$service_name is healthy${NC}"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  
  echo -e "${RED}$service_name failed to become healthy${NC}"
  return 1
}

# Function to start a service with its database
start_service() {
  local service_name=$1
  local service_dir=$2
  local port=$3
  
  if [ ! -d "$service_dir" ]; then
    echo -e "${RED}Service directory not found: $service_dir${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Starting $service_name...${NC}"
  cd "$service_dir"
  
  # Build the service
  docker compose build 2>/dev/null || echo "No docker-compose.yml found in $service_dir"
  
  # Start the service
  docker compose up -d 2>/dev/null || echo "Failed to start $service_name"
  
  cd - > /dev/null
}

# Start real backend services first
echo -e "${YELLOW}=== Starting Real Backend Services ===${NC}"

echo -e "${YELLOW}Starting User Service...${NC}"
if [ -d "$USER_SERVICE_DIR" ] && [ -f "$USER_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$USER_SERVICE_DIR"
  docker compose up -d user-db redis 2>/dev/null || true
  wait_for_service "writewave-user-db" || true
  docker compose up -d user-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Content Service...${NC}"
if [ -d "$CONTENT_SERVICE_DIR" ] && [ -f "$CONTENT_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$CONTENT_SERVICE_DIR"
  docker compose up -d db redis 2>/dev/null || true
  docker compose up -d content-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Progress Service...${NC}"
if [ -d "$PROGRESS_SERVICE_DIR" ] && [ -f "$PROGRESS_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$PROGRESS_SERVICE_DIR"
  docker compose up -d db redis 2>/dev/null || true
  docker compose up -d progress-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Community Service...${NC}"
if [ -d "$COMMUNITY_SERVICE_DIR" ] && [ -f "$COMMUNITY_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$COMMUNITY_SERVICE_DIR"
  docker compose up -d postgres redis 2>/dev/null || true
  docker compose up -d community-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Notification Service...${NC}"
if [ -d "$NOTIFICATION_SERVICE_DIR" ] && [ -f "$NOTIFICATION_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$NOTIFICATION_SERVICE_DIR"
  docker compose up -d redis 2>/dev/null || true
  docker compose up -d notification-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Analytics Service...${NC}"
if [ -d "$ANALYTICS_SERVICE_DIR" ] && [ -f "$ANALYTICS_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$ANALYTICS_SERVICE_DIR"
  docker compose up -d db redis 2>/dev/null || true
  docker compose up -d analytics-service 2>/dev/null || true
  cd - > /dev/null
fi

echo -e "${YELLOW}Starting Articles Service...${NC}"
if [ -d "$ARTICLES_SERVICE_DIR" ] && [ -f "$ARTICLES_SERVICE_DIR/docker-compose.yml" ]; then
  cd "$ARTICLES_SERVICE_DIR"
  docker compose up -d postgres redis 2>/dev/null || true
  docker compose up -d articles-service 2>/dev/null || true
  cd - > /dev/null
fi

# Wait a bit for services to start
echo -e "${YELLOW}Waiting for backend services to initialize...${NC}"
sleep 5

# Start Kong
cd "$KONG_DIR"

echo -e "${YELLOW}=== Starting Kong API Gateway ===${NC}"

echo -e "${YELLOW}Starting Kong database and Redis...${NC}"
docker compose -f docker-compose.real.yml up -d kong-database redis

echo -e "${YELLOW}Waiting for Kong database to become healthy...${NC}"
wait_for_service "kong-database-real"

echo -e "${YELLOW}Running Kong migrations...${NC}"
docker compose -f docker-compose.real.yml up kong-migrations

echo -e "${YELLOW}Importing Kong configuration...${NC}"
docker compose -f docker-compose.real.yml up kong-config

echo -e "${YELLOW}Starting Kong gateway...${NC}"
docker compose -f docker-compose.real.yml up -d kong

echo -e "${YELLOW}Waiting for Kong to become healthy...${NC}"
for i in {1..30}; do
  if docker exec kong-gateway-real kong health >/dev/null 2>&1; then
    echo -e "${GREEN}Kong is healthy${NC}"
    break
  fi
  sleep 2
done

KONG_PROXY=http://localhost:8000
KONG_ADMIN=http://localhost:8001

# Verify Kong is accessible
echo -e "${YELLOW}Verifying Kong Admin API...${NC}"
if curl -sf "$KONG_ADMIN/" >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Kong Admin API is accessible at $KONG_ADMIN${NC}"
else
  echo -e "${RED}✗ Kong Admin API is not accessible${NC}"
fi

# Test routes
echo -e "${YELLOW}Testing Kong routes...${NC}"

# Test via Kong proxy
echo -e "${GREEN}=== Kong is running! Test these endpoints in Postman: ===${NC}"
echo -e "${YELLOW}Base URL: $KONG_PROXY${NC}"
echo ""
echo -e "${GREEN}User Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/users"
echo "  POST   $KONG_PROXY/api/v1/users"
echo "  POST   $KONG_PROXY/api/v1/auth"
echo ""
echo -e "${GREEN}Content Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/content"
echo "  GET    $KONG_PROXY/api/v1/characters"
echo ""
echo -e "${GREEN}Articles Service:${NC}"
echo "  GET    $KONG_PROXY/api/articles"
echo "  GET    $KONG_PROXY/api/v1/articles"
echo ""
echo -e "${GREEN}Progress Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/progress"
echo "  GET    $KONG_PROXY/api/v1/achievements"
echo ""
echo -e "${GREEN}Community Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/community"
echo "  GET    $KONG_PROXY/api/v1/leaderboard"
echo ""
echo -e "${GREEN}Notification Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/notifications"
echo ""
echo -e "${GREEN}Analytics Service:${NC}"
echo "  GET    $KONG_PROXY/api/v1/analytics"
echo ""
echo -e "${GREEN}Admin API:${NC}"
echo "  GET    $KONG_ADMIN/services"
echo "  GET    $KONG_ADMIN/routes"

cd - > /dev/null

echo ""
echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo -e "${YELLOW}Note: Backend services need to be built and have their databases initialized.${NC}"
echo -e "${YELLOW}Run migrations for each service if needed.${NC}"

