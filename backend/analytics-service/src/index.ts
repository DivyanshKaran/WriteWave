import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './utils/errors';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8006;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Request ID middleware
app.use((req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 11);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  const start = Date.now();
  const checks: {
    service: string;
    clickhouse: string;
    redis: string;
    latencyMs?: number;
  } = {
    service: 'healthy',
    clickhouse: 'unknown',
    redis: 'unknown',
  };

  try {
    // ClickHouse check
    const { clickhouseClient } = await import('./models/clickhouse');
    await clickhouseClient.ping();
    checks.clickhouse = 'healthy';
  } catch (error: any) {
    checks.clickhouse = 'unhealthy';
    logger.error('ClickHouse health check failed', { error: error.message });
  }

  try {
    // Redis check
    const { redisClient } = await import('./utils/redis');
    const pingResult = await redisClient.ping();
    checks.redis = pingResult === 'PONG' ? 'healthy' : 'unhealthy';
  } catch (error: any) {
    checks.redis = 'unhealthy';
    logger.error('Redis health check failed', { error: error.message });
  }

  checks.latencyMs = Date.now() - start;
  const isHealthy = checks.clickhouse === 'healthy' && checks.redis === 'healthy';
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isHealthy,
    status: isHealthy ? 'healthy' : 'degraded',
    checks,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WriteWave Analytics Service',
    version: process.env.npm_package_version || '1.0.0',
    documentation: '/api/docs',
    health: '/health',
    endpoints: {
      events: '/api/events',
      analytics: '/api/analytics',
      dashboards: '/api/dashboards',
      reports: '/api/reports',
      abTests: '/api/ab-tests'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist',
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/docs',
      'POST /api/events',
      'GET /api/analytics/dashboard/:type',
      'GET /api/analytics/user/:userId/insights',
      'GET /api/analytics/performance/summary',
      'POST /api/analytics/query',
      'GET /api/analytics/reports/:reportType'
    ]
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Close Kafka connections (consumer disconnection handled in service, but producer/admin cleanup)
    try {
      const { disconnectKafka } = await import('../../shared/utils/kafka');
      await disconnectKafka();
      logger.info('Kafka connections closed');
    } catch (error) {
      logger.warn('Error disconnecting Kafka (non-fatal)', { error: (error as any).message });
    }

    server.close(() => {
      logger.info('HTTP server closed');
      // Close database connections, queues, etc.
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  } catch (error) {
    logger.error('Error during graceful shutdown', { error: (error as any).message });
    process.exit(1);
  }
};

// Start server
const server = app.listen(parseInt(String(PORT)), HOST, () => {
  logger.info(`Analytics Service running on http://${HOST}:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`Health check: http://${HOST}:${PORT}/health`);
  logger.info(`API Documentation: http://${HOST}:${PORT}/api/docs`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM').catch(err => logger.error('Shutdown error', err)));
process.on('SIGINT', () => gracefulShutdown('SIGINT').catch(err => logger.error('Shutdown error', err)));

export default app;
