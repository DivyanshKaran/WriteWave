import { Router } from 'express';
import { characterRoutes } from './character.routes';
import { vocabularyRoutes } from './vocabulary.routes';
import { lessonRoutes } from './lesson.routes';
import { mediaRoutes } from './media.routes';
import { checkRedisHealth } from '../config/redis';
import { checkDatabaseHealth } from '../config/database';
import { logger } from '../config/logger';
// import epubRoutes from './epub.routes'; // Removed from API - keeping as local implementation only

const router = Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  const start = Date.now();
  const checks: {
    service: string;
    database: string;
    redis: string;
    latencyMs?: number;
  } = {
    service: 'healthy',
    database: 'unknown',
    redis: 'unknown',
  };

  try {
    // Database check
    const dbHealth = await checkDatabaseHealth();
    checks.database = dbHealth.status === 'connected' ? 'healthy' : 'unhealthy';
  } catch (error: any) {
    checks.database = 'unhealthy';
    logger.error('Database health check failed', { error: error.message });
  }

  try {
    // Redis check
    const redisHealth = await checkRedisHealth();
    checks.redis = redisHealth.status === 'connected' ? 'healthy' : 'unhealthy';
  } catch (error: any) {
    checks.redis = 'unhealthy';
    logger.error('Redis health check failed', { error: error.message });
  }

  checks.latencyMs = Date.now() - start;
  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';
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
router.use('/characters', characterRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/lessons', lessonRoutes);
router.use('/media', mediaRoutes);
// router.use('/epub', epubRoutes); // Removed from API - epub extractor is local only

export { router as apiRoutes };
