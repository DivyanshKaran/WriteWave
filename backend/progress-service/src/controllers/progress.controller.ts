import { Request, Response } from 'express';
import { xpService } from '@/services/xp.service';
import { characterMasteryService } from '@/services/character-mastery.service';
import { achievementService } from '@/services/achievement.service';
import { streakService } from '@/services/streak.service';
import { analyticsService } from '@/services/analytics.service';
import { leaderboardService } from '@/services/leaderboard.service';
import { logger } from '@/config/logger';

// Progress controller class
export class ProgressController {
  // Get user progress
  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user progress data
      const [userProgress, levelInfo, masteryStats, achievementStats, streakStats, analyticsStats] = await Promise.all([
        // User progress
        xpService.getUserLevel(userId),
        // Character mastery statistics
        characterMasteryService.getMasteryStatistics(userId),
        // Achievement statistics
        achievementService.getAchievementStatistics(userId),
        // Streak statistics
        streakService.getStreakStatistics(userId),
        // Analytics statistics
        analyticsService.getAnalyticsStatistics(userId)
      ]);

      const result = {
        userProgress: userProgress.data,
        levelInfo: levelInfo.data,
        masteryStats: masteryStats.data,
        achievementStats: achievementStats.data,
        streakStats: streakStats.data,
        analyticsStats: analyticsStats.data
      };

      res.status(200).json({
        success: true,
        message: 'User progress retrieved successfully',
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Get user progress controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update character practice
  async updateCharacterPractice(req: Request, res: Response): Promise<void> {
    try {
      const { userId, characterId, characterType, accuracy, timeSpent, isPerfect, strokesCorrect, strokesTotal } = req.body;

      if (!userId || !characterId || !characterType || accuracy === undefined || timeSpent === undefined) {
        res.status(400).json({
          success: false,
          message: 'Required fields are missing',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Update character mastery
      const masteryResult = await characterMasteryService.updateCharacterMastery(
        userId,
        characterId,
        characterType,
        accuracy,
        timeSpent,
        isPerfect,
        strokesCorrect,
        strokesTotal
      );

      if (!masteryResult.success) {
        res.status(400).json({
          success: false,
          message: masteryResult.message,
          error: masteryResult.error,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Add XP for character practice
      const xpResult = await xpService.addXp(userId, 'CHARACTER_PRACTICE', {
        characterId,
        characterType,
        accuracy,
        timeSpent,
        isPerfect
      });

      // Update daily practice streak
      const streakResult = await streakService.updateStreak(userId, 'DAILY_PRACTICE');

      // Check for achievements
      const achievementResult = await achievementService.checkAndUnlockAchievements(userId);

      res.status(200).json({
        success: true,
        message: 'Character practice updated successfully',
        data: {
          mastery: masteryResult.data,
          xp: xpResult.data,
          streak: streakResult.data,
          achievements: achievementResult.data
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Update character practice controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update XP
  async updateXp(req: Request, res: Response): Promise<void> {
    try {
      const { userId, amount, source, description, metadata } = req.body;

      if (!userId || !amount || !source || !description) {
        res.status(400).json({
          success: false,
          message: 'Required fields are missing',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await xpService.addXp(userId, source, metadata);

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
      logger.error('Update XP controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get user streaks
  async getUserStreaks(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { type } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await streakService.getUserStreaks(userId, type as any);

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
      logger.error('Get user streaks controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get user achievements
  async getUserAchievements(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { category, rarity, unlocked } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await achievementService.getUserAchievements(
        userId,
        category as any,
        rarity as any,
        unlocked !== undefined ? unlocked === 'true' : undefined
      );

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
      logger.error('Get user achievements controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Update character mastery
  async updateCharacterMastery(req: Request, res: Response): Promise<void> {
    try {
      const { userId, characterId, characterType, accuracy, timeSpent, isPerfect, strokesCorrect, strokesTotal } = req.body;

      if (!userId || !characterId || !characterType || accuracy === undefined || timeSpent === undefined) {
        res.status(400).json({
          success: false,
          message: 'Required fields are missing',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterMasteryService.updateCharacterMastery(
        userId,
        characterId,
        characterType,
        accuracy,
        timeSpent,
        isPerfect,
        strokesCorrect,
        strokesTotal
      );

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
      logger.error('Update character mastery controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get user analytics
  async getUserAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { period, startDate, endDate } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await analyticsService.getUserAnalytics(
        userId,
        period as string || '30d',
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

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
      logger.error('Get user analytics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get leaderboard
  async getLeaderboard(req: Request, res: Response): Promise<void> {
    try {
      const { period } = req.params;
      const { limit, offset } = req.query;

      if (!period) {
        res.status(400).json({
          success: false,
          message: 'Period is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await leaderboardService.getLeaderboard(
        period as any,
        limit ? parseInt(limit as string, 10) : 100,
        offset ? parseInt(offset as string, 10) : 0
      );

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
      logger.error('Get leaderboard controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get user rank
  async getUserRank(req: Request, res: Response): Promise<void> {
    try {
      const { userId, period } = req.params;

      if (!userId || !period) {
        res.status(400).json({
          success: false,
          message: 'User ID and period are required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await leaderboardService.getUserRank(userId, period as any);

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
      logger.error('Get user rank controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get learning insights
  async getLearningInsights(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { period } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await analyticsService.generateLearningInsights(userId, period as string || '30d');

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
      logger.error('Get learning insights controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get progress metrics
  async getProgressMetrics(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await analyticsService.getProgressMetrics(userId);

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
      logger.error('Get progress metrics controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Freeze streak
  async freezeStreak(req: Request, res: Response): Promise<void> {
    try {
      const { userId, type } = req.body;

      if (!userId || !type) {
        res.status(400).json({
          success: false,
          message: 'User ID and streak type are required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await streakService.freezeStreak(userId, type);

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
      logger.error('Freeze streak controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get characters for review
  async getCharactersForReview(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterMasteryService.getCharactersForReview(
        userId,
        limit ? parseInt(limit as string, 10) : 20
      );

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
      logger.error('Get characters for review controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Get weak areas
  async getWeakAreas(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          error: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await characterMasteryService.getWeakAreas(
        userId,
        limit ? parseInt(limit as string, 10) : 10
      );

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
      logger.error('Get weak areas controller error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

// Export progress controller instance
export const progressController = new ProgressController();

// Export default
export default progressController;
