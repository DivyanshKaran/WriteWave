# WriteWave Architecture Overview

## High-Level System

WriteWave is a microservices-based platform for Japanese character learning, with a clear separation between domain services, an API gateway, shared infrastructure, and developer tooling. There is currently no `frontend/` app in the repo; a new frontend will be added later to consume these APIs via the gateway.

- Domain microservices (Node.js/Express/TypeScript):
  - `backend/user-service` (auth, users, profiles, sessions)
  - `backend/content-service` (characters, vocabulary, lessons, media)
  - `backend/progress-service` (XP, streaks, achievements, mastery, leaderboards)
  - `backend/community-service` (forum, study groups, social, moderation, websockets)
  - `backend/notification-service` (multi-channel notifications, templates, queue workers)
  - `backend/analytics-service` (event tracking, learning analytics, reporting; ClickHouse + TimescaleDB)
- API gateway: `backend/kong` (Kong 3.x) with custom plugins, routing, CORS, rate limiting, circuit breaker
- Infrastructure: `infrastructure/` (databases, redis cluster, MQs, monitoring, kubernetes, terraform)
- Local/dev orchestration: root `docker-compose.dev.yml` and service-level compose files

## Service Responsibilities & Interfaces

### User Service (`backend/user-service`)
- Auth: JWT access/refresh, password hashing, email verification, reset flows, OAuth (Google/Apple)
- Users: profile CRUD, settings, sessions, admin endpoints
- Storage: PostgreSQL (Prisma), Redis (sessions/cache)
- Base path via gateway: `/api/v1/auth`, `/api/v1/users`

### Content Service (`backend/content-service`)
- Domain: Hiragana, Katakana, Kanji, vocabulary, lessons, media uploads
- APIs: characters, vocabulary, lessons, media
- Storage: PostgreSQL (Prisma), Redis cache
- Base path via gateway: `/api/v1/characters`, `/api/v1/content`, etc.

### Progress Service (`backend/progress-service`)
- Domain: XP, leveling, streaks, achievements, mastery, analytics, leaderboards
- Storage: PostgreSQL (Prisma), Redis cache
- Base path via gateway: `/api/v1/progress`, plus achievements/stats

### Community Service (`backend/community-service`)
- Domain: forum, posts, comments, study groups, leaderboards, moderation
- Real-time: WebSockets (Socket.IO) for chat, notifications, presence
- Storage: PostgreSQL (Prisma), Redis
- Base path via gateway: `/api/v1/community`, plus discussions/groups

### Notification Service (`backend/notification-service`)
- Multi-channel: email (SendGrid/SES), push (Web Push), SMS (Twilio), in-app
- Queue: Bull on Redis, workers under `src/workers`
- Preferences, subscriptions, analytics
- Base path via gateway: `/api/v1/notifications`

### Analytics Service (`backend/analytics-service`)
- Event tracking, dashboards, learning insights, A/B testing, reports
- Storage: ClickHouse (event/time-series), PostgreSQL/TimescaleDB, Redis
- Base path via gateway: `/api/v1/analytics`, `/api/v1/metrics`, `/api/v1/reports`

## Cross-Cutting Concerns

- Security: Helmet, CORS, rate limiting, request IDs; JWT validated at gateway and/or per-service
- Validation: Joi-based schemas in services
- Logging: Winston/morgan; gateway request/response logging plugin; logs to console/files/redis
- Error handling: centralized error middleware in services and gateway `error-handler` plugin
- Caching: Redis cluster proxy for app caches, rate limiting, sessions
- Real-time: Community service WebSocket server; notification updates; analytics can be live
- Background jobs: Notification workers; potential for progress/analytics jobs

## API Gateway (Kong)

- Config: `backend/kong/kong.yml` defines routes to each service with plugins:
  - `jwt-auth` (key_claim_name `iss`), `rate-limiting` (redis-backed), `cors`, `request-logging`, `response-transformer`, `circuit-breaker`
