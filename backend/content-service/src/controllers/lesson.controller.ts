import { Request, Response } from 'express';
import { lessonService } from '@/services/lesson.service';
import { logger } from '@/config/logger';

// Lesson controller class
export class LessonController {
  // Get all lessons
  async getLessons(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder, level, category, difficultyLevel } = req.query;

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'order',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const filters = {
        level: level as any,
        category: category as any,
        difficultyLevel: difficultyLevel as any,
      };

      const result = await lessonService.getLessons(pagination, filters);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lessons controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lesson by ID
  async getLessonById(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({
          success: false,
          message: 'Lesson ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await lessonService.getLessonById(lessonId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lesson by ID controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lessons by level
  async getLessonsByLevel(req: Request, res: Response): Promise<void> {
    try {
      const { level } = req.params;
      const { page, limit, sortBy, sortOrder } = req.query;

      if (!level || !['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
        res.status(400).json({
          success: false,
          message: 'Valid JLPT level is required (N5, N4, N3, N2, N1)',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'order',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await lessonService.getLessonsByLevel(level as any, pagination);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lessons by level controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lessons by category
  async getLessonsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;
      const { page, limit, sortBy, sortOrder } = req.query;

      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 20,
        sortBy: sortBy as string || 'order',
        sortOrder: sortOrder as 'asc' | 'desc' || 'asc',
      };

      const result = await lessonService.getLessonsByCategory(category as any, pagination);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lessons by category controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lesson steps
  async getLessonSteps(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({
          success: false,
          message: 'Lesson ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await lessonService.getLessonSteps(lessonId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lesson steps controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lesson prerequisites
  async getLessonPrerequisites(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({
          success: false,
          message: 'Lesson ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await lessonService.getLessonPrerequisites(lessonId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lesson prerequisites controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lesson statistics
  async getLessonStatistics(req: Request, res: Response): Promise<void> {
    try {
      const result = await lessonService.getLessonStatistics();

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lesson statistics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get lesson progression path
  async getLessonProgressionPath(req: Request, res: Response): Promise<void> {
    try {
      const { level, category } = req.query;

      const filters = {
        level: level as any,
        category: category as any,
      };

      const result = await lessonService.getLessonProgressionPath(filters);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get lesson progression path controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Create lesson (admin only)
  async createLesson(req: Request, res: Response): Promise<void> {
    try {
      const result = await lessonService.createLesson(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Create lesson controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update lesson (admin only)
  async updateLesson(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({
          success: false,
          message: 'Lesson ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await lessonService.updateLesson(lessonId, req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update lesson controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Delete lesson (admin only)
  async deleteLesson(req: Request, res: Response): Promise<void> {
    try {
      const { lessonId } = req.params;

      if (!lessonId) {
        res.status(400).json({
          success: false,
          message: 'Lesson ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await lessonService.deleteLesson(lessonId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
          error: result.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Delete lesson controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export lesson controller instance
export const lessonController = new LessonController();

// Export default
export default lessonController;
