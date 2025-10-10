# WriteWave User Service

A comprehensive User Service microservice for the WriteWave application, built with Node.js, Express, TypeScript, PostgreSQL, and Redis. This service handles authentication, user management, profile management, and session management.

## 🚀 Features

### Authentication System
- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Password Security**: Bcrypt hashing with configurable rounds
- **Email Verification**: Email verification workflow with secure tokens
- **Password Reset**: Secure password reset functionality with time-limited tokens
- **OAuth Integration**: Support for Google and Apple OAuth2 authentication
- **Session Management**: Redis-based session storage with device tracking

### User Management
- **User Registration**: Complete user registration with validation
- **Profile Management**: Comprehensive user profile CRUD operations
- **Settings Management**: User preferences and application settings
- **Account Management**: Account deactivation, reactivation, and deletion
- **Avatar Upload**: Profile picture management with image optimization
- **User Search**: Search functionality for finding other users

### Security Features
- **Rate Limiting**: Configurable rate limiting for API endpoints
- **Input Validation**: Comprehensive input validation with Joi
- **CORS Protection**: Configurable CORS policies
- **Security Headers**: Security headers for protection against common attacks
- **Request Logging**: Comprehensive request and response logging
- **Error Handling**: Structured error handling with proper HTTP status codes

### Database Features
- **Prisma ORM**: Type-safe database operations with Prisma
- **PostgreSQL**: Robust relational database with proper indexing
- **Redis Caching**: High-performance caching for frequently accessed data
- **Database Migrations**: Automated database schema migrations
- **Connection Pooling**: Efficient database connection management

## 🏗️ Architecture

### Project Structure
```
src/
├── config/           # Configuration files
│   ├── database.ts   # Database configuration
│   ├── redis.ts      # Redis configuration
│   ├── logger.ts     # Logging configuration
│   └── index.ts      # Main configuration
├── controllers/      # Request handlers
│   ├── auth.controller.ts
│   └── user.controller.ts
├── middleware/       # Express middleware
│   ├── auth.ts       # Authentication middleware
│   └── validation.ts # Input validation middleware
├── routes/           # API routes
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   └── index.ts
├── services/         # Business logic
│   ├── auth.service.ts
│   └── user.service.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Utility functions
│   ├── jwt.ts        # JWT utilities
│   ├── password.ts   # Password utilities
│   └── email.ts      # Email utilities
└── index.ts          # Application entry point
```

### Database Schema
- **Users**: Core user information and authentication data
- **User Profiles**: Extended user profile information
- **User Settings**: User preferences and application settings
- **Sessions**: Active user sessions with device information
- **Email Verifications**: Email verification tokens
- **Password Resets**: Password reset tokens
- **Refresh Tokens**: JWT refresh token management

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis 7
- **Authentication**: JWT with refresh tokens
- **Email**: Nodemailer with SMTP
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js 18 or higher
- npm 8 or higher
- PostgreSQL 15 or higher
- Redis 7 or higher
- Docker and Docker Compose (optional)

## 🚀 Quick Start

### 1. Clone and Install Dependencies
```bash
cd backend/user-service
npm install
```

### 2. Environment Configuration
```bash
cp env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Using Docker (Alternative)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f user-service

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables
```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/writewave_users"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server Configuration
PORT=8001
NODE_ENV="development"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@writewave.app"
FROM_NAME="WriteWave"

# OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
APPLE_CLIENT_ID="your-apple-client-id"
APPLE_TEAM_ID="your-apple-team-id"
APPLE_KEY_ID="your-apple-key-id"
APPLE_PRIVATE_KEY="your-apple-private-key"

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN="http://localhost:3000,https://writewave.app"
CORS_CREDENTIALS=true
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}
```

#### Login User
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### Password Reset Request
```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Password Reset Confirm
```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "NewSecurePassword123!"
}
```

#### Email Verification
```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token"
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer your-access-token
```

#### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Japanese language enthusiast",
  "country": "United States",
  "timezone": "America/New_York",
  "language": "en",
  "learningGoals": ["kanji", "hiragana", "katakana"],
  "difficultyLevel": "intermediate",
  "studyTime": 30,
  "interests": ["anime", "manga", "culture"]
}
```

#### Get User Settings
```http
GET /api/v1/users/settings
Authorization: Bearer your-access-token
```

#### Update User Settings
```http
PUT /api/v1/users/settings
Authorization: Bearer your-access-token
Content-Type: application/json

