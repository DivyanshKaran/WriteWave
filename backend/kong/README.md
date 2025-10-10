# Kong API Gateway for WriteWave

This directory contains the Kong API Gateway configuration and setup for the WriteWave project, providing a comprehensive API gateway solution with authentication, rate limiting, CORS handling, logging, health checks, load balancing, and custom error handling.

## 🏗️ Architecture

The Kong API Gateway serves as the entry point for all API requests, providing:

- **Service Definitions**: 6 microservices (User, Content, Progress, Community, Notification, Analytics)
- **JWT Authentication**: Token validation and refresh
- **Rate Limiting**: 100 req/min per authenticated user
- **CORS Handling**: Frontend integration support
- **Request/Response Logging**: Comprehensive monitoring
- **Health Check Endpoints**: Service health monitoring
- **Load Balancing**: Service discovery and load balancing
- **Custom Error Handling**: Structured error responses

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Development Setup

1. **Clone and navigate to the directory**:
   ```bash
   cd backend/kong
   ```

2. **Start the development environment**:
   ```bash
   ./scripts/deploy.sh -e development
   ```

3. **Access the services**:
   - Kong API Gateway: http://localhost:8000
   - Kong Admin API: http://localhost:8001
   - Health Check: http://localhost:8000/health

### Production Setup

1. **Copy environment file**:
   ```bash
   cp env.example .env
   ```

2. **Update environment variables**:
   Edit `.env` file with your production values

3. **Deploy to production**:
   ```bash
   ./scripts/deploy.sh -e production
   ```

## 📋 Service Definitions

### 1. User Service (Port 8001)
- **Endpoints**: `/api/v1/users`, `/api/v1/auth`
- **Responsibilities**: Authentication, user management, profile management
- **Database**: PostgreSQL

### 2. Content Service (Port 8002)
- **Endpoints**: `/api/v1/content`, `/api/v1/characters`, `/api/v1/kanji`, `/api/v1/hiragana`, `/api/v1/katakana`
- **Responsibilities**: Character data, learning materials, content management
- **Database**: PostgreSQL

### 3. Progress Service (Port 8003)
- **Endpoints**: `/api/v1/progress`, `/api/v1/achievements`, `/api/v1/stats`
- **Responsibilities**: Learning progress tracking, achievements, statistics
- **Database**: PostgreSQL

### 4. Community Service (Port 8004)
- **Endpoints**: `/api/v1/community`, `/api/v1/discussions`, `/api/v1/groups`, `/api/v1/leaderboard`
- **Responsibilities**: Discussions, study groups, leaderboards
- **Database**: PostgreSQL

### 5. Notification Service (Port 8005)
- **Endpoints**: `/api/v1/notifications`, `/api/v1/websocket`
- **Responsibilities**: Real-time notifications, WebSocket connections
- **Database**: PostgreSQL, Redis

### 6. Analytics Service (Port 8006)
- **Endpoints**: `/api/v1/analytics`, `/api/v1/metrics`, `/api/v1/reports`
- **Responsibilities**: Usage analytics, performance metrics, reporting
- **Database**: PostgreSQL

## 🔧 Configuration

### Environment-Specific Configurations

#### Development (`config/development.yml`)
- Debug logging enabled
- Mock services for testing
- Relaxed security settings
- Local development origins

#### Staging (`config/staging.yml`)
- Production-like settings
- Staging environment origins
- Enhanced security
- Performance monitoring

#### Production (`config/production.yml`)
- Optimized for performance
- Strict security settings
- Production origins only
- Comprehensive monitoring

### Docker Compose Files

- `docker-compose.dev.yml`: Development environment with mock services
- `docker-compose.staging.yml`: Staging environment with real services
- `docker-compose.prod.yml`: Production environment with optimized settings

## 🔌 Plugins

### 1. JWT Authentication (`jwt-auth`)
- **Purpose**: Token validation and authentication
- **Configuration**: Configurable secret, expiration times
- **Features**: Token validation, user identification

### 2. Rate Limiting (`rate-limiting`)
- **Purpose**: Request rate limiting
- **Configuration**: 100 req/min per user, 1000 req/min per IP
- **Features**: Redis-based counters, configurable windows

### 3. CORS (`cors`)
- **Purpose**: Cross-origin resource sharing
- **Configuration**: Configurable origins, methods, headers
- **Features**: Preflight handling, credential support

### 4. Request Logging (`request-logging`)
- **Purpose**: Request/response monitoring
- **Configuration**: Redis and file logging
- **Features**: Performance metrics, error tracking

### 5. Circuit Breaker (`circuit-breaker`)
- **Purpose**: Fault tolerance
- **Configuration**: Configurable thresholds, timeouts
- **Features**: Automatic circuit opening/closing

