# WriteWave Analytics Service

A comprehensive analytics service for tracking, analyzing, and visualizing user events and learning metrics. Built with TypeScript, Express, ClickHouse, PostgreSQL, and Redis.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Service](#running-the-service)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

- **Event Tracking**: Real-time event tracking and analytics
- **Learning Analytics**: Track and analyze learning metrics and progress
- **Performance Monitoring**: Monitor API performance and system metrics
- **A/B Testing**: Conduct and analyze A/B test results
- **Dashboards**: Create and manage custom analytics dashboards
- **Reports**: Generate and schedule analytics reports
- **Real-time Data**: WebSocket support for real-time analytics updates
- **Scalable Architecture**: Built on ClickHouse for high-performance analytics

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **PostgreSQL** (v14 or higher)
- **ClickHouse** (v22 or higher)
- **Redis** (v7 or higher)
- **Docker** and **Docker Compose** (optional, for containerized setup)
- **Kafka** (optional, for event streaming)

## 🚀 Quick Start

### Using Docker Compose (Recommended for Development)

The fastest way to get started is using Docker Compose:

```bash
# Clone the repository
cd backend/analytics-service

# Copy environment file
cp env.example .env

# Update .env with your configuration
# Edit .env file with your settings

# Start all services
docker-compose up -d

# Check service health
curl http://localhost:8006/health
```

This will start:
- Analytics Service (port 8006)
- ClickHouse (ports 8123, 9000)
- PostgreSQL (port 5437)
- Redis (port 6382)
- Grafana (optional, port 3000)

### Manual Setup

```bash
# Install dependencies
npm install

# Copy and configure environment
cp env.example .env
# Edit .env with your settings

# Start databases (ClickHouse, PostgreSQL, Redis)
# See Database Setup section below

# Build the application
npm run build

# Start the service
npm start
```

## 📥 Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd backend/analytics-service
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```

4. **Configure `.env` file**:
   Edit `.env` with your database credentials and configuration (see Configuration section).

5. **Build the application**:
   ```bash
   npm run build
   ```

## ⚙️ Configuration

The service uses environment variables for configuration. Key variables:

### Required Configuration

```env
# Server
NODE_ENV=development
PORT=8006
HOST=0.0.0.0

# Databases
CLICKHOUSE_URL=http://localhost:8123
CLICKHOUSE_DATABASE=analytics
CLICKHOUSE_USERNAME=default
CLICKHOUSE_PASSWORD=

POSTGRES_URL=postgresql://postgres:password@localhost:5432/analytics

REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Optional Configuration

See `env.example` for all available configuration options, including:
- Analytics retention and batch settings
- Rate limiting configuration
- Real-time features
- Performance monitoring
- Alerting configuration
- External service URLs

**⚠️ Important**: Always change `JWT_SECRET` in production environments!

## 🗄️ Database Setup

### ClickHouse Setup

ClickHouse is used for storing and querying analytics events.

**Using Docker**:
```bash
docker run -d \
  --name clickhouse \
  -p 8123:8123 \
  -p 9000:9000 \
  -e CLICKHOUSE_DB=analytics \
  clickhouse/clickhouse-server:latest
```

**Manual Installation**:
```bash
# Ubuntu/Debian
sudo apt-get install clickhouse-server clickhouse-client

# macOS
brew install clickhouse

# Start ClickHouse
sudo service clickhouse-server start
```

The service will automatically create required tables on startup.

### PostgreSQL Setup

PostgreSQL is used for storing dashboards, reports, A/B tests, and user insights.

**Using Docker**:
```bash
docker run -d \
  --name postgres-analytics \
  -e POSTGRES_DB=analytics \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

**Manual Installation**:
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Create database
createdb analytics

# Or using psql
psql -U postgres
CREATE DATABASE analytics;
```

The service will automatically create required tables and indexes on startup.

### Redis Setup

Redis is used for caching and real-time event streams.

**Using Docker**:
```bash
docker run -d \
  --name redis-analytics \
  -p 6379:6379 \
  redis:7-alpine
```

**Manual Installation**:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

## 🏃 Running the Service

### Development Mode

Start the service in development mode with hot-reload:

```bash
npm run dev
```

This uses `ts-node-dev` to automatically restart on file changes.

### Production Mode

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the service**:
   ```bash
   npm start
   ```

### Using PM2 (Production Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start dist/index.js --name analytics-service

# Monitor
pm2 monit

# View logs
pm2 logs analytics-service

# Stop the service
pm2 stop analytics-service
```

### Health Check

Verify the service is running:

```bash
curl http://localhost:8006/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "checks": {
    "service": "healthy",
    "clickhouse": "healthy",
    "redis": "healthy",
    "latencyMs": 45
  },
  "version": "1.0.0",
  "timestamp": "2024-12-19T10:30:00.000Z"
}
```

## 📚 API Documentation

Once the service is running, visit:

```
http://localhost:8006/api/docs
```

### Main Endpoints

#### Events
- `POST /api/events` - Track a single event
- `POST /api/events/batch` - Track multiple events
- `GET /api/events/stats` - Get event statistics
- `GET /api/events/search` - Search events
- `GET /api/events/:id` - Get event by ID
- `GET /api/events/export` - Export events data

#### Analytics
- `GET /api/analytics/dashboard/:type` - Get dashboard data
- `GET /api/analytics/user/:userId/insights` - Get user insights
- `GET /api/analytics/performance/summary` - Get performance metrics
- `POST /api/analytics/query` - Execute custom analytics query
- `GET /api/analytics/metrics` - Get system metrics
- `GET /api/analytics/cohorts` - Get cohort analysis
- `GET /api/analytics/funnels` - Get funnel analysis

#### Dashboards
- `GET /api/dashboards` - List dashboards
- `POST /api/dashboards` - Create dashboard
- `GET /api/dashboards/:id` - Get dashboard
- `PUT /api/dashboards/:id` - Update dashboard
- `DELETE /api/dashboards/:id` - Delete dashboard

#### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/:id` - Get report
- `POST /api/reports/:id/generate` - Generate report
- `GET /api/reports/:id/export` - Export report

