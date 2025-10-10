import { Router } from 'express';
import { progressRoutes } from './progress.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Progress Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'progress-service',
    version: '1.0.0'
  });
});

// API routes
router.use('/progress', progressRoutes);

export { router as apiRoutes };