{
  "emailNotifications": true,
  "pushNotifications": false,
  "dailyReminders": true,
  "weeklyReports": true,
  "achievementAlerts": true,
  "profileVisibility": "public",
  "showProgress": true,
  "showAchievements": true,
  "autoAdvance": false,
  "showHints": true,
  "soundEnabled": true,
  "vibrationEnabled": false,
  "theme": "dark",
  "fontSize": "medium",
  "animations": true
}
```

#### Get User Sessions
```http
GET /api/v1/users/sessions
Authorization: Bearer your-access-token
```

#### Deactivate Account
```http
POST /api/v1/users/deactivate
Authorization: Bearer your-access-token
```

#### Delete Account
```http
DELETE /api/v1/users/account
Authorization: Bearer your-access-token
```

#### Search Users
```http
GET /api/v1/users/search?q=john&page=1&limit=10
Authorization: Bearer your-access-token
```

#### Get User Statistics
```http
GET /api/v1/users/stats
Authorization: Bearer your-access-token
```

### Admin Endpoints

#### Get All Users
```http
GET /api/v1/users/admin/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer admin-access-token
```

#### Get User by ID
```http
GET /api/v1/users/admin/users/:userId
Authorization: Bearer admin-access-token
```

### System Endpoints

#### Health Check
```http
GET /api/v1/health
```

#### API Information
```http
GET /api/v1/
```

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Endpoints
```bash
# Test health endpoint
curl http://localhost:8001/api/v1/health

# Test user registration
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!","firstName":"Test","lastName":"User"}'

# Test user login
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}'
```

## 📊 Monitoring

### Health Checks
- **Endpoint**: `GET /api/v1/health`
- **Checks**: Database connectivity, Redis connectivity, memory usage
- **Response**: JSON with service status and metrics

### Logging
- **Levels**: error, warn, info, debug
- **Format**: JSON with structured data
- **Output**: Console and file logging
- **Rotation**: Automatic log rotation with size limits

### Metrics
- **Request Count**: Total requests per endpoint
- **Response Time**: Average response time per endpoint
- **Error Rate**: Error rate per endpoint
- **Database Performance**: Query performance metrics
- **Cache Performance**: Cache hit/miss ratios

## 🔒 Security

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Refresh Tokens**: Automatic token refresh mechanism
- **Password Hashing**: Bcrypt with configurable rounds
- **Session Management**: Redis-based session storage

### Authorization
- **Role-Based Access**: Admin and user role separation
- **Resource Protection**: Protected endpoints with authentication
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Comprehensive input validation

### Data Protection
- **Encryption**: Password and sensitive data encryption
- **CORS**: Configurable cross-origin resource sharing
- **Security Headers**: Protection against common attacks
- **Request Logging**: Audit trail for security events

## 🚀 Deployment

### Production Deployment
```bash
# Build production image
docker build -t writewave/user-service:latest .

# Run with production configuration
docker run -d \
  --name user-service \
  -p 8001:8001 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://user:password@db:5432/writewave_users" \
  -e REDIS_URL="redis://redis:6379" \
  -e JWT_SECRET="your-production-jwt-secret" \
  writewave/user-service:latest
```

### Environment-Specific Configurations
- **Development**: Debug logging, relaxed security
- **Staging**: Production-like settings, enhanced monitoring
- **Production**: Optimized performance, strict security

### Scaling Considerations
- **Horizontal Scaling**: Stateless service design
- **Database Scaling**: Connection pooling and read replicas
- **Cache Scaling**: Redis clustering for high availability
- **Load Balancing**: Multiple service instances behind load balancer

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use meaningful commit messages
- Update documentation for new features
- Follow the existing code style

## 📄 License

This project is part of the WriteWave application and follows the same license terms.

## 🆘 Support

For support and questions:
- Create an issue in the project repository
- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

**Note**: This User Service is designed specifically for the WriteWave application. Modify the configuration and endpoints according to your specific requirements.
