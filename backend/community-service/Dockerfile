# Multi-stage Dockerfile for Community Service
FROM node:18-alpine AS builder
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for ts-node)
RUN npm install

# Copy source code and configuration files
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Generate Prisma client
RUN npx prisma generate

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init

# Copy all dependencies (including dev dependencies for ts-node)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy source code and configuration files
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.node.json ./

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node dist/health-check.js

# Expose port
EXPOSE 8004

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application with ts-node
CMD ["npx", "ts-node", "--project", "tsconfig.node.json", "src/index.ts"]
