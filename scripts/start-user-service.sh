#!/bin/bash

# ============================================================================
# LOCAL DEVELOPMENT SCRIPT - User Service Setup (No Docker)
# ============================================================================
# This script is for LOCAL DEVELOPMENT ONLY
# It attempts to start/check local Redis, Zookeeper, Kafka, ensures database
# exists, installs dependencies, runs Prisma, and starts the dev server.
# ============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"
USER_SERVICE_DIR="$PROJECT_ROOT/backend/user-service"
RUNTIME_DIR="$PROJECT_ROOT/.local-dev"

mkdir -p "$RUNTIME_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  LOCAL DEVELOPMENT - User Service (No Docker)${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Step 0: Load environment
if [ -f "$USER_SERVICE_DIR/.env" ]; then
	echo -e "${YELLOW}Using existing .env at backend/user-service/.env${NC}"
	export $(grep -v '^#' "$USER_SERVICE_DIR/.env" | xargs -d '\n' -0 2>/dev/null || true)
else
	echo -e "${YELLOW}.env missing. Creating from env.example...${NC}"
	cp "$USER_SERVICE_DIR/env.example" "$USER_SERVICE_DIR/.env"
	echo -e "${YELLOW}Please review backend/user-service/.env for correctness.${NC}"
	export $(grep -v '^#' "$USER_SERVICE_DIR/.env" | xargs -d '\n' -0 2>/dev/null || true)
fi

# Provide defaults if not set
DATABASE_URL=${DATABASE_URL:-"postgresql://user:password@localhost:5432/writewave_users?schema=public"}
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}
PORT=${PORT:-8001}

# Step 1: Start/Check Redis (localhost:6379)
REDIS_HOST="$(echo "$REDIS_URL" | sed -n 's|.*://\([^:/]*\).*|\1|p')"
REDIS_PORT="$(echo "$REDIS_URL" | sed -n 's|.*://[^:]*:\([0-9]*\).*|\1|p')"
if [ -z "$REDIS_PORT" ]; then REDIS_PORT=6379; fi

echo -e "${YELLOW}Step 1: Ensuring Redis at ${REDIS_HOST}:${REDIS_PORT}...${NC}"
if command -v redis-cli >/dev/null 2>&1 && redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
	echo -e "${GREEN}✓ Redis already running at ${REDIS_HOST}:${REDIS_PORT}${NC}"
else
	if command -v redis-server >/dev/null 2>&1; then
		REDIS_LOG="$RUNTIME_DIR/redis.log"
		echo -e "${YELLOW}Starting local Redis server on port ${REDIS_PORT}...${NC}"
		nohup redis-server --port "$REDIS_PORT" --appendonly yes > "$REDIS_LOG" 2>&1 &
		sleep 1
		if command -v redis-cli >/dev/null 2>&1 && redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" ping >/dev/null 2>&1; then
			echo -e "${GREEN}✓ Redis started (log: ${REDIS_LOG})${NC}"
		else
			echo -e "${RED}✗ Failed to start Redis. Install Redis or start it manually.${NC}"
		fi
	else
		echo -e "${RED}✗ redis-server not found. Please install Redis or start a local instance at ${REDIS_HOST}:${REDIS_PORT}.${NC}"
	fi
fi

# Step 2: Start/Check Zookeeper (localhost:2181) and Kafka (localhost:9092)
echo -e "${YELLOW}Step 2: Ensuring Zookeeper and Kafka locally...${NC}"
ZOOKEEPER_PORT=2181
KAFKA_PORT=9092

zk_ok=false
kafka_ok=false

# Check Zookeeper
if command -v nc >/dev/null 2>&1 && nc -z localhost "$ZOOKEEPER_PORT" >/dev/null 2>&1; then
	zk_ok=true
	echo -e "${GREEN}✓ Zookeeper already running on localhost:${ZOOKEEPER_PORT}${NC}"
fi

# Start Zookeeper if not running
if [ "$zk_ok" != true ]; then
	if command -v zookeeper-server-start >/dev/null 2>&1; then
		ZK_PROP="$RUNTIME_DIR/zookeeper.properties"
		ZK_DATA="$RUNTIME_DIR/zookeeper-data"
		mkdir -p "$ZK_DATA"
		echo "dataDir=${ZK_DATA}" > "$ZK_PROP"
		echo "clientPort=${ZOOKEEPER_PORT}" >> "$ZK_PROP"
		echo -e "${YELLOW}Starting local Zookeeper...${NC}"
		nohup zookeeper-server-start "$ZK_PROP" > "$RUNTIME_DIR/zookeeper.log" 2>&1 &
		sleep 2
		if nc -z localhost "$ZOOKEEPER_PORT" >/dev/null 2>&1; then
			echo -e "${GREEN}✓ Zookeeper started (log: $RUNTIME_DIR/zookeeper.log)${NC}"
			zk_ok=true
		else
			echo -e "${YELLOW}⚠ Could not confirm Zookeeper; continuing${NC}"
		fi
	else
		echo -e "${YELLOW}⚠ zookeeper-server-start not found. Install Kafka locally to run Zookeeper, or ensure a broker is accessible at localhost:${KAFKA_PORT}.${NC}"
	fi
fi

