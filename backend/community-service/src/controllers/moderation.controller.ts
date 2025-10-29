import { Request, Response } from 'express';
import { moderationService } from '../services/moderation.service';
import { ApiResponse } from '../types';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

export class ModerationController {
  // Reports
  async getReports(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view reports'
        });
        return;
      }

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const status = req.query.status as any;
      const { reports, total } = await moderationService.getReports(pagination, status);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: reports,
        message: 'Reports retrieved successfully',
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrev: pagination.page > 1
        }
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getReport(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view reports'
        });
        return;
      }

      const { reportId } = req.params;
      const report = await moderationService.getReport(reportId);
      
      if (!report) {
        res.status(404).json({
          success: false,
          error: 'Report not found'
        });
        return;
      }
      
      const response: ApiResponse = {
        success: true,
        data: report,
        message: 'Report retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async createReport(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const reportData = req.body;
      
      const report = await moderationService.createReport(reportData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: report,
        message: 'Report submitted successfully'
      };
      
      res.status(201).json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updateReport(req: Request, res: Response): Promise<void> {
    try {
      const { reportId } = req.params;
      const userId = req.user!.id;
      const updateData = req.body;
      
      const report = await moderationService.updateReport(reportId, updateData, userId);
      
      const response: ApiResponse = {
        success: true,
        data: report,
        message: 'Report updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Content Moderation
  async moderateContent(req: Request, res: Response): Promise<void> {
    try {
      const { content, type } = req.body;
      
      const result = await moderationService.moderateContent(content, type);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'Content moderation completed'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async moderateUser(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to moderate users'
        });
        return;
      }

      const { userId } = req.params;
      const result = await moderationService.moderateUser(userId);
      
      const response: ApiResponse = {
        success: true,
        data: result,
        message: 'User moderation completed'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // User Management
  async suspendUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { reason, duration } = req.body;
      const moderatorId = req.user!.id;
      
      const user = await moderationService.suspendUser(userId, reason, duration, moderatorId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User suspended successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async unsuspendUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const moderatorId = req.user!.id;
      
      const user = await moderationService.unsuspendUser(userId, moderatorId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User unsuspended successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async promoteToModerator(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const promoterId = req.user!.id;
      
      const user = await moderationService.promoteToModerator(userId, promoterId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User promoted to moderator successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async demoteFromModerator(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const demoterId = req.user!.id;
      
      const user = await moderationService.demoteFromModerator(userId, demoterId);
      
      const response: ApiResponse = {
        success: true,
        data: user,
        message: 'User demoted from moderator successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Content Management
  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { reason } = req.body;
      const moderatorId = req.user!.id;
      
      await moderationService.deletePost(postId, moderatorId, reason);
      
      const response: ApiResponse = {
        success: true,
        message: 'Post deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const { commentId } = req.params;
      const { reason } = req.body;
      const moderatorId = req.user!.id;
      
      await moderationService.deleteComment(commentId, moderatorId, reason);
      
      const response: ApiResponse = {
        success: true,
        message: 'Comment deleted successfully'
      };
      
      res.json(response);
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Moderation Dashboard
  async getModerationDashboard(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view moderation dashboard'
        });
        return;
      }

      const dashboard = await moderationService.getModerationDashboard();
      
      const response: ApiResponse = {
        success: true,
        data: dashboard,
        message: 'Moderation dashboard retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getModerationStats(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized to view moderation statistics'
        });
        return;
      }

      const stats = await moderationService.getModerationStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Moderation statistics retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }
}

export const moderationController = new ModerationController();
