# WriteWave User Service

A microservice for user authentication, user management, and profile features in the WriteWave platform.

## Features

- 🔐 **Authentication**: JWT-based authentication with refresh tokens
- 👤 **User Management**: Complete user CRUD operations
- 📝 **User Profiles**: Rich user profiles with learning preferences
- ⚙️ **User Settings**: Customizable user settings and preferences
- 🔒 **Security**: Rate limiting, password hashing, email verification
- 🔄 **OAuth**: Google OAuth 2.0 integration
- 💾 **Session Management**: Active session tracking and management
- 📊 **Statistics**: User activity and statistics tracking

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v13 or higher
- **Redis**: v6 or higher (optional, but recommended)
- **Prisma**: Included as a dev dependency

## Quick Start

### 1. Clone the Repository

```bash
cd backend/user-service
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

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/writewave_users?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD=""

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=8001
NODE_ENV="development"
API_VERSION="v1"

# Email Configuration (for email verification and password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@writewave.app"
FROM_NAME="WriteWave"

# Google OAuth Configuration (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_CALLBACK_URL="http://localhost:8001/api/v1/auth/google/callback"

# Frontend URLs
FRONTEND_URL="http://localhost:3000"
```

**Important**: Generate secure JWT secrets for production:

```bash
# Generate secure random secrets
openssl rand -hex 32  # Use this for JWT_SECRET
openssl rand -hex 32  # Use this for JWT_REFRESH_SECRET
```

### 4. Setup Database

#### Option A: Using Docker (Recommended for Development)

```bash
# Start PostgreSQL
docker run -d \
  --name writewave-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=writewave_users \
  -p 5432:5432 \
  postgres:15

# Start Redis
docker run -d \
  --name writewave-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### Option B: Local Installation

Make sure PostgreSQL and Redis are installed and running on your system.

### 5. Run Database Migrations

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Or deploy migrations (for production)
npm run prisma:deploy
```

### 6. Create Required Directories

```bash
mkdir -p logs uploads
```

### 7. Start the Service

#### Development Mode (with hot reload)

```bash
npm run dev
```

#### Production Mode

```bash
# Build the project
npm run build

# Start the server
npm start
```

The service will start on `http://localhost:8001` (or the port specified in your `.env` file).

## Automated Setup Script

For a complete automated setup, use the provided setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- ✅ Check Node.js and database installations
- ✅ Install npm dependencies
- ✅ Create `.env` file from `env.example`
- ✅ Generate secure JWT secrets
- ✅ Create required directories
- ✅ Generate Prisma Client
- ✅ Run database migrations

## API Documentation

### Base URL

```
http://localhost:8001/api/v1
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <access-token>
```

### User Profile Endpoints

#### Get Profile
```http
GET /users/profile
Authorization: Bearer <access-token>
```

#### Update Profile
```http
PUT /users/profile
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Japanese language enthusiast",
  "country": "United States",
  "timezone": "America/New_York",
  "language": "en",
  "learningGoals": ["kanji", "hiragana"],
  "difficultyLevel": "intermediate",
  "studyTime": 30,
  "interests": ["anime", "manga"]
}
```

### User Settings Endpoints

#### Get Settings
```http
GET /users/settings
Authorization: Bearer <access-token>
```

#### Update Settings
```http
PUT /users/settings
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": true,
  "theme": "dark",
  "fontSize": "medium"
}
```

### Health Check

```http
GET /health
```

## Testing with Postman

1. Import the Postman collection:
   - Open Postman
   - Click **Import**
   - Select `postman.json` from the project root

2. Create a Postman Environment (optional):
   - Create a new environment
   - Add variables:
     - `baseUrl`: `http://localhost:8001/api/v1`
     - `accessToken`: (will be auto-set after login/register)
     - `refreshToken`: (will be auto-set after login/register)

3. Test the API:
   - Start with **Health Check** to verify the service is running
   - Register a new user or login
   - The `accessToken` and `refreshToken` will be automatically saved
   - Use the protected endpoints with the saved tokens

## Database Schema

The service uses Prisma ORM. The schema is defined in `prisma/schema.prisma`.

### Models

- **User**: Core user information -- email, username, password, OAuth IDs
- **UserProfile**: Extended profile information -- bio, country, timezone, learning goals
- **UserSettings**: User preferences -- notifications, theme, display settings
- **Session**: Active user sessions
- **RefreshToken**: Refresh tokens for JWT authentication
- **EmailVerification**: Email verification tokens
- **PasswordReset**: Password reset tokens

### Prisma Studio

View and edit your database using Prisma Studio:

```bash
npm run prisma:studio
```

## Project Structure

```
user-service/
├── src/
│   ├── config/          # Configuration files (database, redis, logger, passport)
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, validation)
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (jwt, password, email, events)
│   └── index.ts         # Application entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Application logs
├── uploads/             # File uploads directory
├── .env                 # Environment variables (not in git)
├── env.example          # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── postman.json         # Postman collection for API testing
└── README.md            # This file
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations (development)
- `npm run prisma:deploy` - Deploy migrations (production)
- `npm run prisma:studio` - Open Prisma Studio
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` | ⚠️ |
| `JWT_SECRET` | Secret for JWT access tokens | - | ✅ |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens | - | ✅ |
| `PORT` | Server port | `8001` | ❌ |
| `NODE_ENV` | Environment (development/production) | `development` | ❌ |
| `SMTP_HOST` | SMTP server host | - | ⚠️ |
| `SMTP_PORT` | SMTP server port | `587` | ⚠️ |
| `SMTP_USER` | SMTP username | - | ⚠️ |
| `SMTP_PASS` | SMTP password | - | ⚠️ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | - | ❌ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | - | ❌ |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:3000` | ❌ |

⚠️ = Required if using email features or Redis caching  
❌ = Optional

## Security Features

- **Password Hashing**: Uses bcrypt with configurable rounds (default: 12)
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Configurable rate limits on auth endpoints
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Helmet**: Security headers middleware
- **Input Validation**: Joi schema validation for all inputs
- **Email Verification**: Required email verification for new users
- **Password Reset**: Secure password reset flow with time-limited tokens

## Error Handling

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "message": "Human-readable message",
  "data": {},
  "error": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Logging

Logs are written to:
- Console (development)
- `logs/combined.log` (all logs)
- `logs/error.log` (error logs only)

Log levels: `debug`, `info`, `warn`, `error`

## Docker Deployment

### Build Docker Image

```bash
docker build -t writewave/user-service .
```

### Run Docker Container

```bash
docker run -d \
  --name user-service \
  -p 8001:8001 \
  --env-file .env \
  writewave/user-service
```

### Docker Compose

See `docker-compose.yml` for a complete setup with PostgreSQL and Redis.

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `CREATE DATABASE writewave_users;`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping`
- Check `REDIS_URL` in `.env`
- Service will work without Redis (caching disabled)

### Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Port Already in Use

```bash
# Find process using port 8001
lsof -i :8001

# Kill the process or change PORT in .env
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check existing GitHub issues
- Create a new issue with detailed information
- Contact the WriteWave development team

