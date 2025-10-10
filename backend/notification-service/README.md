# WriteWave Notification Service

A comprehensive notification service for user engagement with multi-channel delivery, scheduling, and analytics.

## Features

- **Multi-Channel Notifications**: Email, Push, SMS, In-App
- **Template Management**: Handlebars templates with personalization
- **Scheduling System**: Timezone-aware scheduling with recurrence
- **Queue Processing**: Bull Queue for reliable delivery
- **Analytics & Tracking**: Delivery metrics and engagement analytics
- **User Preferences**: Granular notification preferences
- **Real-time Processing**: WebSocket support for live updates

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Queue**: Bull Queue with Redis
- **Email**: SendGrid/AWS SES
- **Push**: Web Push API
- **SMS**: Twilio
- **Caching**: Redis
- **Logging**: Winston

## Quick Start

### Prerequisites

- Node.js 18+
- Redis
- Docker (optional)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp env.example .env
   ```

4. Configure environment variables in `.env`

5. Start the service:
   ```bash
   # Development
   npm run dev

   # Production
   npm run build
   npm start
   ```

### Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f notification-service

# Stop services
docker-compose down
```

## API Endpoints

### Notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/user/:userId` - Get user notifications
- `PUT /api/notifications/:id` - Update notification
- `DELETE /api/notifications/:id` - Delete notification

### Preferences
- `GET /api/preferences/:userId` - Get user preferences
- `PUT /api/preferences/:userId` - Update preferences
- `POST /api/preferences/:userId/reset` - Reset to defaults

### Subscriptions
- `POST /api/subscriptions/:userId` - Create push subscription
- `GET /api/subscriptions/:userId` - Get user subscriptions
- `DELETE /api/subscriptions/:id` - Delete subscription

### Analytics
- `GET /api/analytics` - Get notification analytics
- `GET /api/analytics/user/:userId` - Get user analytics

## Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=8005
HOST=0.0.0.0

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Email (SendGrid)
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@writewave.com

# Push Notifications
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
```

## Queue Dashboard

Access the Bull Queue dashboard at `http://localhost:3001/admin/queues`

Default credentials:
- Username: `admin`
- Password: `admin123`

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linter
npm run queue:worker # Start queue worker
```

### Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── middleware/      # Express middleware
├── routes/          # API routes
├── workers/         # Queue workers
├── utils/           # Utility functions
├── types/           # TypeScript types
└── models/          # Data models
```

## Monitoring

### Health Check

```bash
curl http://localhost:8005/health
```

### Metrics

- Queue statistics via dashboard
- Delivery rates and engagement metrics
- Error tracking and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
