# WriteWave Analytics Service

A comprehensive analytics service for data-driven insights, real-time monitoring, and business intelligence.

## Features

- **Event Tracking**: Flexible event tracking with custom schemas
- **Real-time Analytics**: Live dashboards and monitoring
- **Learning Analytics**: Character learning performance insights
- **Performance Monitoring**: API and system performance tracking
- **A/B Testing**: Built-in experimentation framework
- **Business Intelligence**: Automated reporting and insights
- **Data Visualization**: Chart generation and dashboard creation

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Time-series DB**: ClickHouse
- **Relational DB**: PostgreSQL (TimescaleDB)
- **Caching**: Redis
- **Visualization**: Chart.js, Canvas
- **ML**: Simple Statistics, ML Matrix

## Quick Start

### Prerequisites

- Node.js 18+
- ClickHouse
- PostgreSQL (TimescaleDB)
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
docker-compose logs -f analytics-service

# Stop services
docker-compose down
```

## API Endpoints

### Event Tracking
- `POST /api/events` - Track analytics event
- `POST /api/events/batch` - Track multiple events
- `GET /api/events/stats` - Get event statistics

### Analytics
- `GET /api/analytics/dashboard/:type` - Get dashboard data
- `GET /api/analytics/user/:userId/insights` - Get user insights
- `GET /api/analytics/performance/summary` - Get performance metrics
- `POST /api/analytics/query` - Execute custom queries

### Learning Analytics
- `POST /api/learning/session` - Track learning session
- `GET /api/learning/progress/:userId` - Get learning progress
- `GET /api/learning/insights/:userId` - Get learning insights

### A/B Testing
- `POST /api/ab-tests` - Create A/B test
- `GET /api/ab-tests/:id` - Get A/B test details
- `POST /api/ab-tests/:id/assign` - Assign user to variant

### Reports
- `GET /api/reports/:reportType` - Get automated reports
- `POST /api/reports/generate` - Generate custom report
- `GET /api/reports/export/:id` - Export report data

## Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=8006
HOST=0.0.0.0

# Databases
CLICKHOUSE_URL=http://localhost:8123
POSTGRES_URL=postgresql://postgres:password@localhost:5432/analytics
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key

# Analytics
ANALYTICS_RETENTION_DAYS=365
ANALYTICS_BATCH_SIZE=1000
ANALYTICS_FLUSH_INTERVAL=5000

# Real-time
REALTIME_ENABLED=true
WEBSOCKET_ENABLED=true

# Performance Monitoring
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.1

# A/B Testing
AB_TESTING_ENABLED=true
AB_TEST_MIN_SAMPLE_SIZE=100
```

## Data Models

### Events
- User interactions
- Learning events
- Performance metrics
- Business events
- System events

### Learning Metrics
- Session duration
- Character accuracy
- XP gains
- Streak updates
- Method effectiveness

### Performance Metrics
- API response times
- Error rates
- System resource usage
- Database performance

## Real-time Features

- Live event streaming
- Real-time dashboards
- Performance monitoring
- Alert system
- Anomaly detection

## A/B Testing

- Variant assignment
- Statistical significance
- Conversion tracking
- Results analysis
- Automated reporting

## Data Visualization

- Chart generation
- Dashboard creation
- Report automation
- Export capabilities
- Custom visualizations

## Monitoring

### Health Check

```bash
curl http://localhost:8006/health
```

### Metrics

- Event processing rates
- Database performance
- Cache hit rates
- Error rates
- System resources

## Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run linter
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

### Project Structure

```
src/
├── controllers/     # Request handlers
├── services/        # Business logic
├── models/          # Database models
├── middleware/      # Express middleware
├── routes/          # API routes
├── utils/           # Utility functions
├── types/           # TypeScript types
└── migrations/      # Database migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