#### Learning Analytics
- `POST /api/learning/session` - Track learning session
- `GET /api/learning/progress/:userId` - Get learning progress
- `GET /api/learning/insights/:userId` - Get learning insights

### Authentication

Most endpoints require authentication using JWT Bearer tokens:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8006/api/events/stats
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t analytics-service:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f analytics-service

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Environment-Specific Docker Compose

For different environments, you can use separate compose files:

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up
```

## 🔧 Troubleshooting

### Service Won't Start

1. **Check database connections**:
   ```bash
   # ClickHouse
   curl http://localhost:8123/ping
   
   # PostgreSQL
   psql -U postgres -d analytics -c "SELECT 1;"
   
   # Redis
   redis-cli ping
   ```

2. **Check environment variables**:
   ```bash
   # Verify .env file exists and is properly formatted
   cat .env
   ```

3. **Check port availability**:
   ```bash
   # Check if port 8006 is in use
   lsof -i :8006
   ```

### Database Connection Issues

1. **ClickHouse connection failed**:
   - Verify ClickHouse is running: `curl http://localhost:8123/ping`
   - Check `CLICKHOUSE_URL` in `.env`
   - Ensure ClickHouse is accessible from the service

2. **PostgreSQL connection failed**:
   - Verify PostgreSQL is running: `pg_isready`
   - Check credentials in `POSTGRES_URL`
   - Ensure database exists: `psql -l | grep analytics`

3. **Redis connection failed**:
   - Verify Redis is running: `redis-cli ping`
   - Check `REDIS_URL` in `.env`
   - Check Redis authentication if password is set

### Performance Issues

1. **Slow queries**:
   - Check ClickHouse query performance
   - Review indexes in PostgreSQL
   - Monitor Redis memory usage

2. **High memory usage**:
   - Adjust `ANALYTICS_BATCH_SIZE` in `.env`
   - Review `ANALYTICS_FLUSH_INTERVAL` settings
   - Check Redis memory limits

### Common Errors

**Error: "ClickHouse connection refused"**
- Solution: Start ClickHouse or check `CLICKHOUSE_URL`

**Error: "JWT_SECRET is not set"**
- Solution: Set `JWT_SECRET` in `.env` file

**Error: "Port 8006 already in use"**
- Solution: Change `PORT` in `.env` or stop the process using port 8006

## 💻 Development

### Project Structure

```
analytics-service/
├── src/
│   ├── __tests__/          # Test files
│   ├── middleware/          # Express middleware
│   ├── models/              # Database models (ClickHouse, PostgreSQL)
│   ├── routes/              # API route handlers
│   ├── services/            # Business logic services
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── logs/                    # Application logs
├── dist/                    # Compiled JavaScript (generated)
├── docker-compose.yml       # Docker Compose configuration
├── Dockerfile              # Docker image definition
├── env.example             # Environment variables template
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

### Code Style

The project uses ESLint for code linting:

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Implement changes following existing code patterns
3. Add tests for new functionality
4. Run linting and tests: `npm run lint && npm test`
5. Update documentation if needed
6. Submit pull request

### Logging

Logs are written to:
- Console (development mode)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

Log levels can be configured via `LOG_LEVEL` environment variable:
- `error`
- `warn`
- `info` (default)
- `debug`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Review Guidelines

- Ensure all tests pass
- Follow TypeScript best practices
- Add JSDoc comments for public methods
- Update documentation as needed
- Keep commits atomic and well-described

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review `CODE_ANALYSIS.md` for known issues and fixes

## 🔗 Related Services

- [User Service](../user-service/README.md)
- [Content Service](../content-service/README.md)
- [Progress Service](../progress-service/README.md)
- [Community Service](../community-service/README.md)
- [Notification Service](../notification-service/README.md)

---

**Last Updated**: December 2024
**Version**: 1.0.0

