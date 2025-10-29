#!/usr/bin/env bash

set -euo pipefail

# Setup script for WriteWave analytics-service local environment
# - Starts ClickHouse (8123/9000), Postgres (5432), Redis (6379)
# - Attempts to start Kafka (cluster via repo compose, or single-node fallback)
# - Prepares backend/analytics-service/.env if missing
# - Installs deps and starts analytics-service

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
SERVICE_DIR="$ROOT_DIR/backend/analytics-service"

# Default ports and creds matching backend/analytics-service/env.example
CLICKHOUSE_HTTP_PORT=${CLICKHOUSE_HTTP_PORT:-8123}
CLICKHOUSE_NATIVE_PORT=${CLICKHOUSE_NATIVE_PORT:-9000}
POSTGRES_PORT=${POSTGRES_PORT:-5432}
POSTGRES_DB=${POSTGRES_DB:-analytics}
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-password}
REDIS_PORT=${REDIS_PORT:-6379}

KAFKA_COMPOSE="$ROOT_DIR/infrastructure/message-queue/kafka/docker-compose.yml"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Error: Required command '$1' not found. Please install it and re-run." >&2
    exit 1
  fi
}

docker_running() {
  docker ps --format '{{.Names}}' | grep -q "^$1$" || return 1
}

docker_exists() {
  docker ps -a --format '{{.Names}}' | grep -q "^$1$" || return 1
}

up_clickhouse() {
  local cname="clickhouse-analytics"
  if docker_running "$cname"; then
    echo "ClickHouse already running ($cname)"
    return
  fi
  if docker_exists "$cname"; then
    echo "Starting existing ClickHouse container ($cname)"
    docker start "$cname"
  else
    echo "Creating ClickHouse container ($cname)"
    docker run -d \
      --name "$cname" \
      -p "$CLICKHOUSE_HTTP_PORT:8123" \
      -p "$CLICKHOUSE_NATIVE_PORT:9000" \
      -e CLICKHOUSE_DB=analytics \
      -e CLICKHOUSE_USER=default \
      -e CLICKHOUSE_PASSWORD= \
      --health-cmd='wget --spider -q http://localhost:8123/ping || exit 1' \
      --health-interval=5s --health-timeout=3s --health-retries=30 \
      clickhouse/clickhouse-server:latest
  fi
}

up_postgres() {
  local cname="postgres-analytics"
  if docker_running "$cname"; then
    echo "Postgres already running ($cname)"
  else
    if docker_exists "$cname"; then
      echo "Starting existing Postgres container ($cname)"
      docker start "$cname"
    else
      echo "Creating Postgres container ($cname)"
      docker run -d \
        --name "$cname" \
        -p "$POSTGRES_PORT:5432" \
        -e POSTGRES_DB="$POSTGRES_DB" \
        -e POSTGRES_USER="$POSTGRES_USER" \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        --health-cmd='pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1' \
        --health-interval=5s --health-timeout=3s --health-retries=30 \
        timescale/timescaledb:latest-pg15
    fi
  fi

  echo "Waiting for Postgres to be healthy..."
  docker wait --condition=healthy postgres-analytics >/dev/null 2>&1 || true

  echo "Ensuring required extensions exist (pgcrypto)"
  docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" postgres-analytics \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
    -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
}

up_redis() {
  local cname="redis-analytics"
  if docker_running "$cname"; then
    echo "Redis already running ($cname)"
    return
  fi
  if docker_exists "$cname"; then
    echo "Starting existing Redis container ($cname)"
    docker start "$cname"
  else
    echo "Creating Redis container ($cname)"
    docker run -d \
      --name "$cname" \
      -p "$REDIS_PORT:6379" \
      --health-cmd='redis-cli ping | grep PONG || exit 1' \
      --health-interval=5s --health-timeout=3s --health-retries=30 \
      redis:7-alpine \
      redis-server --appendonly yes
  fi
}

up_kafka() {
  # Prefer project Kafka compose if available; otherwise single-node fallback
  if [ -f "$KAFKA_COMPOSE" ]; then
    echo "Starting Kafka via project docker-compose (this may take a while)..."
    (cd "$(dirname "$KAFKA_COMPOSE")" && docker compose -f "$KAFKA_COMPOSE" up -d)
  else
    local cname="kafka-single"
    if docker_running "$cname"; then
      echo "Kafka already running ($cname)"
      return
    fi
    if docker_exists "$cname"; then
      echo "Starting existing Kafka container ($cname)"
      docker start "$cname"
    else
      echo "Creating single-node Kafka (Bitnami) container ($cname)"
      docker run -d \
        --name "$cname" \
        -p 9092:9092 \
        -e KAFKA_ENABLE_KRAFT=yes \
        -e KAFKA_CFG_PROCESS_ROLES=broker,controller \
        -e KAFKA_CFG_NODE_ID=1 \
        -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=1@localhost:9093 \
        -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
        -e KAFKA_CFG_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
        -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
        -e KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true \
        bitnami/kafka:latest
    fi
  fi
}

prepare_env_file() {
  if [ ! -d "$SERVICE_DIR" ]; then
    echo "Error: analytics-service directory not found at $SERVICE_DIR" >&2
    exit 1
  fi

  if [ ! -f "$SERVICE_DIR/.env" ]; then
    echo "Creating $SERVICE_DIR/.env from env.example and aligning to local ports"
    cp "$SERVICE_DIR/env.example" "$SERVICE_DIR/.env"
    # Update to local service URLs
    sed -i "s|^CLICKHOUSE_URL=.*|CLICKHOUSE_URL=http://localhost:$CLICKHOUSE_HTTP_PORT|" "$SERVICE_DIR/.env"
    sed -i "s|^POSTGRES_URL=.*|POSTGRES_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB|" "$SERVICE_DIR/.env"
    sed -i "s|^REDIS_URL=.*|REDIS_URL=redis://localhost:$REDIS_PORT|" "$SERVICE_DIR/.env"
  else
    echo "Found existing $SERVICE_DIR/.env (skipping)"
  fi
}

install_and_start_service() {
  echo "Installing analytics-service dependencies"
  (cd "$SERVICE_DIR" && if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi)

  echo "Starting analytics-service (background)"
  # Use npm run dev if available, else npm start
  if grep -q '"dev"' "$SERVICE_DIR/package.json"; then
    (cd "$SERVICE_DIR" && nohup npm run dev >/dev/null 2>&1 &)
  else
    (cd "$SERVICE_DIR" && nohup npm start >/dev/null 2>&1 &)
  fi
}

main() {
  require_cmd docker
  # docker compose plugin or classic docker-compose
  if ! docker compose version >/dev/null 2>&1; then
    echo "Note: docker compose plugin not found; will avoid compose-based Kafka path if missing."
  fi

  up_clickhouse
  up_postgres
  up_redis
  up_kafka || echo "Warning: Kafka startup encountered an issue; analytics-service does not require Kafka for basic local use."

  prepare_env_file
  install_and_start_service

  echo "\nAll set!"
  echo "- ClickHouse:  http://localhost:$CLICKHOUSE_HTTP_PORT"
  echo "- Postgres:    postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB"
  echo "- Redis:       redis://localhost:$REDIS_PORT"
  echo "- Kafka:       PLAINTEXT://localhost:9092 (if available)"
  echo "- Analytics API: http://localhost:8006 (health: /health, API: /api)"
}

main "$@"


