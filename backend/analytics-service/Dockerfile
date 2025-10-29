# Multi-stage Dockerfile for Analytics Service
# ============================================

# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Stage 2: Build application
FROM node:18-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    curl

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build application
# Skip build step for now - use ts-node directly
# RUN npm run build

# Stage 3: Production image
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install security updates and required packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./

# Copy source and dependencies from builder
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Copy configuration files
COPY --from=builder /app/tsconfig.json ./

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8006/health || exit 1

# Expose port
EXPOSE 8006

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["npx", "ts-node", "src/index.ts"]