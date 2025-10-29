# WriteWave Content Service

A microservice for managing Japanese learning content including characters (Hiragana, Katakana, Kanji), vocabulary, lessons, and media assets in the WriteWave platform.

## Features

- 📚 **Character Management**: Hiragana, Katakana, and Kanji character data with stroke orders, readings, and meanings
- 📖 **Vocabulary Management**: Comprehensive vocabulary database with categories, JLPT levels, and examples
- 🎓 **Lesson Management**: Structured lessons with content, objectives, prerequisites, and progression paths
- 🎨 **Media Assets**: Image, audio, and video asset management with thumbnail generation
- 🔍 **Advanced Search**: Full-text search with filtering by type, level, and category
- 💾 **Caching**: Redis-based caching for improved performance
- 📊 **Statistics**: Content statistics and analytics
- 🔄 **Event Publishing**: Kafka integration for content events (optional)
- 🛡️ **Security**: Rate limiting, CORS protection, and input validation

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v13 or higher
- **Redis**: v6 or higher (optional but recommended)
- **Kafka**: v3.0 or higher (optional, for event streaming)
- **Prisma**: Included as a dev dependency
- **Docker & Docker Compose**: For running dependencies (optional but recommended)

## Quick Start

### 1. Clone and Navigate to Service

```bash
cd backend/content-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file by copying the example:

```bash
cp env.example .env
```

Edit the `.env` file with your configuration. See [Environment Variables](#environment-variables) section for details.

## Database Setup (PostgreSQL)

### Using Docker Compose (Recommended)

The service includes a `docker-compose.yml` file that sets up PostgreSQL and Redis:

```bash
# Start PostgreSQL and Redis
docker compose up -d db redis

# Wait for services to be ready (they will be available on ports 5433 and 6380)
```

### Manual PostgreSQL Setup

1. **Install PostgreSQL** (if not using Docker)

2. **Create Database**:
```sql
CREATE DATABASE writewave_content;
CREATE USER content_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE writewave_content TO content_user;
```

3. **Update `.env` file**:
```env
DATABASE_URL="postgresql://content_user:your_password@localhost:5432/writewave_content?schema=public"
```

### Run Database Migrations

After setting up the database, run Prisma migrations:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Or deploy migrations in production
npm run prisma:deploy
```

### Prisma Studio (Database GUI)

To view and manage data in the database:

```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`

## Redis Setup

### Using Docker Compose (Recommended)

Redis is automatically started with the docker-compose setup:

```bash
docker compose up -d redis
```

Redis will be available at `localhost:6380` (mapped from container port 6379).

### Manual Redis Setup

1. **Install Redis** (if not using Docker):
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

2. **Update `.env` file**:
```env
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""  # Set if Redis requires authentication
```

### Redis Configuration

Redis is used for:
- **Caching**: Character, vocabulary, lesson, and search result caching
- **Performance**: Reduces database load by caching frequently accessed data

To make Redis optional (service will work without it, but without caching):

```env
OPTIONAL_REDIS=false  # Set to true to make Redis optional
```

## Kafka Setup (Optional)

Kafka is optional and used for publishing content events to other services.

### Using Docker Compillose (Recommended)

The Kafka setup is in the infrastructure folder. Use the provided setup script:

```bash
# From the content-service directory
./setup.sh
```

Or manually start Kafka:

```bash
# Navigate to infrastructure folder
cd ../../infrastructure/message-queue/kafka

# Start Kafka cluster
docker compose up -d
```

This starts:
- Zookeeper (port 2181)
- Kafka Brokers (ports 9092, 9093, 9094)
- Schema Registry (port 8081)
- Kafka UI (port 8080) - http://localhost:8080

### Manual Kafka Setup

1. **Install Kafka**:
```bash
# Download Kafka from https://kafka.apache.org/downloads
# Extract and start Zookeeper and Kafka
```

2. **Update `.env` file**:
```env
ENABLE_KAFKA=true
KAFKA_BROKERS="localhost:9092,localhost:9093,localhost:9094"
KAFKA_CLIENT_ID="content-service"
```

### Kafka Topics

The service publishes to the following topics:
- `content.events` - Content-related events (views, updates, etc.)

Topics are automatically created when Kafka is running. You can also create them manually:

```bash
# List topics
docker exec -it kafka-1 kafka-topics --list --bootstrap-server localhost:9092

# Create content topic manually (if needed)
docker exec -it kafka-1 kafka-topics --create \
  --topic content.events \
  --bootstrap-server localhost:9092 \
  --partitions 3 \
  --replication-factor 3
```

### Disable Kafka

If you don't want to use Kafka:

```env
ENABLE_KAFKA=false
OPTIONAL_KAFKA=true
```

The service will run normally without Kafka, but won't publish events.

## Starting the Server

### Development Mode

Using nodemon for automatic reloading:

```bash
npm run dev
```

### Production Mode

1. **Build the service**:
```bash
npm run build
```

2. **Start the server**:
```bash
npm start
```

The service will start on port `8002` (or the port specified in `.env`).

### Using Docker

