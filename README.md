# WriteWave - Content Creation Platform

A comprehensive content creation and management platform built with microservices architecture, featuring article creation, community features, analytics, and Japanese language learning tools.

## 🌟 Overview

WriteWave is a modern content platform that combines writing tools, community features, and language learning capabilities. Built with a scalable microservices architecture, it provides a robust foundation for content creators and language learners.

## ✨ Features

- ✍️ **Article Creation** - Rich text editor with markdown support
- 📊 **Analytics** - Comprehensive content analytics powered by ClickHouse
- 👥 **Community** - Forums, study groups, and social interactions
- 📝 **Content Management** - Organize and manage your content
- 🔔 **Real-time Notifications** - Push notifications and updates
- 📈 **Progress Tracking** - Track learning progress and achievements
- 🔐 **Secure Authentication** - JWT-based auth with OAuth support
- 🌐 **API Gateway** - Kong-based API gateway with rate limiting
- 🇯🇵 **Japanese Learning** - Hiragana, Katakana, Kanji, Grammar, Vocabulary

## 🏗️ Architecture

### Microservices

```
writewave/
├── frontend/              # React + Vite frontend
├── backend/
│   ├── user-service/      # Authentication & user management (Port 8001)
│   ├── content-service/   # Learning content (Port 8002)
│   ├── progress-service/  # Progress tracking (Port 8003)
│   ├── community-service/ # Forums & groups (Port 8004)
│   ├── notification-service/ # Notifications (Port 8005)
│   ├── analytics-service/ # Analytics (Port 8006)
│   ├── articles-service/  # Articles (Port 8007)
│   ├── kong/             # API Gateway (Port 8000)
│   └── shared/           # Shared utilities
└── infrastructure/        # K8s, Terraform, monitoring
```

### Technology Stack

**Frontend:**

- React 18.3.1 + TypeScript 5.8.3
- Vite 5.4.19
- Tailwind CSS 3.4.17
- Radix UI components
- TanStack Query for data fetching
- Zustand for state management

**Backend:**

- Node.js 18+ with Express.js
- TypeScript
- Prisma ORM
- PostgreSQL 15 (per service)
- Redis 7 (caching & sessions)
- Kafka (event streaming)
- RabbitMQ (message queue)

**Infrastructure:**

- Kong API Gateway
- Docker & Docker Compose
- Kubernetes
- Terraform
- Prometheus + Grafana
- ClickHouse (analytics)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd writewave
   ```

2. **Set up environment variables**

   ```bash
   # Copy example files for each service
   cp backend/user-service/.env.example backend/user-service/.env
   cp backend/content-service/.env.example backend/content-service/.env
   # ... repeat for all services

   # Generate secure secrets
   openssl rand -base64 64  # For JWT secrets
   ```

3. **Start infrastructure**

   ```bash
   cd infrastructure
   docker-compose up -d
   ```

4. **Install dependencies**

   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend services
   cd ../backend/user-service
   npm install
   # ... repeat for all services
   ```

5. **Run database migrations**

   ```bash
   cd backend/user-service
   npx prisma migrate dev
   npx prisma generate
   # ... repeat for all services
   ```

6. **Start services**

   ```bash
   # Start Kong API Gateway
   cd backend/kong
   docker compose up -d

   # Start backend services (in separate terminals)
   cd backend/user-service && npm run dev
   cd backend/content-service && npm run dev
   # ... or use docker-compose.dev.yml

   # Start frontend
   cd frontend && npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:8080
   - API Gateway: http://localhost:8000
   - Kong Admin: http://localhost:8001

## 📝 Development

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Development

```bash
cd backend/<service-name>
npm run dev          # Start with nodemon (hot reload)
npm run build        # Compile TypeScript
npm start            # Run compiled code
npm test             # Run tests
npm run lint         # Run ESLint

# Prisma commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

### Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f <service-name>

# Stop all services
docker-compose -f docker-compose.dev.yml down

# Rebuild service
docker-compose -f docker-compose.dev.yml up -d --build <service-name>
```

## 🔐 Security

### Environment Variables

**NEVER commit `.env` files!** Use `.env.example` templates.

Required secrets:

- `JWT_SECRET` - Generate with `openssl rand -base64 64`
- `JWT_REFRESH_SECRET` - Generate with `openssl rand -base64 64`
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

### Security Features

- ✅ JWT authentication with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ XSS protection with DOMPurify
- ✅ SQL injection protection via Prisma ORM
- ✅ Rate limiting on API endpoints
- ✅ CORS configuration
- ✅ Helmet security headers
- ⚠️ CSRF protection (recommended to add)
- ⚠️ Content Security Policy (recommended to add)

## 📚 API Documentation

### Service Endpoints

- **User Service**: `http://localhost:8000/api/v1/auth/*`, `/api/v1/users/*`
- **Content Service**: `http://localhost:8000/api/v1/characters/*`, `/api/v1/lessons/*`
- **Articles Service**: `http://localhost:8000/api/articles/*`
- **Progress Service**: `http://localhost:8000/api/v1/progress/*`
- **Community Service**: `http://localhost:8000/community/*`
- **Notification Service**: `http://localhost:8000/api/notifications/*`
- **Analytics Service**: `http://localhost:8000/api/v1/analytics/*`

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token in subsequent requests
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Deployment

### Production Build

```bash
# Frontend
cd frontend
npm run build

# Backend services
cd backend/<service-name>
npm run build
```

### Docker Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/kubernetes/

# Check deployment status
kubectl get pods
kubectl get services
```

## 🔧 Configuration

### Service Ports

| Service              | Port | Description       |
| -------------------- | ---- | ----------------- |
| Kong Gateway         | 8000 | API Gateway       |
| User Service         | 8001 | Authentication    |
| Content Service      | 8002 | Learning content  |
| Progress Service     | 8003 | Progress tracking |
| Community Service    | 8004 | Forums & groups   |
| Notification Service | 8005 | Notifications     |
| Analytics Service    | 8006 | Analytics         |
| Articles Service     | 8007 | Articles          |
| Frontend             | 8080 | React app         |

### Database Ports

| Database               | Port | Service           |
| ---------------------- | ---- | ----------------- |
| PostgreSQL (User)      | 5433 | User service      |
| PostgreSQL (Content)   | 5434 | Content service   |
| PostgreSQL (Progress)  | 5435 | Progress service  |
| PostgreSQL (Community) | 5436 | Community service |
| PostgreSQL (Analytics) | 5437 | Analytics service |
| PostgreSQL (Articles)  | 5444 | Articles service  |
| Redis                  | 6379 | All services      |
| ClickHouse             | 8123 | Analytics         |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow ESLint configuration
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by best practices in microservices architecture
- Community-driven development

## 📞 Support

For issues and questions:

- Open an issue on GitHub
- Check existing documentation
- Review the API documentation

---

**Made with ❤️ for content creators and language learners**
