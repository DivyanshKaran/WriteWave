import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { logger } from './config/logger';
import { apiRoutes } from './routes';
import { ensureUploadDir } from './middleware/uploads';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';

// Create Express app
const app = express();
ensureUploadDir();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors?.origin || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request ID middleware
app.use((req: any, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// API routes
app.use('/api/v1', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Service API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/v1/health',
      characters: '/api/v1/characters',
      vocabulary: '/api/v1/vocabulary',
      lessons: '/api/v1/lessons',
      media: '/api/v1/media'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    error: error.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    const { disconnectKafka } = await import('../../shared/utils/kafka');
    await disconnectKafka();
    logger.info('Kafka connections closed');
  } catch (error) {
    logger.warn('Error disconnecting Kafka (non-fatal)', { error: (error as any).message });
  }
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Initialize Kafka producer if enabled
    if (process.env.ENABLE_KAFKA === 'true') {
      try {
        const { getProducer } = await import('../../shared/utils/kafka');
        await getProducer();
        logger.info('Kafka producer connected');
      } catch (error) {
        logger.warn('Failed to connect Kafka producer (non-fatal)', { error: (error as any).message });
      }
    }

    // Start server
    const PORT = config.port || 8002;
    app.listen(PORT, () => {
      logger.info(`Content Service running on port ${PORT}`, {
        port: PORT,
        environment: config.nodeEnv,
        timestamp: new Date().toISOString()
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
