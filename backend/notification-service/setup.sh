#!/bin/bash

# WriteWave Notification Service - Local Setup Script
# - Installs dependencies
# - Creates .env (from env.example) if missing
# - Starts Redis, Kafka (with Zookeeper), and Postgres on required ports if not running
# - Starts the Notification service (npm run dev)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}WriteWave Notification Service - Setup${NC}"
echo -e "${BLUE}========================================${NC}"

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error()   { echo -e "${RED}✗ $1${NC}"; }
print_info()    { echo -e "${BLUE}ℹ $1${NC}"; }
print_warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }

# 1) Prereq checks
print_info "Checking prerequisites (Node.js, npm, Docker)..."
if ! command -v node >/dev/null 2>&1; then
  print_error "Node.js is not installed (need v18+)."
  exit 1
fi
NODE_MAJOR=$(node -v | sed 's/v//' | cut -d'.' -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  print_error "Node.js v18+ required. Found $(node -v)"
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  print_error "npm is not installed."
  exit 1
fi
if ! command -v docker >/dev/null 2>&1; then
  print_error "Docker is required to start Redis/Kafka/Postgres."
  exit 1
fi
print_success "Prerequisites OK"

# 2) Environment setup
print_info "Ensuring .env exists..."
if [ ! -f .env ]; then
  cp env.example .env
  # Generate safe defaults for secrets if placeholders are present
  if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i.bak "s|your-super-secret-jwt-key-change-this-in-production|$JWT_SECRET|g" .env || true
    rm -f .env.bak || true
  fi
  print_warn ".env created. Review values (email/SMS provider keys, etc.)."
else
  print_success ".env present"
fi

# 3) Install dependencies
print_info "Installing npm dependencies..."
if [ -d node_modules ]; then
  print_warn "node_modules exists, skipping npm install"
else
  npm install
  print_success "Dependencies installed"
fi

# 4) Ensure Docker network for services
NETWORK_NAME="writewave-net"
if ! docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
  print_info "Creating Docker network ${NETWORK_NAME}"
  docker network create ${NETWORK_NAME}
  print_success "Network ${NETWORK_NAME} created"
else
  print_success "Docker network ${NETWORK_NAME} exists"
fi

# Helper to check and run a container
ensure_container() {
  local name="$1"; shift
  local image="$1"; shift
  local healthcheck_cmd="$1"; shift
  local run_cmd=("$@")

  if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
    print_success "Container ${name} already running"
    return 0
  fi
  if docker ps -a --format '{{.Names}}' | grep -q "^${name}$"; then
    print_info "Starting existing container ${name}"
    docker start "${name}"
  else
    print_info "Running container ${name} (${image})"
    "${run_cmd[@]}"
  fi

  # Wait for health if command provided
  if [ -n "${healthcheck_cmd}" ]; then
    print_info "Waiting for ${name} to become healthy..."
    for i in {1..30}; do
      if eval "${healthcheck_cmd}" >/dev/null 2>&1; then
        print_success "${name} is healthy"
        return 0
      fi
      sleep 2
    done
    print_warn "${name} healthcheck timed out; continuing"
  fi
}

# 5) Start Redis (default: 6379)
print_info "Ensuring Redis is running on 6379..."
ensure_container \
  "writewave-redis" \
  "redis:7-alpine" \
  "docker exec writewave-redis redis-cli ping | grep -q PONG" \
  docker run -d --name writewave-redis --restart unless-stopped \
    --network ${NETWORK_NAME} -p 6379:6379 redis:7-alpine \
    redis-server --appendonly yes

# 6) Start Zookeeper and Kafka (Bitnami)
print_info "Ensuring Kafka (and Zookeeper) are running..."
ensure_container \
  "writewave-zookeeper" \
  "bitnami/zookeeper:3" \
  "docker logs writewave-zookeeper 2>&1 | grep -q 'binding to port'" \
  docker run -d --name writewave-zookeeper --restart unless-stopped \
    --network ${NETWORK_NAME} -p 2181:2181 \
    -e ALLOW_ANONYMOUS_LOGIN=yes bitnami/zookeeper:3

ensure_container \
  "writewave-kafka" \
  "bitnami/kafka:3" \
  "docker exec writewave-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list >/dev/null 2>&1" \
  docker run -d --name writewave-kafka --restart unless-stopped \
    --network ${NETWORK_NAME} -p 9092:9092 \
    -e KAFKA_CFG_ZOOKEEPER_CONNECT=writewave-zookeeper:2181 \
    -e ALLOW_PLAINTEXT_LISTENER=yes \
    -e KAFKA_LISTENERS=PLAINTEXT://:9092 \
    -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
    bitnami/kafka:3

# 7) Start Postgres (even if service is in-memory today, prepare DB for future)
print_info "Ensuring Postgres is running on 5432..."
ensure_container \
  "writewave-postgres" \
  "postgres:15" \
  "docker exec writewave-postgres pg_isready -U postgres >/dev/null 2>&1" \
  docker run -d --name writewave-postgres --restart unless-stopped \
    --network ${NETWORK_NAME} -p 5432:5432 \
    -e POSTGRES_PASSWORD=writewave \
    -e POSTGRES_DB=writewave_notifications \
    postgres:15

# 8) Create logs dir
mkdir -p logs
touch logs/notification-service.log || true

# 9) Show connection info
echo -e "${BLUE}Services:${NC}"
echo -e "- Redis:    redis://localhost:6379"
echo -e "- Kafka:    PLAINTEXT at localhost:9092 (ZK at 2181)"
echo -e "- Postgres: postgresql://postgres:writewave@localhost:5432/writewave_notifications"

# 10) Start the Notification service
print_info "Starting Notification service (npm run dev)..."
PORT=${PORT:-8005} npm run dev


