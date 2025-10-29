#!/usr/bin/env bash

set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "$DIR/../.." && pwd)"

ARTICLES_COMPOSE="$DIR/docker-compose.yml"
KAFKA_COMPOSE="$ROOT/infrastructure/message-queue/kafka/docker-compose.yml"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo -e "${RED}Error:${NC} Required command '$1' not found. Please install it and re-run."
    exit 1
  fi
}

wait_for_port() {
  local host="$1"; shift
  local port="$1"; shift
  local timeout="${1:-60}"

  echo -e "${YELLOW}Waiting for ${host}:${port} (timeout ${timeout}s)...${NC}"
  local start_ts=$(date +%s)
  while : ; do
    if nc -z "$host" "$port" >/dev/null 2>&1; then
      echo -e "${GREEN}Ready:${NC} ${host}:${port}"
      break
    fi
    sleep 1
    now_ts=$(date +%s)
    if (( now_ts - start_ts > timeout )); then
      echo -e "${RED}Timeout:${NC} ${host}:${port} not ready after ${timeout}s"
      exit 1
    fi
  done
}

echo -e "${GREEN}WriteWave - Articles Service Local Setup${NC}"

# 1) Pre-flight checks
require_cmd docker
if ! docker compose version >/dev/null 2>&1 && ! command -v docker-compose >/dev/null 2>&1; then
  echo -e "${RED}Error:${NC} docker compose is required (Docker Compose V2)."
  exit 1
fi
require_cmd nc
require_cmd awk

# 2) Prepare environment
if [ ! -f "$DIR/.env" ]; then
  if [ -f "$DIR/env.example" ]; then
    cp "$DIR/env.example" "$DIR/.env"
    echo -e "${YELLOW}Created ${DIR}/.env from env.example${NC}"
  else
    echo -e "${RED}Error:${NC} Missing env.example and .env in $DIR"
    exit 1
  fi
fi

mkdir -p "$DIR/uploads" "$DIR/logs"

# 3) Start Kafka stack (if compose file exists)
if [ -f "$KAFKA_COMPOSE" ]; then
  echo -e "${GREEN}Starting Kafka stack...${NC}"
  docker compose -f "$KAFKA_COMPOSE" up -d zookeeper kafka-1 kafka-2 kafka-3 schema-registry kafka-connect kafka-rest kafka-ui kafka-topics-init
  # Wait for a broker
  wait_for_port localhost 9092 120
else
  echo -e "${YELLOW}Kafka docker-compose not found at:${NC} $KAFKA_COMPOSE"
  echo -e "${YELLOW}Skipping Kafka startup. Provide infrastructure compose if needed.${NC}"
fi

# 4) Start Postgres and Redis for Articles Service
echo -e "${GREEN}Starting Articles Service dependencies (Postgres, Redis)...${NC}"
docker compose -f "$ARTICLES_COMPOSE" up -d postgres redis

# Wait for Postgres (mapped host port 5433 per compose)
wait_for_port localhost 5433 60

# Wait for Redis (mapped host port 6380 per compose)
wait_for_port localhost 6380 60

# 5) Generate Prisma client (optional if running locally, harmless in containerized)
if [ -f "$DIR/package.json" ]; then
  if command -v npm >/dev/null 2>&1; then
    (cd "$DIR" && npm ci || npm install)
    (cd "$DIR" && npx prisma generate)
  fi
fi

# 6) Start Articles Service itself
echo -e "${GREEN}Starting Articles Service...${NC}"
docker compose -f "$ARTICLES_COMPOSE" up -d articles-service

# 7) Health checks and summary
echo -e "${YELLOW}Waiting for Articles Service to listen on port...${NC}"
sleep 5

# Default port 8007 exposed as 8007:8007 in compose
ARTICLES_PORT=$(awk -F '[:"]+' '/\s-\s"8007:8007"/ {print "8007"}' "$ARTICLES_COMPOSE" || true)
ARTICLES_PORT=${ARTICLES_PORT:-8007}

wait_for_port localhost "$ARTICLES_PORT" 90

echo -e "\n${GREEN}All set!${NC}"
echo -e "- Articles Service: http://localhost:${ARTICLES_PORT}/api/health"
echo -e "- Postgres: localhost:5433 (db=writewave_articles, user=postgres, pass=password)"
echo -e "- Redis: localhost:6380"
if [ -f "$KAFKA_COMPOSE" ]; then
  echo -e "- Kafka Broker: localhost:9092 (UI may be at http://localhost:8080 if enabled)"
fi

echo -e "\nUse 'docker compose -f "$ARTICLES_COMPOSE" logs -f articles-service' to view service logs."


