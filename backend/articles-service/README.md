# Articles Service

The Articles Service is a microservice responsible for managing articles, comments, likes, bookmarks, and tags for the WriteWave Japanese learning platform. It provides a comprehensive content management system with features like trending articles, featured content, and analytics.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Local Development Setup](#local-development-setup)
  - [Database Setup (PostgreSQL)](#database-setup-postgresql)
  - [Redis Setup](#redis-setup)
  - [Kafka Setup](#kafka-setup)
  - [Articles Service Setup](#articles-service-setup)
- [Docker Setup](#docker-setup)
- [Environment Variables](#environment-variables)
- [Database Migrations](#database-migrations)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Features

- **Article Management**: Create, read, update, and delete articles
- **Markdown Support**: Write articles in Markdown with automatic HTML rendering
- **Comments System**: Nested comments with reply functionality
- **Social Features**: Like and bookmark articles
- **Tagging System**: Tag articles for better organization and discovery
- **Trending & Featured**: Automatic trending articles detection and featured content
- **Analytics**: View counts, like counts, comment counts, and read time calculation
- **Caching**: Redis-based caching for improved performance
- **Event Streaming**: Kafka integration for real-time article events
- **File Uploads**: Support for article images and media
- **Search & Filtering**: Filter articles by tags, author, published status, etc.

## Prerequisites

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 15.0
- **Redis**: >= 7.0
- **Kafka**: >= 2.8.0 (optional, for event streaming)
- **Docker** (optional, for containerized setup): >= 20.10.0
- **Docker Compose** (optional): >= 2.0.0

## Quick Start

### Using Docker Compose (Recommended)

The fastest way to get started is using Docker Compose:

```bash
# Navigate to the articles-service directory
cd backend/articles-service

# Step 1: Start all dependencies (PostgreSQL, Redis)
docker-compose up -d postgres redis

# Step 2: Wait for services to be ready (about 10-15 seconds)
sleep 15

# Step 3: Install dependencies
npm install

# Step 4: Setup environment variables
cp env.example .env
# Edit .env file with your configuration (see Environment Variables section)

# Step 5: Generate Prisma client
npm run prisma:generate

# Step 6: Run database migrations
npm run prisma:migrate

# Step 7: Start the service in development mode
npm run dev
```

**Expected Output:**
```
Server is running on port 8007
Database connected successfully
Redis connected successfully
Kafka producer connected (if enabled)
Articles Service v1.0.0 is ready
```

The service will be available at `http://localhost:8007`.

**Verify it's running:**
```bash
# Check health endpoint
curl http://localhost:8007/api/health

# Expected response:
# {"success":true,"status":"healthy","checks":{"service":"healthy","database":"healthy","redis":"healthy"},"version":"1.0.0"}
```

## Local Development Setup

### Database Setup (PostgreSQL)

#### Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run -d \
  --name articles-postgres \
  -e POSTGRES_DB=writewave_articles \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5433:5432 \
  postgres:15-alpine

# Verify PostgreSQL is running
docker ps | grep articles-postgres

# Test connection
docker exec -it articles-postgres psql -U postgres -d writewave_articles -c "SELECT version();"
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
   CREATE DATABASE writewave_articles;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE writewave_articles TO postgres;
   \q
   ```

3. **Update Connection String**:
   ```bash
   # Update DATABASE_URL in .env file
   DATABASE_URL=postgresql://postgres:password@localhost:5432/writewave_articles?schema=public
   ```

#### Option 3: Using Infrastructure Docker Compose

If you're running the full WriteWave infrastructure:

```bash
# From the infrastructure directory
cd ../../infrastructure
docker-compose up -d postgres-articles-primary

# The database will be available at localhost:5433
# Update DATABASE_URL in .env:
DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@localhost:5433/writewave_articles?schema=public
```

### Redis Setup

#### Option 1: Using Docker (Recommended)

```bash
# Start Redis container
docker run -d \
  --name articles-redis \
  -p 6380:6379 \
  redis:7-alpine

# Verify Redis is running
docker ps | grep articles-redis

# Test Redis connection
docker exec -it articles-redis redis-cli ping
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

Kafka is optional but recommended for event streaming. If you don't need it, set `ENABLE_KAFKA=false` in your `.env` file.

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

# Create articles.events topic
docker exec -it kafka kafka-topics --create \
  --bootstrap-server localhost:9092 \
  --topic articles.events \
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
     --topic articles.events \
     --partitions 3 \
     --replication-factor 1
   ```

#### Update Environment Variables

After setting up Kafka, update your `.env` file:

```bash
# Enable Kafka
ENABLE_KAFKA=true

# Kafka configuration
KAFKA_BROKERS=localhost:9092
# For multiple brokers: KAFKA_BROKERS=localhost:9092,localhost:9093,localhost:9094
KAFKA_CLIENT_ID=articles-service
```

### Articles Service Setup

1. **Clone and Navigate**:
   ```bash
   cd backend/articles-service
   ```

2. **Install Dependencies**:
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
   DATABASE_URL=postgresql://postgres:password@localhost:5433/writewave_articles?schema=public

   # Redis
   REDIS_URL=redis://localhost:6380

   # Kafka (if enabled)
   KAFKA_BROKERS=localhost:9092
   ENABLE_KAFKA=true

   # JWT (get from user-service or generate)
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Server
   PORT=8007
   NODE_ENV=development
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
# Start all services (PostgreSQL, Redis, Articles Service)
docker-compose up -d

# View logs
docker-compose logs -f articles-service

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Build Docker Image

```bash
# Build the image
docker build -t articles-service:latest .

# Run the container
docker run -d \
  --name articles-service \
  -p 8007:8007 \
  --env-file .env \
  articles-service:latest
```

## Environment Variables

See `env.example` for all available environment variables. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `8007` |
| `NODE_ENV` | Environment | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `ENABLE_KAFKA` | Enable Kafka integration | `false` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `MAX_FILE_SIZE` | Maximum upload size (bytes) | `10485760` (10MB) |
| `UPLOAD_PATH` | File upload directory | `./uploads` |
| `LOG_LEVEL` | Logging level | `info` |

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
npm run prisma migrate reset --force
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
8. ✅ (Optional) Started Kafka if `ENABLE_KAFKA=true`

### Development Mode

```bash
# Start with hot reload (automatically restarts on file changes)
npm run dev

# The service will be available at http://localhost:8007
# Check health endpoint: curl http://localhost:8007/api/health
```

**What happens:**
- Service starts on port 8007 (or PORT from .env)
- Hot reload enabled - changes to `.ts` files automatically restart the server
- Logs will show in the console
- Database connection is established automatically
- Redis connection is established automatically
- Kafka producer connects if `ENABLE_KAFKA=true`

### Production Mode

```bash
# Step 1: Build TypeScript to JavaScript
npm run build

# Step 2: Start the compiled service
npm start

# The service will be available at http://localhost:8007
```

**What happens:**
- TypeScript is compiled to JavaScript in the `dist/` directory
- Service runs the compiled JavaScript from `dist/index.js`
- No hot reload - requires manual restart for changes
- Optimized for production performance

### Using the Start Script

There's also a convenient start script in the articles-service directory:

```bash
# From articles-service directory
./setup.sh
```

This script handles:
- Starting PostgreSQL and Redis via Docker Compose
- Waiting for services to be ready
- Installing dependencies
- Generating Prisma client
- Starting the service

### Using PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start dist/index.js --name articles-service

# View logs
pm2 logs articles-service

# Monitor
pm2 monit

# Stop
pm2 stop articles-service
```

## API Documentation

### Health Check

```bash
# Check service health
curl http://localhost:8007/api/health

# Expected response:
# {
#   "success": true,
#   "status": "healthy",
#   "checks": {
#     "service": "healthy",
#     "database": "healthy",
#     "redis": "healthy"
#   },
#   "version": "1.0.0",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### API Endpoints

#### Articles

- **Create Article**: `POST /api/articles`
  ```json
  {
    "title": "Article Title",
    "content": "Markdown content here",
    "excerpt": "Short excerpt",
    "tags": ["tag1", "tag2"],
    "published": true
  }
  ```

- **List Articles**: `GET /api/articles?page=1&limit=10&published=true&tags=tag1,tag2`
- **Get Article**: `GET /api/articles/:id` or `GET /api/articles/:slug`
- **Update Article**: `PUT /api/articles/:id`
- **Delete Article**: `DELETE /api/articles/:id`
- **Like Article**: `POST /api/articles/:id/like`
- **Unlike Article**: `DELETE /api/articles/:id/like` (idempotent)
- **Bookmark Article**: `POST /api/articles/:id/bookmark`
- **Get Trending**: `GET /api/articles/trending`
- **Get Featured**: `GET /api/articles/featured`
- **Get User Articles**: `GET /api/articles/user/:userId`
- **Get Stats**: `GET /api/articles/stats`
- **Get User Stats**: `GET /api/articles/user/:userId/stats`

#### Comments

- **Add Comment**: `POST /api/articles/:id/comments`
  ```json
  {
    "content": "Comment content",
    "parentId": "optional-parent-comment-id"
  }
  ```

- **Get Comments**: `GET /api/articles/:id/comments`

#### Tags

- **Get Popular Tags**: `GET /api/articles/tags/popular`

### Postman Collection

Import the `Postman_Collection.json` file into Postman for comprehensive API testing.

```bash
# In Postman:
# File -> Import -> Select Postman_Collection.json
```

### API Documentation Endpoint

```bash
# Get API documentation
curl http://localhost:8007/api/docs

# Returns JSON with all available endpoints and their descriptions
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# or
pg_isready -h localhost -p 5433

# Test connection
psql -h localhost -p 5433 -U postgres -d writewave_articles

# Check connection string format
# Should be: postgresql://user:password@host:port/database?schema=public
```

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis
# or
redis-cli ping

# Test connection
redis-cli -h localhost -p 6380 ping
# Should return: PONG
```

### Kafka Connection Issues

```bash
# Check if Kafka is running
docker ps | grep kafka

# Test Kafka connectivity
docker exec -it kafka-1 kafka-topics --list --bootstrap-server localhost:9092

# Check if topics exist
docker exec -it kafka-1 kafka-topics --describe --bootstrap-server localhost:9092 --topic articles.events

# If Kafka is optional, you can disable it:
# Set ENABLE_KAFKA=false in .env
```

### Prisma Issues

```bash
# Reset Prisma Client
rm -rf node_modules/.prisma
npm run prisma:generate

# Reset database (WARNING: deletes all data)
npm run prisma migrate reset --force

# Check Prisma schema
cat prisma/schema.prisma
```

### Port Already in Use

```bash
# Find process using port 8007
lsof -i :8007
# or
netstat -tulpn | grep 8007

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

### Environment Variables Not Loading

```bash
# Ensure .env file exists
ls -la .env

# Check if dotenv is properly configured
# The service should load .env automatically

# Verify environment variables are set
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"
```

### File Upload Issues

```bash
# Check upload directory exists
mkdir -p uploads

# Check permissions
chmod 755 uploads

# Verify MAX_FILE_SIZE in .env
# Default is 10485760 (10MB)
```

### Build Errors

```bash
# Clean build artifacts
rm -rf dist

# Rebuild
npm run build

# Check TypeScript configuration
cat tsconfig.json
```

## Architecture

### Service Dependencies

```
Articles Service
├── PostgreSQL (Primary Database)
│   └── Stores: Articles, comments, likes, bookmarks, tags, views
├── Redis (Caching)
│   └── Caches: Popular articles, trending articles, tag stats
└── Kafka (Event Streaming)
    └── Publishes: articles.created, articles.updated, articles.deleted, articles.liked
```

### External Service Integration

- **User Service**: User authentication and profile validation
- **Notification Service**: Article-related notifications (new comments, likes, etc.)

## Development

### Project Structure

```
articles-service/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, uploads)
│   ├── models/          # Prisma models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
├── dist/                # Compiled JavaScript
├── uploads/             # Uploaded files
└── Postman_Collection.json  # Postman collection
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

