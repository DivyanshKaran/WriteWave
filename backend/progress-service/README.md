# Progress Service

A comprehensive microservice for tracking user learning progress, XP points, achievements, streaks, character mastery, and analytics in the WriteWave Japanese learning platform.

## 🚀 Features

### Core Functionality
- **XP and Leveling System**: Dynamic XP calculations with level progression and rewards
- **Character Mastery Tracking**: Individual character progress with accuracy scores and spaced repetition
- **Achievement System**: Badge system with unlock conditions and milestone celebrations
- **Streak Management**: Daily login and practice streaks with freeze and recovery systems
- **Analytics and Insights**: Learning velocity metrics, progress predictions, and weakness identification
- **Leaderboard System**: Daily, weekly, monthly, and all-time rankings
- **Real-time Updates**: Live progress tracking and notifications
- **Caching**: Redis-based caching for improved performance

### XP and Leveling System
- Dynamic XP calculations for different activities (character practice, perfect strokes, daily streaks)
- Level progression algorithm (Bronze: 0-500, Silver: 500-1500, Gold: 1500-3000, Platinum: 3000+)
- XP multipliers for streaks and achievements
- Level-up rewards and notifications
- Leaderboard calculations with multiple time periods

### Character Mastery Tracking
- Individual character progress (learning, practicing, mastered, expert)
- Accuracy scores and improvement over time
- Time spent per character tracking
- Stroke order accuracy tracking
- Spaced repetition scheduling for review
- Weak areas identification and recommendations

### Achievement System
- Badge definitions with unlock conditions
- Achievement progress tracking
- Milestone celebrations
- Rare achievement categories (Common, Uncommon, Rare, Epic, Legendary)
- Social sharing of achievements
- XP rewards for achievement unlocks

### Streak Management
- Daily login streaks
- Practice streaks
- Perfect score streaks
- Streak freeze and recovery systems
- Streak milestone rewards
- Automatic streak maintenance

### Analytics and Insights
- Learning velocity metrics
- Character recognition improvement trends
- Study time analytics
- Weakness pattern identification
- Progress predictions and recommendations
- Performance benchmarking

## 🛠 Technology Stack

- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis 7
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, JWT
- **Rate Limiting**: express-rate-limit
- **Containerization**: Docker

## 📁 Project Structure

```
progress-service/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── middleware/       # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── prisma/              # Database schema and migrations
├── logs/                # Application logs
├── docker-compose.yml   # Docker Compose configuration
├── Dockerfile          # Docker image definition
└── README.md           # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd progress-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

6. **Seed the database (optional)**
   ```bash
   npx prisma db seed
   ```

### Development Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:8003/api/v1
```

### Health Check
```http
GET /health
```

### Progress Endpoints

#### Get User Progress
```http
GET /progress/:userId
```

#### Update Character Practice
```http
POST /progress/character-practice
Content-Type: application/json

{
  "userId": "user123",
  "characterId": "char456",
  "characterType": "HIRAGANA",
  "accuracy": 85.5,
  "timeSpent": 120,
  "isPerfect": false,
  "strokesCorrect": 8,
  "strokesTotal": 10
}
```

#### Update XP
```http
PUT /progress/xp
Content-Type: application/json

{
  "userId": "user123",
  "amount": 50,
  "source": "CHARACTER_PRACTICE",
  "description": "Character practice completed",
  "metadata": {
    "characterId": "char456",
    "accuracy": 85.5
  }
}
```

### Streak Endpoints

#### Get User Streaks
```http
GET /progress/streaks/:userId
```

#### Freeze Streak
```http
POST /progress/freeze-streak
Content-Type: application/json

{
  "userId": "user123",
  "type": "DAILY_PRACTICE"
}
```

### Achievement Endpoints

#### Get User Achievements
```http
GET /progress/achievements/:userId
```

#### Check and Unlock Achievements
```http
POST /progress/achievements/check
Content-Type: application/json

{
  "userId": "user123"
}
```

### Analytics Endpoints

#### Get User Analytics
```http
GET /progress/analytics/:userId?period=30d
```

#### Get Learning Insights
```http
GET /progress/insights/:userId?period=30d
```

#### Get Progress Metrics
```http
GET /progress/metrics/:userId
```

### Leaderboard Endpoints

#### Get Leaderboard
```http
GET /progress/leaderboard/:period?limit=100&offset=0
```

#### Get User Rank
```http
GET /progress/rank/:userId/:period
```

### Character Mastery Endpoints

#### Get Characters for Review
```http
GET /progress/review/:userId?limit=20
```

#### Get Weak Areas
```http
GET /progress/weak-areas/:userId?limit=10
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `8003` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `XP_BASE_MULTIPLIER` | Base XP multiplier | `1.0` |
| `XP_STREAK_MULTIPLIER` | Streak XP multiplier | `1.5` |
| `XP_ACHIEVEMENT_MULTIPLIER` | Achievement XP multiplier | `2.0` |
| `LEVEL_UP_XP_BASE` | Base XP for level up | `100` |
| `LEVEL_UP_XP_MULTIPLIER` | Level up XP multiplier | `1.2` |
| `STREAK_FREEZE_LIMIT` | Maximum streak freezes | `3` |
| `ANALYTICS_RETENTION_DAYS` | Analytics data retention | `365` |
| `LEADERBOARD_CACHE_TTL` | Leaderboard cache TTL | `300` |

### Database Schema

The service uses Prisma ORM with the following main models:

- **UserProgress**: User progress tracking with XP and level information
- **XpTransaction**: XP transaction history
- **CharacterMastery**: Character mastery tracking with spaced repetition
- **PracticeSession**: Individual practice session records
- **Achievement**: Achievement definitions and unlock conditions
- **UserAchievement**: User achievement progress and unlocks
- **Streak**: Streak tracking for different types
- **UserAnalytics**: Daily analytics and insights
- **Leaderboard**: Leaderboard entries and rankings

## 🔒 Security

- **Input Validation**: Joi schemas for all endpoints
- **JWT Authentication**: Token-based authentication
- **Rate Limiting**: Configurable rate limits per user/IP
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Role-based Access**: User, admin, and service roles

## 📊 Performance

- **Redis Caching**: Frequently accessed data cached
- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Database connection optimization
- **Pagination**: Efficient data pagination
- **Background Jobs**: Async processing for heavy operations
- **Real-time Updates**: WebSocket support for live updates

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "XP Service"
```

## 📝 Logging

The service uses Winston for structured logging:

- **Request Logging**: All incoming requests logged
- **Error Logging**: Detailed error information
- **Performance Logging**: Response times and metrics
- **File Rotation**: Automatic log file rotation

## 🚀 Deployment

### Docker Deployment

1. **Build the image**
   ```bash
   docker build -t progress-service .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Production Considerations

- Set `NODE_ENV=production`
- Configure proper database credentials
- Set up Redis cluster for high availability
- Configure monitoring and alerting
- Set up backup strategies
- Configure load balancing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- XP and leveling system with dynamic calculations
- Character mastery tracking with spaced repetition
- Achievement system with badge unlocks
- Streak management with freeze and recovery
- Analytics and insights with learning velocity
- Leaderboard system with multiple time periods
- Real-time updates and caching optimization
