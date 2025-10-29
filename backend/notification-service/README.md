# Notification Service

The Notification Service is a microservice in the WriteWave platform responsible for handling all notification types including email, push notifications, SMS, and in-app notifications. It uses Redis for queue management, Kafka for event-driven notifications, and supports multiple notification channels with template management.

## Features

- **Multi-channel Notifications**: Email, Push (WebPush), SMS, In-App
- **Queue-based Processing**: Redis-backed job queues using Bull
- **Event-driven**: Kafka consumer for real-time event processing
- **Template System**: Handlebars-based notification templates
- **Scheduling**: Support for scheduled and recurring notifications
- **Analytics**: Delivery tracking and notification analytics
- **User Preferences**: Configurable notification preferences per user
- **Rate Limiting**: Built-in rate limiting and retry mechanisms

## Prerequisites

- Node.js v18+ 
- npm or yarn
- Docker (for Redis, Kafka, and PostgreSQL)
- Redis 7+
- Kafka 3+ (with Zookeeper)
- PostgreSQL 15+ (optional, currently uses in-memory storage)

## Quick Start

### Using Setup Script (Recommended)

The easiest way to set up and run the notification service is using the provided setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check prerequisites (Node.js, npm, Docker)
2. Create `.env` file from `env.example`
3. Install npm dependencies
4. Start Redis, Kafka, and PostgreSQL containers
5. Start the notification service in development mode

### Manual Setup

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` and configure the following sections as needed (see `env.example` for all available options).

#### 3. Redis Setup

**Using Docker (Recommended):**

```bash
docker run -d \
  --name writewave-redis \
  --restart unless-stopped \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

The service uses Redis for:
- Bull queue storage (notification processing queues)
- Caching notification templates
- Rate limiting state

By default, Redis runs on `localhost:6379`. Update `REDIS_URL` in your `.env` file if using a different host/port.

**Redis Connection Options:**
- `REDIS_URL`: Full connection string (e.g., `redis://localhost:6379`)
- `REDIS_HOST`: Redis hostname (default: `localhost`)
- `REDIS_PORT`: Redis port (default: `6379`)
- `REDIS_PASSWORD`: Redis password (if required)

#### 4. Kafka Setup

The notification service consumes events from Kafka topics for real-time notification triggers.

**Using Docker:**

Start Zookeeper:
```bash
docker run -d \
  --name writewave-zookeeper \
  --restart unless-stopped \
  -p 2181:2181 \
  -e ALLOW_ANONYMOUS_LOGIN=yes \
  bitnami/zookeeper:3
```

Start Kafka:
```bash
docker run -d \
  --name writewave-kafka \
  --restart unless-stopped \
  -p 9092:9092 \
  -e KAFKA_CFG_ZOOKEEPER_CONNECT=writewave-zookeeper:2181 \
  -e ALLOW_PLAINTEXT_LISTENER=yes \
  -e KAFKA_LISTENERS=PLAINTEXT://:9092 \
  -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 \
  bitnami/kafka:3
```

**Verify Kafka is running:**
```bash
docker exec writewave-kafka kafka-topics.sh --bootstrap-server localhost:9092 --list
```

**Kafka Configuration:**

In your `.env` file:
```env
KAFKA_BROKERS=localhost:9092
ENABLE_KAFKA=true
```

**Kafka Topics Consumed:**
- `articles-events`: Article creation, updates, likes, comments
- `community-events`: Community interactions, friend requests
- `user-events`: User account events, profile updates
- `progress-events`: Learning progress, achievements, streaks

**Disabling Kafka:**
If you don't need event-driven notifications, set:
```env
ENABLE_KAFKA=false
```

#### 5. Database Setup (Optional)

**Note:** Currently, the service uses in-memory storage. PostgreSQL setup is prepared for future migration.

**Using Docker:**
```bash
docker run -d \
  --name writewave-postgres \
  --restart unless-stopped \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=writewave \
  -e POSTGRES_DB=writewave_notifications \
  postgres:15
```

#### 6. Build the Service

```bash
npm run build
```

#### 7. Start the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The service will start on `http://localhost:8005` (or the port specified in `.env`).

## API Endpoints

### Health Check
```
GET /health
```

### Notifications
- `POST /api/notifications/send` - Send a notification
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/:id` - Get notification by ID
- `PUT /api/notifications/:id/read` - Mark notification as read

### Preferences
- `GET /api/preferences/:userId` - Get user preferences
- `PUT /api/preferences/:userId` - Update user preferences

### Subscriptions
- `POST /api/subscriptions/:userId` - Create push subscription
- `DELETE /api/subscriptions/:userId/:subscriptionId` - Delete subscription
- `GET /api/subscriptions/vapid-key` - Get VAPID public key

### Analytics
- `GET /api/analytics` - Get notification analytics
- `GET /api/analytics/user/:userId` - Get user-specific analytics

## Configuration

### Email Providers

**SendGrid:**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@writewave.com
```

**AWS SES:**
```env
EMAIL_PROVIDER=ses
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

### SMS Provider (Twilio)

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Push Notifications

Generate VAPID keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Add to `.env`:
```env
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@writewave.com
```

### Queue Dashboard

Optional Bull Board dashboard for monitoring queues:

```env
ENABLE_DASHBOARD=true
DASHBOARD_PORT=3001
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=admin123
```

Access at: `http://localhost:3001/admin/queues`

## Docker Deployment

### Build Docker Image

```bash
docker build -t notification-service .
```

### Run with Docker Compose

```bash
docker-compose up -d
```

This will start:
- Notification service (port 8005)
- Redis (port 6381)
- Queue dashboard (port 3001, if enabled)

## Troubleshooting

### Redis Connection Issues

**Error:** `Redis connection failed`

**Solution:**
1. Verify Redis is running: `redis-cli ping`
2. Check `REDIS_URL` in `.env`
3. Check firewall settings

### Kafka Connection Issues

**Error:** `Kafka consumer failed to start`

**Solution:**
1. Verify Kafka is running: `docker ps | grep kafka`
2. Check Zookeeper is running
3. Verify `KAFKA_BROKERS` in `.env`
4. Set `ENABLE_KAFKA=false` to disable if not needed

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::8005`

**Solution:**
1. Change `PORT` in `.env` to a different port
2. Or kill the process: `lsof -ti:8005 | xargs kill -9`

## Logs

Logs are written to:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

Configure log level in `.env`:
```env
LOG_LEVEL=info
```

## License

MIT
