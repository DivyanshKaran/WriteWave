import { Router } from 'express';
import { lessonController } from '@/controllers/lesson.controller';
import { validate } from '@/middleware/validation';
import { authenticateJWT } from '@/middleware/auth';

const router = Router();

// Lesson routes
// GET /lessons - Get all lessons
router.get('/', lessonController.getLessons);

// GET /lessons/statistics - Get lesson statistics
router.get('/statistics', lessonController.getLessonStatistics);

// GET /lessons/progression - Get lesson progression path
router.get('/progression', lessonController.getLessonProgressionPath);

// GET /lessons/level/:level - Get lessons by JLPT level
router.get('/level/:level', lessonController.getLessonsByLevel);

// GET /lessons/category/:category - Get lessons by category
router.get('/category/:category', lessonController.getLessonsByCategory);

// GET /lessons/:lessonId - Get lesson by ID
router.get('/:lessonId', lessonController.getLessonById);

// GET /lessons/:lessonId/steps - Get lesson steps
router.get('/:lessonId/steps', lessonController.getLessonSteps);

// GET /lessons/:lessonId/prerequisites - Get lesson prerequisites
router.get('/:lessonId/prerequisites', lessonController.getLessonPrerequisites);

// POST /lessons - Create lesson (admin only)
router.post('/', authenticateJWT, validate('lesson'), lessonController.createLesson);

// PUT /lessons/:lessonId - Update lesson (admin only)
router.put('/:lessonId', authenticateJWT, validate('lesson'), lessonController.updateLesson);

// DELETE /lessons/:lessonId - Delete lesson (admin only)
router.delete('/:lessonId', authenticateJWT, lessonController.deleteLesson);

export { router as lessonRoutes };
