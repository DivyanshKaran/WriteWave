#!/usr/bin/env bash

set -euo pipefail

# Colors
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
NC="\033[0m"

DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd -- "$DIR/../.." && pwd)"

CONTENT_COMPOSE="$DIR/docker-compose.yml"
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

echo -e "${GREEN}WriteWave - Content Service Local Setup${NC}"

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
  # Wait for primary broker
  wait_for_port localhost 9092 120
else
  echo -e "${YELLOW}Kafka docker-compose not found at:${NC} $KAFKA_COMPOSE"
  echo -e "${YELLOW}Skipping Kafka startup. Set OPTIONAL_KAFKA=true and provide compose file if needed.${NC}"
fi

# 4) Start Postgres and Redis for Content Service
echo -e "${GREEN}Starting Content Service dependencies (Postgres, Redis)...${NC}"
docker compose -f "$CONTENT_COMPOSE" up -d db redis

# Wait for Postgres (mapped host port 5433 per compose)
wait_for_port localhost 5433 60

# Wait for Redis (mapped host port 6380 per compose)
wait_for_port localhost 6380 60

# 5) Start Content Service itself
echo -e "${GREEN}Starting Content Service...${NC}"
docker compose -f "$CONTENT_COMPOSE" up -d content-service

# 6) Health checks and summary
echo -e "${YELLOW}Waiting for Content Service health endpoint...${NC}"
sleep 5

CONTENT_PORT=$(awk -F '[:"]+' '/\s-\s"8002:8002"/ {print "8002"}' "$CONTENT_COMPOSE" || true)
CONTENT_PORT=${CONTENT_PORT:-8002}

wait_for_port localhost "$CONTENT_PORT" 90

echo -e "\n${GREEN}All set!${NC}"
echo -e "- Content Service: http://localhost:${CONTENT_PORT}/api/v1/health"
echo -e "- Postgres: localhost:5433 (db=content_db, user=content_user, pass=content_password)"
echo -e "- Redis: localhost:6380"
if [ -f "$KAFKA_COMPOSE" ]; then
  echo -e "- Kafka Broker: localhost:9092 (UI: http://localhost:8080)"
fi

echo -e "\nUse 'docker compose -f "$CONTENT_COMPOSE" logs -f content-service' to view service logs."


