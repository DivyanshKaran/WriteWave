# Community Service

The Community Service is a microservice for WriteWave that handles social learning features including forums, study groups, user interactions, and community management. It provides APIs for user engagement, content moderation, leaderboards, and real-time communication via WebSockets.

## Features

- **Forum System**: Create posts, comments, and discussions in categorized forums
- **Study Groups**: Collaborate with other learners in study groups
- **Social Features**: Friend requests, friendships, following users, and mentorship
- **Leaderboards**: Track user achievements and rankings
- **Content Moderation**: Automated content filtering and manual moderation tools
- **Real-time Updates**: WebSocket support for live notifications and updates
- **User Sync**: Automatic synchronization with user-service via Kafka events

## Prerequisites

Before setting up the Community Service, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** (v15 or higher)
- **Redis** (v7 or higher) - Optional but recommended for caching
- **Docker** and **Docker Compose** (for containerized setup)

## Setup

### 1. Clone and Navigate to Service Directory

```bash
cd backend/community-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` file with your configuration. Key variables to configure:

```env
# Server Configuration
NODE_ENV=development
PORT=8004
HOST=0.0.0.0

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/community_db

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# External Services
USER_SERVICE_URL=http://localhost:8001
CONTENT_SERVICE_URL=http://localhost:8002
PROGRESS_SERVICE_URL=http://localhost:8003

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

### 4. Database Setup

#### Option A: Using Docker Compose (Recommended for Development)

The service includes a `docker-compose.yml` file for easy local development:

```bash
# Start PostgreSQL and Redis
docker compose up -d postgres redis

# Wait for services to be ready
sleep 5
```

#### Option B: Manual PostgreSQL Setup

1. Create a PostgreSQL database:
```bash
createdb community_db
```

2. Or using PostgreSQL client:
```sql
CREATE DATABASE community_db;
```

### 5. Database Migrations

Generate Prisma Client and run migrations:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npm run prisma:seed
```

### 6. Build the Service

Build the TypeScript code:

```bash
npm run build
```

## Starting the Server

### Development Mode

For development with hot-reload:

```bash
npm run dev
```

This uses `ts-node-dev` to automatically restart the server on file changes.

### Production Mode

1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

### Using Docker Compose

Use the provided setup script for automated setup:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually using Docker Compose:

```bash
# Start all services (PostgreSQL, Redis, and Community Service)
docker compose up -d

# View logs
docker compose logs -f community-service

# Stop all services
docker compose down
```

### Using Setup Script

The `setup.sh` script automates the setup process:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- Check for required dependencies
- Set up environment files
- Start Kafka (if available)
- Start PostgreSQL and Redis
- Start the Community Service
- Perform health checks

## Project Structure

```
community-service/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── middleware/       # Express middleware (auth, validation)
│   ├── models/           # Prisma models
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (logger, errors, redis)
│   ├── types/            # TypeScript types and interfaces
│   └── index.ts          # Application entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── dist/                 # Compiled JavaScript (generated)
├── logs/                 # Application logs
├── uploads/              # File uploads directory
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile            # Docker image definition
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── env.example           # Environment variables template
```

## Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with hot-reload
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations (development)
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database with initial data

## API Endpoints

The service exposes RESTful APIs under `/api/community`:

### Forum
- `GET /api/community/forum/categories` - List forum categories
- `GET /api/community/forum/posts` - List posts
- `POST /api/community/forum/posts` - Create a post
- `GET /api/community/forum/posts/:id` - Get post details
- `PUT /api/community/forum/posts/:id` - Update a post
- `DELETE /api/community/forum/posts/:id` - Delete a post
- `POST /api/community/forum/posts/:id/comments` - Add a comment
- `POST /api/community/forum/posts/:id/vote` - Vote on a post

### Study Groups
- `GET /api/community/study-groups` - List study groups
- `POST /api/community/study-groups` - Create a study group
- `GET /api/community/study-groups/:id` - Get study group details
- `POST /api/community/study-groups/:id/join` - Join a study group
- `POST /api/community/study-groups/:id/leave` - Leave a study group

### Social Features
- `GET /api/community/social/friends` - List friends
- `POST /api/community/social/friend-requests` - Send friend request
- `POST /api/community/social/friend-requests/:id/accept` - Accept friend request
- `POST /api/community/social/follow/:userId` - Follow a user
- `POST /api/community/social/unfollow/:userId` - Unfollow a user

### Leaderboards
- `GET /api/community/leaderboards` - Get leaderboard entries
- `GET /api/community/leaderboards/:type` - Get leaderboard by type

### Moderation
- `GET /api/community/moderation/reports` - List reports (moderator only)
- `POST /api/community/moderation/reports` - Create a report
- `POST /api/community/moderation/users/:id/suspend` - Suspend a user (moderator only)
- `POST /api/community/moderation/users/:id/unsuspend` - Unsuspend a user (moderator only)

## Environment Variables

See `env.example` for a complete list of environment variables. Key variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8004` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Optional |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `USER_SERVICE_URL` | User service base URL | `http://localhost:8001` |
| `CORS_ORIGIN` | Allowed CORS origins | `http://localhost:3000` |
| `ENABLE_KAFKA` | Enable Kafka event consumption | `false` |

## Database Schema

The service uses Prisma ORM with PostgreSQL. Key models include:

- **User**: Community user profiles (synced with user-service)
- **ForumCategory**: Forum categories
- **Post**: Forum posts/threads
- **Comment**: Post comments/replies
- **StudyGroup**: Study groups
- **Friendship**: User friendships
- **Follow**: User following relationships
- **Report**: Content reports
- **LeaderboardEntry**: Leaderboard rankings
- **Activity**: User activity feed

View the full schema in `prisma/schema.prisma`.

## WebSocket Support

The service includes WebSocket support for real-time updates. Connect to:

```
ws://localhost:8004
```

Events include:
- Post updates
- New comments
- Friend requests
- Study group activities
- Leaderboard updates

## Health Check

Check service health:

```bash
curl http://localhost:8004/health
```

Or visit in browser: `http://localhost:8004/health`

## Troubleshooting

### Build Errors

If you encounter build errors:

1. Ensure all dependencies are installed:
```bash
npm install
```

2. Regenerate Prisma Client:
```bash
npx prisma generate
```

3. Check TypeScript configuration:
```bash
npm run build
```

### Database Connection Issues

1. Verify PostgreSQL is running:
```bash
pg_isready -h localhost -p 5432
```

2. Check database URL in `.env` file
3. Ensure database exists:
```bash
psql -h localhost -U postgres -l
```

### Redis Connection Issues

Redis is optional. If Redis is not available:
- Set `OPTIONAL_REDIS=false` in `.env`
- The service will continue without caching

### Port Already in Use

If port 8004 is already in use:
1. Change `PORT` in `.env` file
2. Or stop the conflicting service:
```bash
lsof -ti:8004 | xargs kill -9
```

## Development

### Running Tests

```bash
npm test
```

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

### View Database

Use Prisma Studio to view and edit database:
```bash
npm Dash prisma:studio
```

## Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use strong `JWT_SECRET`
3. Configure proper CORS origins
4. Set up proper database connection pooling
5. Enable Redis for caching
6. Configure proper logging
7. Set up monitoring and health checks

## License

MIT

## Support

For issues and questions, please contact the WriteWave development team.