# Check Kafka
if command -v nc >/dev/null 2>&1 && nc -z localhost "$KAFKA_PORT" >/dev/null 2>&1; then
	kafka_ok=true
	echo -e "${GREEN}✓ Kafka already running on localhost:${KAFKA_PORT}${NC}"
fi

# Start Kafka if not running
if [ "$kafka_ok" != true ] && [ "$zk_ok" = true ]; then
	if command -v kafka-server-start >/dev/null 2>&1; then
		KAFKA_PROP="$RUNTIME_DIR/server.properties"
		KAFKA_LOGS="$RUNTIME_DIR/kafka-logs"
		mkdir -p "$KAFKA_LOGS"
		echo "broker.id=1" > "$KAFKA_PROP"
		echo "listeners=PLAINTEXT://:9092" >> "$KAFKA_PROP"
		echo "advertised.listeners=PLAINTEXT://localhost:9092" >> "$KAFKA_PROP"
		echo "log.dirs=${KAFKA_LOGS}" >> "$KAFKA_PROP"
		echo "zookeeper.connect=localhost:${ZOOKEEPER_PORT}" >> "$KAFKA_PROP"
		echo -e "${YELLOW}Starting local Kafka...${NC}"
		nohup kafka-server-start "$KAFKA_PROP" > "$RUNTIME_DIR/kafka.log" 2>&1 &
		sleep 3
		if nc -z localhost "$KAFKA_PORT" >/dev/null 2>&1; then
			echo -e "${GREEN}✓ Kafka started (log: $RUNTIME_DIR/kafka.log)${NC}"
			kafka_ok=true
		else
			echo -e "${YELLOW}⚠ Could not confirm Kafka; continuing${NC}"
		fi
	else
		echo -e "${YELLOW}⚠ kafka-server-start not found. Install Kafka locally or ensure a broker at localhost:${KAFKA_PORT}.${NC}"
	fi
fi

echo -e "${YELLOW}Kafka status:${NC} ${kafka_ok:+running}${kafka_ok:="not confirmed"}"

echo -e "${YELLOW}Step 3: Ensuring Postgres database exists...${NC}"
# Attempt to create role and database if possible using psql
if command -v psql >/dev/null 2>&1; then
	# Parse DATABASE_URL
	DB_USER=$(echo "$DATABASE_URL" | sed -n 's|.*://\([^:]*\):.*@.*|\1|p')
	DB_PASS=$(echo "$DATABASE_URL" | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
	DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:/]*\).*|\1|p')
	DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*@[^:]*:\([0-9]*\).*|\1|p')
	DB_NAME=$(echo "$DATABASE_URL" | sed -n 's|.*/\([^?]*\).*|\1|p')
	if [ -z "$DB_PORT" ]; then DB_PORT=5432; fi
	
	# Try connecting as postgres superuser to create role/db if needed
	if PGPASSWORD="${PGPASSWORD:-}" psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
		# Create role if not exists
		PGPASSWORD="${PGPASSWORD:-}" psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -d postgres -v ON_ERROR_STOP=1 -tAc "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN CREATE ROLE \"$DB_USER\" LOGIN PASSWORD '$DB_PASS'; END IF; END $$;" || true
		# Create database if not exists
		PGPASSWORD="${PGPASSWORD:-}" psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -d postgres -v ON_ERROR_STOP=1 -tAc "SELECT 'CREATE DATABASE \"$DB_NAME\" OWNER \"$DB_USER\"' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec" || true
		echo -e "${GREEN}✓ Database ensured (${DB_NAME}) on ${DB_HOST}:${DB_PORT}${NC}"
	else
		echo -e "${YELLOW}⚠ Could not connect as postgres to manage DB. Ensure ${DB_NAME} exists and credentials are valid.${NC}"
	fi
else
	echo -e "${YELLOW}⚠ psql not found. Skipping DB bootstrap. Ensure ${DATABASE_URL} is reachable.${NC}"
fi

# Step 4: Install dependencies
cd "$USER_SERVICE_DIR"
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
if [ ! -d node_modules ]; then
	npm install
	echo -e "${GREEN}✓ Dependencies installed${NC}"
else
	echo -e "${YELLOW}node_modules exists, skipping npm install${NC}"
fi

# Step 5: Prisma generate and migrate
echo -e "${YELLOW}Step 5: Generating Prisma client...${NC}"
npm run prisma:generate

echo -e "${YELLOW}Step 6: Running Prisma migrations...${NC}"
if ! npm run prisma:migrate; then
	echo -e "${YELLOW}⚠ Prisma migrate failed or no changes. Continuing...${NC}"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Local services status:${NC}"
echo -e "  - Postgres: ${DB_HOST:-localhost}:${DB_PORT:-5432} (db: ${DB_NAME:-writewave_users})"
echo -e "  - Redis: ${REDIS_HOST:-localhost}:${REDIS_PORT:-6379}"
echo -e "  - Kafka: localhost:${KAFKA_PORT} (${kafka_ok:+running}${kafka_ok:="not confirmed"})"
echo -e "${BLUE}========================================${NC}"

echo -e "${YELLOW}Step 7: Starting User Service on http://localhost:${PORT}${NC}"
npm run dev

