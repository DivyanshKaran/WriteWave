#!/bin/bash

# Script to stop the API Gateway (Kong) and infrastructure services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"
INFRASTRUCTURE_DIR="$PROJECT_ROOT/infrastructure"
KONG_DIR="$PROJECT_ROOT/backend/kong"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Stopping WriteWave API Gateway${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 1: Stop Kong
echo -e "${YELLOW}Step 1: Stopping Kong API Gateway...${NC}"
cd "$KONG_DIR" || exit 1
docker-compose -f docker-compose.dev.yml down 2>&1 || true
echo -e "${GREEN}✓ Kong stopped${NC}\n"

# Step 2: Stop infrastructure
echo -e "${YELLOW}Step 2: Stopping infrastructure services...${NC}"
cd "$INFRASTRUCTURE_DIR" || exit 1
docker-compose down 2>&1 || true
echo -e "${GREEN}✓ Infrastructure services stopped${NC}\n"

echo -e "${GREEN}All services have been stopped.${NC}"