- Dev env: `backend/kong/config/development.yml` sets environment, logging, CORS, rate limits
- Compose: `backend/kong/docker-compose.yml` runs Kong with Postgres, Redis, mock backends for testing
- Typical public paths:
  - User: `/api/v1/auth`, `/api/v1/users`
  - Content: `/api/v1/characters`, `/api/v1/content`
  - Progress: `/api/v1/progress`, `/api/v1/achievements`, `/api/v1/stats`
  - Community: `/api/v1/community`, `/api/v1/leaderboard`
  - Notifications: `/api/v1/notifications`, `/api/v1/websocket`
  - Analytics: `/api/v1/analytics`, `/api/v1/metrics`, `/api/v1/reports`

## Infrastructure & Ops

- Compose (dev): root `docker-compose.dev.yml` wires services to per-domain Postgres, Redis cluster proxy, RabbitMQ, Kafka (with Zookeeper), ClickHouse, Mailhog, MinIO
- Infra bundle: `infrastructure/docker-compose.yml` for a full local stack (DBs, Redis cluster nodes + proxy, MQs, Kafka UI, Prometheus, Grafana, Jaeger, Nginx LB)
- Kubernetes: `infrastructure/kubernetes/` contains manifests for namespaces, deployments, HPA, ingress, Istio, secrets, configmaps, PDB
- Databases: `infrastructure/databases/postgres-cluster` config files for Postgres; `redis-cluster/` config for Redis; `migrations/migrate.sh`
- Messaging: `infrastructure/message-queue/` RabbitMQ and Kafka definitions
- Monitoring: `infrastructure/monitoring/` (Prometheus, Grafana dashboards, ELK, health-check services)
- IaC: `infrastructure/terraform/` with `main.tf`, `variables.tf`, `outputs.tf`

## Service Runtime Patterns

- Express apps with consistent middleware: Helmet, CORS, compression, JSON parsing, rate limiting, logging, request ID
- Health: each service exposes `/health` and a root index with metadata
- Graceful shutdown: signal handlers that close HTTP servers and disconnect DB/Redis/WebSockets/queues
- Config: `.env` per service (see `env.example`); Prisma for DB models (where present)

## Data Stores & Topics

- PostgreSQL per service:
  - Users: `writewave_users`
  - Content: `writewave_content`
  - Progress: `writewave_progress`
  - Community: `writewave_community`
  - Analytics: `writewave_analytics` (TimescaleDB)
- ClickHouse: analytics events/time-series
- Redis: sessions, caches, rate limits, queues
- MQs: RabbitMQ available; Kafka cluster present for streaming/analytics pipelines (brokers 9092-9094)
- Object storage: MinIO for media (S3-compatible), to be used by content-service

## Local Development

- Bring up the dev stack: `docker-compose -f docker-compose.dev.yml up -d`
- Access points:
  - Services: `:8001-8006`
  - RabbitMQ UI: `http://localhost:15672`
  - Kafka UI: `http://localhost:8080`
  - MinIO: `http://localhost:9001`
  - Prometheus: `http://localhost:9090`, Grafana: `http://localhost:3000`, Jaeger: `http://localhost:16686`
  - Mailhog: `http://localhost:8025`
- Kong (when used standalone): Proxy `:8000`, Admin `:8001`

## Frontend Plan (to be added)

A new `frontend/` app will be created (e.g., Next.js + TypeScript) consuming the gateway APIs.

- Auth flows with `user-service` (register, login, refresh, sessions)
- Learn views with `content-service` (characters, lessons, media)
- Progress dashboards with `progress-service` (XP, streaks, achievements, leaderboards)
- Community UI with `community-service` (forums, groups, chat via WebSockets)
- Notifications preferences and inbox with `notification-service`
- Analytics dashboards (user insights and reports) with `analytics-service`
- Environment config for base API URL (Kong proxy) and WebSocket endpoint

## Security & Compliance Considerations

- JWT validation at gateway and edges; secure secrets via environment/secret stores
- Rate limiting at gateway and per-service; IP allowlists at gateway
- Input validation and output filtering; CORS per environment
- PII: protect user profile and auth data; minimize exposure in logs; rotate keys

## Repository Layout

- `backend/` — all microservices and `kong/`
- `infrastructure/` — infra services, monitoring, k8s, terraform
- `scripts/` — deployment and security scan scripts
- `docker-compose.dev.yml` — local dev orchestration for the full stack

This document should keep you oriented when building the new `frontend/` and integrating it with the existing backend and gateway.
