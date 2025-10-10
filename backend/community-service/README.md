# Community Service - WriteWave

A comprehensive community service for social learning features in the WriteWave application, built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

## Features

### 🗣️ Forum System
- Discussion categories (Character Help, Vocabulary, Culture, General)
- Thread creation and management
- Comment system with nested replies
- Post voting and reputation system
- Thread pinning and moderation
- Search functionality across posts

### 👥 Study Groups
- Group creation and management
- Member invitation and approval system
- Group challenges and competitions
- Shared progress tracking
- Group chat/messaging (basic)
- Group achievements and leaderboards

### 🤝 Social Features
- Friend system (send/accept/decline requests)
- User following/followers
- Activity feeds (friend achievements, milestones)
- Progress sharing and celebrations
- Mentorship program matching

### 🏆 Leaderboards
- Global rankings (XP, streaks, characters mastered)
- Category-specific leaderboards
- Time-based rankings (daily, weekly, monthly)
- Group leaderboards
- Achievement leaderboards

### 🛡️ Content Moderation
- Automated spam detection
- Report system for inappropriate content
- Moderator tools and dashboard
- Content flagging and review workflows
- User suspension and ban management

### ⚡ Real-time Features
- WebSocket support for notifications
- Real-time chat in study groups
- Live activity feeds
- Online status indicators
- Typing indicators

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Containerization**: Docker

## API Endpoints

### Forum
- `GET /api/community/forums` - Get forum categories
- `GET /api/community/posts` - Get posts with pagination
- `POST /api/community/posts` - Create new post
- `GET /api/community/posts/:postId` - Get post details
- `PUT /api/community/posts/:postId` - Update post
- `DELETE /api/community/posts/:postId` - Delete post
- `POST /api/community/posts/:postId/vote` - Vote on post
- `GET /api/community/posts/:postId/comments` - Get post comments
- `POST /api/community/posts/:postId/comments` - Add comment
- `POST /api/community/comments/:commentId/vote` - Vote on comment

### Study Groups
- `GET /api/community/study-groups` - Get study groups
- `POST /api/community/study-groups` - Create study group
- `GET /api/community/study-groups/:groupId` - Get group details
- `POST /api/community/study-groups/:groupId/join` - Join group
- `POST /api/community/study-groups/:groupId/leave` - Leave group
- `GET /api/community/study-groups/:groupId/challenges` - Get group challenges
- `POST /api/community/study-groups/:groupId/challenges` - Create challenge

### Social Features
- `GET /api/community/friends/requests` - Get friend requests
- `POST /api/community/friends/requests` - Send friend request
- `PUT /api/community/friends/requests/:requestId` - Respond to friend request
- `GET /api/community/friends` - Get friends list
- `POST /api/community/users/:userId/follow` - Follow user
- `GET /api/community/users/:userId/activity` - Get user activity
- `GET /api/community/users/:userId/achievements` - Get user achievements

### Leaderboards
- `GET /api/community/leaderboard` - Get leaderboard
- `GET /api/community/leaderboard/users/:userId/rank/:type` - Get user rank
- `GET /api/community/leaderboard/categories/:categoryId/:type` - Get category leaderboard
- `GET /api/community/leaderboard/groups/:groupId/:type` - Get group leaderboard

### Moderation
- `GET /api/community/reports` - Get reports (moderators only)
- `POST /api/community/reports` - Create report
- `PUT /api/community/reports/:reportId` - Update report status
- `POST /api/community/users/:userId/suspend` - Suspend user
- `GET /api/community/moderation/dashboard` - Get moderation dashboard

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd community-service
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

4. **Set up the database**
   ```bash
   # Start PostgreSQL and Redis
   # Update DATABASE_URL and REDIS_URL in .env
   
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Development

1. **Start all services**
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec community-service npm run prisma:migrate
   ```

3. **Seed the database**
   ```bash
   docker-compose exec community-service npm run prisma:seed
   ```

## Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=8004
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/community_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Content Moderation
MODERATION_ENABLED=true
AUTO_MODERATION_THRESHOLD=0.8

# WebSocket Configuration
WS_CORS_ORIGIN=http://localhost:3000
```

## Database Schema

The service uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: User profiles and authentication
- **ForumCategories**: Discussion categories
- **Posts**: Forum posts/threads
- **Comments**: Post comments with nested replies
- **StudyGroups**: Study group management
- **StudyGroupMembers**: Group membership
- **FriendRequests**: Friend request system
- **Friendships**: User friendships
- **Follows**: User following system
- **Activities**: User activity tracking
- **UserAchievements**: Achievement system
- **LeaderboardEntries**: Leaderboard data
- **Reports**: Content moderation reports

## WebSocket Events

### Client to Server
- `join_study_group` - Join a study group room
- `leave_study_group` - Leave a study group room
- `group_message` - Send message to study group
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `update_status` - Update online status

### Server to Client
- `notification` - General notification
- `room_notification` - Room-specific notification
- `new_post` - New post created
- `new_comment` - New comment added
- `group_message` - New group message
- `user_typing` - User typing indicator
- `user_status_changed` - User status change
- `leaderboard_update` - Leaderboard updated

## Caching Strategy

The service uses Redis for:
- **User sessions**: JWT token validation and session data
- **Leaderboards**: Cached leaderboard data with TTL
- **Search results**: Cached search queries
- **User data**: Frequently accessed user information
- **Rate limiting**: Request rate limiting
- **Real-time data**: Online users and activity feeds

## Content Moderation

The service includes automated content moderation:
- **Spam detection**: Keyword-based spam filtering
- **Profanity filtering**: Bad words detection
- **Sentiment analysis**: Content sentiment scoring
- **Automated actions**: Auto-suspend users with multiple violations
- **Report system**: User reporting with moderator review

## Performance Optimizations

- **Database indexing**: Optimized queries with proper indexes
- **Redis caching**: Frequently accessed data caching
- **Pagination**: Efficient data pagination
- **Connection pooling**: Database connection optimization
- **Compression**: Response compression
- **Rate limiting**: API rate limiting

## Monitoring and Logging

- **Winston logging**: Structured logging with different levels
- **Health checks**: Service health monitoring
- **Error tracking**: Comprehensive error handling
- **Performance metrics**: Request timing and performance

## Security Features

- **JWT authentication**: Secure token-based authentication
- **Input validation**: Comprehensive input validation with Joi
- **SQL injection prevention**: Prisma ORM protection
- **XSS protection**: Content sanitization
- **Rate limiting**: DDoS protection
- **CORS configuration**: Cross-origin request security
- **Helmet.js**: Security headers

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.
