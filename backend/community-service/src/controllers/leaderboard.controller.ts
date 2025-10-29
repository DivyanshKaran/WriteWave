import { Request, Response } from 'express';
import { leaderboardService } from '../services/leaderboard.service';
import { ApiResponse, LeaderboardType } from '../types';
import { validateRequest } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

export class LeaderboardController {
  // Leaderboards
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { type, period, category, limit } = req.query;
      
      if (!type) {
        res.status(400).json({
          success: false,
          error: 'Leaderboard type is required'
        });
        return;
      }

      const query = {
        type: type as LeaderboardType,
        period: period as string,
        category: category as string,
        limit: limit ? parseInt(limit as string) : 50
      };

      const entries = await leaderboardService.getLeaderboard(query);
      
      const response: ApiResponse = {
        success: true,
        data: entries,
        message: 'Leaderboard retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getUserRank(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type } = req.params;
      const { period, category } = req.query;
      
      const rank = await leaderboardService.getUserRank(
        userId, 
        type as any, 
        period as string, 
        category as string
      );
      
      const response: ApiResponse = {
        success: true,
        data: { rank },
        message: 'User rank retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async getLeaderboardAroundUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type } = req.params;
      const { period, category, limit } = req.query;
      
      const entries = await leaderboardService.getLeaderboardAroundUser(
        userId,
        type as any,
        period as string,
        category as string,
        limit ? parseInt(limit as string) : 10
      );
      
      const response: ApiResponse = {
        success: true,
        data: entries,
        message: 'Leaderboard around user retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Category Leaderboards
  async getCategoryLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId, type } = req.params;
      const { period } = req.query;
      
      const entries = await leaderboardService.getCategoryLeaderboard(
        categoryId,
        type as any,
        period as string
      );
      
      const response: ApiResponse = {
        success: true,
        data: entries,
        message: 'Category leaderboard retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Group Leaderboards
  async getGroupLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { groupId, type } = req.params;
      
      const entries = await leaderboardService.getGroupLeaderboard(groupId, type as any);
      
      const response: ApiResponse = {
        success: true,
        data: entries,
        message: 'Group leaderboard retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Achievements
  async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20
      };

      const { achievements, total } = await leaderboardService.getUserAchievements(userId, pagination);

      const totalPages = Math.ceil(total / pagination.limit);
      
      const response: ApiResponse = {
        success: true,
        data: achievements,
        message: 'User achievements retrieved successfully',
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

  async checkAchievements(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      
      const newAchievements = await leaderboardService.checkAndUnlockAchievements(userId);
      
      const response: ApiResponse = {
        success: true,
        data: newAchievements,
        message: newAchievements.length > 0 ? 'New achievements unlocked!' : 'No new achievements'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Statistics
  async getLeaderboardStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await leaderboardService.getLeaderboardStats();
      
      const response: ApiResponse = {
        success: true,
        data: stats,
        message: 'Leaderboard statistics retrieved successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  // Admin endpoints
  async updateDailyLeaderboards(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin/moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
        return;
      }

      await leaderboardService.updateDailyLeaderboards();
      
      const response: ApiResponse = {
        success: true,
        message: 'Daily leaderboards updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updateWeeklyLeaderboards(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin/moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
        return;
      }

      await leaderboardService.updateWeeklyLeaderboards();
      
      const response: ApiResponse = {
        success: true,
        message: 'Weekly leaderboards updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async updateMonthlyLeaderboards(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin/moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
        return;
      }

      await leaderboardService.updateMonthlyLeaderboards();
      
      const response: ApiResponse = {
        success: true,
        message: 'Monthly leaderboards updated successfully'
      };
      
      res.json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  }

  async clearLeaderboardCache(req: Request, res: Response): Promise<void> {
    try {
      // Check if user is admin/moderator
      if (!req.user?.isModerator) {
        res.status(403).json({
          success: false,
          error: 'Not authorized'
        });
        return;
      }

      await leaderboardService.clearLeaderboardCache();
      
      const response: ApiResponse = {
        success: true,
        message: 'Leaderboard cache cleared successfully'
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

export const leaderboardController = new LeaderboardController();
