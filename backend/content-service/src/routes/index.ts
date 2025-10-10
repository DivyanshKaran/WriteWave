import { Router } from 'express';
import { characterRoutes } from './character.routes';
import { vocabularyRoutes } from './vocabulary.routes';
import { lessonRoutes } from './lesson.routes';
import { mediaRoutes } from './media.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Content Service is healthy',
    timestamp: new Date().toISOString(),
    service: 'content-service',
    version: '1.0.0'
  });
});

// API routes
router.use('/characters', characterRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/lessons', lessonRoutes);
router.use('/media', mediaRoutes);

export { router as apiRoutes };
