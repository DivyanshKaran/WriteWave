#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="/home/the_hero_of_ages/Desktop/IndividualProjects/writewave"
KONG_DIR="$ROOT_DIR/backend/kong"

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Starting Kong API Gateway stack (dev)${NC}"

cd "$KONG_DIR"

if ! command -v docker &>/dev/null; then
  echo -e "${RED}Docker is required but not installed.${NC}"
  exit 1
fi
if ! command -v docker compose &>/dev/null; then
  echo -e "${RED}Docker Compose v2 is required (docker compose).${NC}"
  exit 1
fi

echo -e "${YELLOW}Bringing up Postgres and Redis...${NC}"
docker compose -f docker-compose.dev.yml up -d kong-database redis

echo -e "${YELLOW}Waiting for Postgres to become healthy...${NC}"
until [ "$(docker inspect -f '{{.State.Health.Status}}' kong-database-dev)" = "healthy" ]; do
  sleep 2
done

echo -e "${YELLOW}Running Kong migrations (bootstrap)...${NC}"
docker compose -f docker-compose.dev.yml up --no-deps --build kong-migrations

echo -e "${YELLOW}Importing declarative config into DB...${NC}"
docker compose -f docker-compose.dev.yml up --no-deps --build kong-config

echo -e "${YELLOW}Starting mock upstream services and Kong gateway...${NC}"
docker compose -f docker-compose.dev.yml up -d user-service content-service progress-service community-service notification-service analytics-service health-check-service
docker compose -f docker-compose.dev.yml up -d kong

echo -e "${YELLOW}Waiting for Kong to become healthy...${NC}"
for i in {1..30}; do
  if docker exec kong-gateway-dev kong health >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

KONG_PROXY=http://localhost:8000
KONG_ADMIN=http://localhost:8001

echo -e "${YELLOW}Verifying Admin API is reachable...${NC}"
curl -sf "$KONG_ADMIN/" >/dev/null && echo -e "${GREEN}Admin API OK${NC}" || { echo -e "${RED}Admin API not reachable${NC}"; exit 1; }

echo -e "${YELLOW}Performing basic health checks via proxy...${NC}"
curl -sf "$KONG_PROXY/health" | jq . >/dev/null 2>&1 || curl -sf "$KONG_PROXY/health" >/dev/null
curl -sf "$KONG_PROXY/health/users" >/dev/null
curl -sf "$KONG_PROXY/health/content" >/dev/null
curl -sf "$KONG_PROXY/health/articles" >/dev/null
curl -sf "$KONG_PROXY/health/progress" >/dev/null
curl -sf "$KONG_PROXY/health/community" >/dev/null
curl -sf "$KONG_PROXY/health/notifications" >/dev/null
curl -sf "$KONG_PROXY/health/analytics" >/dev/null

echo -e "${GREEN}Kong is up. Test in Postman using:${NC}"
echo "- $KONG_PROXY/health"
echo "- $KONG_PROXY/api/v1/users (requires JWT unless you remove the jwt plugin)"
echo "- $KONG_PROXY/api/v1/content (requires JWT)"

echo -e "${YELLOW}Tip:${NC} If you want to bypass JWT while testing, temporarily remove the jwt plugin blocks in $KONG_DIR/kong.yml and rerun the import step."


