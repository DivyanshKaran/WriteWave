# Progress Service

The Progress Service is a microservice responsible for tracking user learning progress, XP systems, achievements, streaks, analytics, and leaderboards for the WriteWave Japanese learning platform.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
  - [Database Setup (PostgreSQL)](#database-setup-postgresql)
  - [Redis Setup](#redis-setup)
  - [Kafka Setup](#kafka-setup)
  - [Progress Service Setup](#progress-service-setup)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Running the Service](#running-the-service)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Features

- **XP System**: Track user experience points with multiple sources and multipliers
- **Leveling System**: Dynamic level calculation with rewards
- **Achievements**: Comprehensive achievement system with categories and rarity
- **Streaks**: Daily practice streaks with freeze functionality
- **Character Mastery**: Track character learning progress (Hiragana, Katakana, Kanji)
- **Analytics**: User learning analytics and insights
- **Leaderboards**: Daily, weekly, monthly, and all-time rankings
- **Caching**: Redis-based caching for performance
- **Event Streaming**: Kafka integration for real-time events

## Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 15.0
- **Redis**: >= 7.0
- **Kafka**: >= 2.8.0 (optional, for event streaming)
- **Docker** (optional, for containerized setup): >= 20.10.0
- **Docker Compose** (optional): >= 2.0.0

## Quick Start

The easiest way to get started is using the automated setup script:

```bash
cd backend/progress-service
./setup.sh
```

Or manually using Docker Compose:

```bash
# Navigate to the progress-service directory
cd backend/progress-service

# Step 1: Fix node_modules permissions (if needed)
# If you see permission errors, run this first:
sudo chown -R $USER:$USER node_modules 2>/dev/null || true

# Step 2: Start all dependencies (PostgreSQL, Redis)
docker-compose up -d db redis

# Step 3: Wait for services to be ready (about 10-15 seconds)
sleep 15

# Step 4: Install dependencies
# If you get permission errors, see Troubleshooting section
npm install

# Step 5: Setup environment variables
cp env.example .env
# Edit .env file with your configuration (see Environment Variables section)

# Step 6: Generate Prisma client
npm run prisma:generate

# Step 7: Run database migrations
npm run prisma:migrate

# Step 8: Start the service in development mode
npm run dev
```

**Expected Output:**
```
Server is running on port 8003
Database connected successfully
Redis connected successfully
Progress Service v1.0.0 is ready
```

The service will be available at `http://localhost:8003`.

**Verify it's running:**
```bash
# Check health endpoint
curl http://localhost:8003/api/v1/health

# Expected response:
# {"success":true,"status":"healthy","db":"ok","redis":"ok","latencyMs":50}
```

## Local Development Setup

### Database Setup (PostgreSQL)

#### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name progress-postgres \
  -e POSTGRES_DB=progress_db \
  -e POSTGRES_USER=progress_user \
  -e POSTGRES_PASSWORD=progress_password \
  -p 5434:5432 \
  postgres:15-alpine

# Verify PostgreSQL is running
docker ps | grep progress-postgres
```

#### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib

   # macOS (using Homebrew)
   brew install postgresql@15
   brew services start postgresql@15

   # Windows
   # Download and install from https://www.postgresql.org/download/windows/
   ```

2. **Create Database and User**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres

   # In PostgreSQL shell:
   CREATE DATABASE progress_db;
   CREATE USER progress_user WITH PASSWORD 'progress_password';
   GRANT ALL PRIVILEGES ON DATABASE progress_db TO progress_user;
   \q
   ```

3. **Update Connection String**:
   ```bash
   # Update DATABASE_URL in .env file
   DATABASE_URL=postgresql://progress_user:progress_password@localhost:5432/progress_db
   ```

#### Option 3: Using Infrastructure Docker Compose

If you're running the full WriteWave infrastructure:

```bash
# From the infrastructure directory
cd ../../infrastructure
docker-compose up -d postgres-progress-primary

# The database will be available at localhost:5435
# Update DATABASE_URL in .env:
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5435/writewave_progress
```

### Redis Setup

#### Option 1: Using Docker (Recommended)

```bash
# Start Redis container
docker run -d \
  --name progress-redis \
  -p 6381:6379 \
  redis:7-alpine

# Verify Redis is running
docker ps | grep progress-redis

# Test Redis connection
docker exec -it progress-redis redis-cli ping
# Should return: PONG
```

#### Option 2: Local Redis Installation

1. **Install Redis**:
   ```bash
   # Ubuntu/Debian
   sudo apt-get update
   sudo apt-get install redis-server

   # macOS (using Homebrew)
   brew install redis
   brew services start redis

   # Windows
   # Use WSL2 or Docker
   ```

2. **Start Redis**:
   ```bash
   # Ubuntu/Debian
   sudo systemctl start redis-server
   sudo systemctl enable redis-server

   # macOS
   redis-server

   # Verify Redis is running
   redis-cli ping
   # Should return: PONG
   ```

3. **Update Connection String**:
   ```bash
   # Update REDIS_URL in .env file
   REDIS_URL=redis://localhost:6379
   ```

#### Option 3: Using Infrastructure Docker Compose

If you're running the full WriteWave infrastructure with Redis cluster:

```bash
# From the infrastructure directory
cd ../../infrastructure
docker-compose up -d redis-cluster-proxy

# Redis will be available at localhost:6379
# Update REDIS_URL in .env:
REDIS_URL=redis://localhost:6379
```

### Kafka Setup

Kafka is optional but recommended for event streaming. If you don't need it, set `OPTIONAL_KAFKA=false` and `ENABLE_KAFKA=false` in your `.env` file.

#### Option 1: Using Infrastructure Docker Compose (Recommended)

```bash
# From the infrastructure directory
cd ../../infrastructure/message-queue/kafka
docker-compose up -d

# Wait for Kafka to be ready (about 30-60 seconds)
sleep 60

# Verify Kafka is running
docker-compose ps

# Check if topics are created
docker exec -it kafka-1 kafka-topics --list --bootstrap-server localhost:9092
```

Kafka will be available at:
- **Broker 1**: `localhost:9092`
- **Broker 2**: `localhost:9093`
- **Broker 3**: `localhost:9094`
- **Kafka UI**: `http://localhost:8080`
- **Schema Registry**: `http://localhost:8081`

#### Option 2: Using Docker Compose (Single Broker)

For development, you can use a simpler single-broker setup:

```bash
# Create a simple docker-compose.yml for Kafka
cat > docker-compose.kafka.yml << 'EOF'
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    ports:
      - "2181:2181"

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
EOF

# Start Kafka
docker-compose -f docker-compose.kafka.yml up -d

# Wait for Kafka to be ready
sleep 30

# Create progress.events topic
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic progress.events \
  --partitions 3 \
  --replication-factor 1
```

#### Option 3: Local Kafka Installation

1. **Download Kafka**:
   ```bash
   # Download from https://kafka.apache.org/downloads
   wget https://downloads.apache.org/kafka/2.8.0/kafka_2.13-2.8.0.tgz
   tar -xzf kafka_2.13-2.8.0.tgz
   cd kafka_2.13-2.8.0
   ```

2. **Start Zookeeper**:
   ```bash
   bin/zookeeper-server-start.sh config/zookeeper.properties
   ```

3. **Start Kafka** (in a new terminal):
   ```bash
   bin/kafka-server-start.sh config/server.properties
   ```

4. **Create Topics**:
   ```bash
   bin/kafka-topics.sh --create \
     --bootstrap-server localhost:9092 \
     --topic progress.events \
     --partitions 3 \
     --replication-factor 1
   ```

#### Update Environment Variables

After setting up Kafka, update your `.env` file:

```bash
# Enable Kafka
ENABLE_KAFKA=true
OPTIONAL_KAFKA=false

# Kafka configuration
KAFKA_BROKERS=localhost:9092
# For multiple brokers: KAFKA_BROKERS=localhost:9092,localhost:9093,localhost:9094
KAFKA_CLIENT_ID=progress-service
```

### Progress Service Setup

#### Option 1: Using Setup Script (Recommended)

```bash
# Navigate to the progress-service directory
cd backend/progress-service

# Run the setup script (handles permissions, installs dependencies, etc.)
./setup.sh
```

The setup script will:
- ✅ Fix node_modules permissions automatically
- ✅ Check Node.js version
- ✅ Install dependencies
- ✅ Create .env file from env.example
- ✅ Generate Prisma client
- ✅ Verify configuration

#### Option 2: Manual Setup

1. **Clone and Navigate**:
   ```bash
   cd backend/progress-service
   ```

2. **Fix Permissions** (if needed):
   ```bash
   # Fix ownership to prevent permission issues
   sudo chown -R $USER:$USER .
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Setup Environment Variables**:
   ```bash
   cp env.example .env
   ```

4. **Edit `.env` file** with your configuration:
   ```bash
   # Database
   DATABASE_URL=postgresql://progress_user:progress_password@localhost:5434/progress_db

   # Redis
   REDIS_URL=redis://localhost:6381

   # Kafka (if enabled)
   KAFKA_BROKERS=localhost:9092
   ENABLE_KAFKA=true

   # JWT (get from user-service or generate)
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   ```

5. **Generate Prisma Client**:
   ```bash
   npm run prisma:generate
   ```

6. **Run Database Migrations**:
   ```bash
   # Create and apply migrations
   npm run prisma:migrate

   # Or apply existing migrations
   npm run prisma:deploy
   ```

7. **Verify Database Schema**:
   ```bash
   # Open Prisma Studio to view the database
   npm run prisma:studio
   ```

## Docker Setup

### Full Stack Setup

The service includes a `docker-compose.yml` file for running the entire stack:

```bash
# Start all services (PostgreSQL, Redis, Progress Service)
docker-compose up -d

# View logs
docker-compose logs -f progress-service

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Build Docker Image

```bash
# Build the image
docker build -t progress-service:latest .

# Run the container
docker run -d \
  --name progress-service \
  -p 8003:8003 \
  --env-file .env \
  progress-service:latest
```

## Environment Variables

See `env.example` for all available environment variables. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `8003` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `ENABLE_KAFKA` | Enable Kafka integration | `false` |
| `OPTIONAL_KAFKA` | Make Kafka optional (won't fail if unavailable) | `false` |
| `OPTIONAL_REDIS` | Make Redis optional | `false` |
| `JWT_SECRET` | JWT signing secret | Required |
| `USER_SERVICE_URL` | User service URL | `http://localhost:8001` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |

## Database Migrations

### Create a New Migration

```bash
# Make changes to prisma/schema.prisma, then:
npm run prisma:migrate

# This will:
# 1. Create a new migration file
# 2. Apply it to the database
# 3. Regenerate Prisma Client
```

### Apply Migrations

```bash
# Apply pending migrations
npm run prisma:deploy

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### View Database

```bash
# Open Prisma Studio
npm run prisma:studio

# Access at http://localhost:5555
```

## Running the Service

### Prerequisites Before Starting

Ensure you have completed the setup steps:
1. ✅ Installed dependencies: `npm install`
2. ✅ Created `.env` file: `cp env.example .env`
3. ✅ Configured database connection in `.env`
4. ✅ Configured Redis connection in `.env`
5. ✅ Generated Prisma client: `npm run prisma:generate`
6. ✅ Run database migrations: `npm run prisma:migrate`
7. ✅ Started PostgreSQL and Redis services

### Development Mode

```bash
# Start with hot reload (automatically restarts on file changes)
npm run dev

# The service will be available at http://localhost:8003
# Check health endpoint: curl http://localhost:8003/api/v1/health
```

**What happens:**
- Service starts on port 8003 (or PORT from .env)
- Hot reload enabled - changes to `.ts` files automatically restart the server
- Logs will show in the console
- Database connection is established automatically
- Redis connection is established automatically

### Production Mode

```bash
# Step 1: Build TypeScript to JavaScript
npm run build

# Step 2: Start the compiled service
npm start

# The service will be available at http://localhost:8003
```

**What happens:**
- TypeScript is compiled to JavaScript in the `dist/` directory
- Service runs the compiled JavaScript from `dist/index.js`
- No hot reload - requires manual restart for changes
- Optimized for production performance

### Using the Start Script

There's also a convenient start script in the project root:

```bash
# From project root
./scripts/start-progress-service.sh
```

This script handles service startup with proper configuration.

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start dist/index.js --name progress-service

# View logs
pm2 logs progress-service

# Monitor
pm2 monit

# Stop
pm2 stop progress-service
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## API Documentation

### Health Check

```bash
# Check service health
curl http://localhost:8003/api/v1/health

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "db": "ok",
#   "redis": "ok",
#   "latencyMs": 50
# }
```

### Postman Collection

Import the `postman.json` file into Postman for comprehensive API testing.

```bash
# In Postman:
# File -> Import -> Select postman.json
```

### API Endpoints

- **Health**: `GET /api/v1/health`
- **User Progress**: `GET /api/v1/progress/:userId`
- **Character Practice**: `POST /api/v1/progress/character-practice`
- **Update XP**: `PUT /api/v1/progress/xp`
- **Streaks**: `GET /api/v1/progress/streaks/:userId`
- **Achievements**: `GET /api/v1/progress/achievements/:userId`
- **Analytics**: `GET /api/v1/progress/analytics/:userId`
- **Leaderboard**: `GET /api/v1/progress/leaderboard/:period`

See `postman.json` for complete API documentation and examples.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5434

# Test connection
psql -h localhost -p 5434 -U progress_user -d progress_db

# Check connection string format
# Should be: postgresql://user:password@host:port/database
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis
# or
redis-cli ping

# Test connection
redis-cli -h localhost -p 6381 ping
# Should return: PONG
```

### Kafka Connection Issues

```bash
# Check if Kafka is running
docker ps | grep kafka

# Test Kafka connectivity
docker exec -it kafka-1 kafka-topics --list --bootstrap-server localhost:9092

# Check if topics exist
docker exec -it kafka-1 kafka-topics --describe --bootstrap-server localhost:9092 --topic progress.events
```

### Prisma Issues

```bash
# Reset Prisma Client
rm -rf node_modules/.prisma
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Port Already in Use

```bash
# Find process using port 8003
lsof -i :8003
# or
netstat -tulpn | grep 8003

# Kill the process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Rebuild the project
npm run build
```

### Installation Issues

#### Permission Errors (EACCES)

If you encounter `EACCES` or permission denied errors during `npm install`:

**Problem**: `node_modules` directory is owned by root instead of your user.

**Solution 1: Fix ownership (Recommended)**:
```bash
# Fix ownership of node_modules directory
sudo chown -R $USER:$USER node_modules

# Or fix the entire project directory
sudo chown -R $USER:$USER .

# Then try installing again
npm install
```

**Solution 2: Remove and reinstall**:
```bash
# Remove node_modules and package-lock.json
sudo rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall as your user (NOT with sudo)
npm install
```

**Prevention**: Never run `npm install` with `sudo`. If you need to fix permissions, always use `chown` first.

#### Package Lock Out of Sync

If you see errors like `Missing: axios@X.X.X from lock file` or `npm ci can only install packages when your package.json and package-lock.json are in sync`:

**Problem**: `package-lock.json` is out of sync with `package.json` (happens when dependencies are added without updating the lock file).

**Solution**:
```bash
# Remove node_modules and reinstall to sync
rm -rf node_modules
npm install

# This will update package-lock.json with the correct versions
```

**If you see ENOTEMPTY errors**:
```bash
# This happens when npm tries to rename directories during update
# Solution: Remove node_modules completely first
rm -rf node_modules
npm install
```

**Note**: The `setup.sh` script automatically handles this by removing `node_modules` and running `npm install` if `npm ci` fails due to sync issues.

### TypeScript Configuration Issues

If you see TypeScript compilation errors related to shared modules:

```bash
# Verify tsconfig.json is valid
npx tsc --showConfig

# Check for duplicate keys in tsconfig.json
cat tsconfig.json | grep -A 5 "paths"
```

### Environment Variables Not Loading

```bash
# Ensure .env file exists
ls -la .env

# Check if dotenv is properly configured
# The service should load .env automatically

# Verify environment variables are loaded
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

## Architecture

### Service Dependencies

```
Progress Service
├── PostgreSQL (Primary Database)
│   └── Stores: User progress, XP, achievements, streaks, analytics
├── Redis (Caching)
│   └── Caches: User progress, leaderboards, session data
└── Kafka (Event Streaming)
    └── Publishes: progress.events, xp.earned, achievement.unlocked
```

### External Service Integration

- **User Service**: User authentication and profile validation
- **Content Service**: Character and lesson data
- **Notification Service**: Achievement and milestone notifications

## Development

### Project Structure

```
progress-service/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── types/           # TypeScript types
├── prisma/
│   └── schema.prisma    # Database schema
├── dist/                # Compiled JavaScript
├── logs/                # Application logs
└── postman.json         # Postman collection
```

### Code Style

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## License

MIT

## Support

For issues and questions, please open an issue in the repository or contact the WriteWave Team.

