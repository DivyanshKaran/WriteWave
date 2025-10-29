# Multi-stage build for Progress Service
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

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

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy all dependencies (including dev dependencies for ts-node)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy source code and configuration files
COPY --from=builder /app/src ./src
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/tsconfig.node.json ./

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8003/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with ts-node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "ts-node", "--project", "tsconfig.node.json", "src/index.ts"]