Build and run with Docker:

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run
```

Or use Docker Compose:

```bash
# Start all services (PostgreSQL, Redis, Content Service)
docker compose up -d

# View logs
docker compose logs -f content-service

# Stop all services
docker compose down
```

### Using Setup Script

The `setup.sh` script automates the entire setup:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check for required tools (Docker, nc, etc.)
2. Create `.env` file from `env.example` if it doesn't exist
3. Start Kafka (if available)
4. Start PostgreSQL and Redis
5. Start the Content Service
6. Wait for all services to be ready
7. Display service URLs

## Environment Variables

Key environment variables (see `env.example` for complete list):

### Required

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/writewave_content?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"
```

### Optional

```env
# Server
PORT=8002
NODE_ENV="development"

# Redis
REDIS_PASSWORD=""
OPTIONAL_REDIS=false

# Kafka
ENABLE_KAFKA=false
OPTIONAL_KAFKA=false
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="content-service"

# File Uploads
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH="./uploads"

# Caching
CACHE_TTL=3600  # 1 hour
CACHE_PREFIX="writewave:content:"

# Security
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000,https://writewave.app"
```

## API Endpoints

### Health Check

```bash
GET /api/v1/health
```

### Characters

- `GET /api/v1/characters` - List characters with pagination
- `GET /api/v1/characters/:id` - Get character by ID
- `POST /api/v1/characters` - Create character
- `PUT /api/v1/characters/:id` - Update character
- `DELETE /api/v1/characters/:id` - Delete character
- `GET /api/v1/characters/search` - Search characters

### Vocabulary

- `GET /api/v1/vocabulary` - List vocabulary with pagination
- `GET /api/v1/vocabulary/:id` - Get vocabulary by ID
- `POST /api/v1/vocabulary` - Create vocabulary
- `PUT /api/v1/vocabulary/:id` - Update vocabulary
- `DELETE /api/v1/vocabulary/:id` - Delete vocabulary
- `GET /api/v1/vocabulary/search` - Search vocabulary

### Lessons

- `GET /api/v1/lessons` - List lessons with pagination
- `GET /api/v1/lessons/:id` - Get lesson by ID
- `POST /api/v1/lessons` - Create lesson
- `PUT /api/v1/lessons/:id` - Update lesson
- `DELETE /api/v1/lessons/:id` - Delete lesson
- `GET /api/v1/lessons/search` - Search lessons

### Media

- `GET /api/v1/media` - List media assets
- `GET /api/v1/media/:id` - Get media asset by ID
- `POST /api/v1/media/upload` - Upload media file
- `DELETE /api/v1/media/:id` - Delete media asset

## Development

### Project Structure

```
src/
├── config/          # Configuration (database, redis, logger)
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API route definitions
├── services/        # Business logic
└── types/           # TypeScript types
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

### Database Schema Changes

When modifying the Prisma schema:

1. **Edit** `prisma/schema.prisma`
2. **Create migration**:
```bash
npm run prisma:migrate
```
3. **Generate Prisma Client**:
```bash
npm run prisma:generate
```

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:
```bash
docker compose ps db
# or
pg_isready -h localhost -p 5433
```

2. Check DATABASE_URL in `.env` matches your database configuration
3. Ensure database exists and user has proper permissions

### Redis Connection Issues

1. Verify Redis is running:
```bash
docker compose ps redis
# or
redis-cli ping
```

2. Check REDIS_URL in `.env`
3. If Redis is optional, set `OPTIONAL_REDIS=true`

### Kafka Connection Issues

1. Verify Kafka brokers are running:
```bash
docker compose ps  # Check kafka-1, kafka-2, kafka-3
```

2. Check Kafka is accessible:
```bash
docker exec -it kafka-1 kafka-topics --list --bootstrap-server localhost:9092
```

3. If Kafka is optional, set `ENABLE_KAFKA=false`

### Port Already in Use

If port 8002 is already in use:

1. Change PORT in `.env`:
```env
PORT=8003
```

2. Or stop the service using the port:
```bash
# Find process using port 8002
lsof -i :8002
# Kill the process
kill -9 <PID>
```

### Build Errors

If you encounter TypeScript build errors:

1. **Clean build**:
```bash
rm -rf dist node_modules
npm install
npm run build
```

2. **Check TypeScript version**:
```bash
npm list typescript
```

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Content Service | 8002 | Main API service |
| PostgreSQL | 5433 | Database (mapped from 5432) |
| Redis | 6380 | Cache (mapped from 6379) |
| Kafka Broker 1 | 9092 | Message broker |
| Kafka UI | 8080 | Kafka management UI |

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production` in `.env`
2. Use secure database credentials
3. Enable Redis for caching
4. Configure proper CORS origins
5. Set up proper logging

### Database Migrations

In production, use:

```bash
npm run prisma:deploy
```

This applies migrations without creating new migration files.

### Docker Deployment

Build and push Docker image:

```bash
docker build -t writewave/content-service:latest .
docker push writewave/content-service:latest
```

### Health Checks

Monitor service health:

```bash
curl http://localhost:8002/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "service": "healthy",
    "database": "healthy",
    "redis": "healthy"
  }
}
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please contact the WriteWave development team.