### 6. Error Handler (`error-handler`)
- **Purpose**: Custom error handling
- **Configuration**: Structured error responses
- **Features**: Error logging, sensitive data protection

## 🏥 Health Checks

### Service Health Endpoints

- **Overall Health**: `GET /health`
- **User Service**: `GET /health/users`
- **Content Service**: `GET /health/content`
- **Progress Service**: `GET /health/progress`
- **Community Service**: `GET /health/community`
- **Notification Service**: `GET /health/notifications`
- **Analytics Service**: `GET /health/analytics`

### Health Check Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "service-name"
}
```

## ⚖️ Load Balancing

### Strategies

1. **Round Robin**: Default strategy for even distribution
2. **Least Connections**: Routes to service with fewest active connections
3. **Weighted Round Robin**: Custom weights for service instances

### Service Discovery

- Automatic service registration
- Health check monitoring
- Dynamic load balancing
- Circuit breaker integration

## 🔒 Security

### Authentication

- JWT token validation
- Configurable expiration times
- Token refresh mechanism
- User identification

### Rate Limiting

- Per-user rate limiting (100 req/min)
- Per-IP rate limiting (1000 req/min)
- Redis-based distributed counters
- Configurable time windows

### CORS

- Configurable allowed origins
- Preflight request handling
- Credential support
- Security headers

### IP Restrictions

- Whitelist-based access control
- Configurable IP ranges
- Security policy enforcement

## 📊 Monitoring

### Logging

- Request/response logging
- Performance metrics
- Error tracking
- Redis and file logging

### Metrics

- Request count per service
- Response times
- Error rates
- Circuit breaker status

### Health Monitoring

- Service health checks
- Automatic failover
- Performance monitoring
- Alerting capabilities

## 🚀 Deployment

### Development

```bash
# Start development environment
./scripts/deploy.sh -e development

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Staging

```bash
# Deploy to staging
./scripts/deploy.sh -e staging

# Check status
./scripts/deploy.sh status

# Restart services
./scripts/deploy.sh restart
```

### Production

```bash
# Deploy to production
./scripts/deploy.sh -e production

# Run health checks
./scripts/deploy.sh health

# View logs
./scripts/deploy.sh logs
```

## 🧪 Testing

### API Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test user service
curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/users

# Test rate limiting
for i in {1..10}; do curl http://localhost:8000/health; done
```

### Load Testing

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 1000 -c 10 http://localhost:8000/health
```

## 🔧 Management

### Kong Admin API

- **URL**: http://localhost:8001
- **Documentation**: https://docs.konghq.com/gateway/latest/admin-api/
- **Authentication**: Not required for local development

### Common Commands

```bash
# Check Kong status
curl http://localhost:8001/status

# List services
curl http://localhost:8001/services

# List routes
curl http://localhost:8001/routes

# List plugins
curl http://localhost:8001/plugins
```

## 📚 Documentation

### Kong Documentation

- [Kong Gateway](https://docs.konghq.com/gateway/)
- [Kong Admin API](https://docs.konghq.com/gateway/latest/admin-api/)
- [Kong Plugins](https://docs.konghq.com/hub/)

### WriteWave Documentation

- [API Documentation](./API.md)
- [Service Architecture](../README.md)
- [Development Guide](../DEVELOPMENT.md)

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting**:
   - Check Docker is running
   - Verify port availability
   - Check logs: `docker-compose logs`

2. **Kong not responding**:
   - Check PostgreSQL connection
   - Verify Kong configuration
   - Check Admin API: `curl http://localhost:8001/status`

3. **Rate limiting issues**:
   - Check Redis connection
   - Verify rate limit configuration
   - Check rate limit headers

4. **CORS issues**:
   - Verify allowed origins
   - Check preflight requests
   - Verify headers configuration

### Debug Commands

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs <service-name>

# Check Kong configuration
curl http://localhost:8001/status

# Test Redis connection
docker-compose exec redis redis-cli ping

# Check PostgreSQL connection
docker-compose exec kong-database pg_isready -U kong
```

## 🤝 Contributing

1. Follow the existing configuration structure
2. Add comprehensive error handling
3. Include Redis connection management
4. Add logging for debugging
5. Test with various configurations
6. Update documentation

## 📄 License

This project is part of the WriteWave application and follows the same license terms.

## 🆘 Support

For support and questions:

- Create an issue in the project repository
- Check the troubleshooting section
- Review Kong documentation
- Contact the development team

---

**Note**: This Kong API Gateway configuration is designed specifically for the WriteWave project. Modify the configuration files according to your specific requirements and environment setup.