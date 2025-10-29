import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { config } from '../config';
import { 
  UserAnalytics, 
  UserAnalyticsInput,
  LearningInsights,
  ProgressMetrics
} from '../types';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import moment from 'moment';

export class AnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get user analytics
  async getUserAnalytics(userId: string, period: string = '30d', startDate?: Date, endDate?: Date): Promise<{ success: boolean; data?: UserAnalytics[]; message: string; error?: string }> {
    try {
      const cacheKey = `user_analytics:${userId}:${period}:${startDate?.toISOString() || 'none'}:${endDate?.toISOString() || 'none'}`;
      const cached = await cacheGet<UserAnalytics[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User analytics retrieved from cache'
        };
      }

      // Calculate date range
      let dateStart: Date;
      let dateEnd: Date;

      if (startDate && endDate) {
        dateStart = startDate;
        dateEnd = endDate;
      } else {
        const now = moment();
        switch (period) {
          case '7d':
            dateStart = now.subtract(7, 'days').toDate();
            dateEnd = now.toDate();
            break;
          case '30d':
            dateStart = now.subtract(30, 'days').toDate();
            dateEnd = now.toDate();
            break;
          case '90d':
            dateStart = now.subtract(90, 'days').toDate();
            dateEnd = now.toDate();
            break;
          case '1y':
            dateStart = now.subtract(1, 'year').toDate();
            dateEnd = now.toDate();
            break;
          default:
            dateStart = now.subtract(30, 'days').toDate();
            dateEnd = now.toDate();
        }
      }

      const analytics = await this.prisma.userAnalytics.findMany({
        where: {
          userId,
          date: {
            gte: dateStart,
            lte: dateEnd
          }
        },
        orderBy: { date: 'asc' }
      });

      // Cache the result
      await cacheSet(cacheKey, analytics, config.CACHE_TTL);

      return {
        success: true,
        data: analytics,
        message: 'User analytics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user analytics', { userId, period, error: error.message });
      return {
        success: false,
        message: 'Failed to get user analytics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Generate learning insights
  async generateLearningInsights(userId: string, period: string = '30d'): Promise<{ success: boolean; data?: LearningInsights; message: string; error?: string }> {
    try {
      const cacheKey = `learning_insights:${userId}:${period}`;
      const cached = await cacheGet<LearningInsights>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Learning insights retrieved from cache'
        };
      }

      // Get analytics data
      const analyticsResult = await this.getUserAnalytics(userId, period);
      if (!analyticsResult.success || !analyticsResult.data) {
        return {
          success: false,
          message: 'Failed to get analytics data',
          error: 'ANALYTICS_NOT_FOUND'
        };
      }

      const analytics = analyticsResult.data;

      // Get user progress
      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId },
        include: {
          characterMastery: true,
          xpTransactions: true
        }
      });

      if (!userProgress) {
        return {
          success: false,
          message: 'User progress not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Calculate insights
      const insights = this.calculateLearningInsights(analytics, userProgress, period);

      // Cache the result
      await cacheSet(cacheKey, insights, config.CACHE_TTL);

      return {
        success: true,
        data: insights,
        message: 'Learning insights generated successfully'
      };
    } catch (error) {
      logger.error('Failed to generate learning insights', { userId, period, error: error.message });
      return {
        success: false,
        message: 'Failed to generate learning insights',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate learning insights
  private calculateLearningInsights(analytics: UserAnalytics[], userProgress: any, period: string): LearningInsights {
    const totalStudyTime = analytics.reduce((sum, a) => sum + a.studyTimeMinutes, 0);
    const totalCharactersPracticed = analytics.reduce((sum, a) => sum + a.charactersPracticed, 0);
    const averageAccuracy = analytics.length > 0 ? analytics.reduce((sum, a) => sum + a.accuracyAverage, 0) / analytics.length : 0;
    const totalXpEarned = analytics.reduce((sum, a) => sum + a.xpEarned, 0);
    const totalAchievements = analytics.reduce((sum, a) => sum + a.achievementsUnlocked, 0);

    // Calculate accuracy trend
    const accuracyTrend = analytics.map(a => a.accuracyAverage);

    // Identify weak areas
    const weakAreas = this.identifyWeakAreas(userProgress.characterMastery);

    // Identify strong areas
    const strongAreas = this.identifyStrongAreas(userProgress.characterMastery);

    // Calculate improvement rate
    const improvementRate = this.calculateImprovementRate(analytics);

    // Generate predictions
    const predictions = this.generatePredictions(userProgress, analytics, period);

    return {
      userId: userProgress.userId,
      period,
      studyTime: totalStudyTime,
      charactersLearned: totalCharactersPracticed,
      accuracyTrend,
      weakAreas,
      strongAreas,
      improvementRate,
      predictions
    };
  }

  // Identify weak areas
  private identifyWeakAreas(characterMastery: any[]): string[] {
    const weakAreas = [];

    // Low accuracy characters
    const lowAccuracy = characterMastery.filter(m => m.accuracyScore < 70);
    if (lowAccuracy.length > 0) {
      weakAreas.push(`Low accuracy: ${lowAccuracy.length} characters`);
    }

    // Characters with few practices
    const fewPractices = characterMastery.filter(m => m.practiceCount < 3);
    if (fewPractices.length > 0) {
      weakAreas.push(`Insufficient practice: ${fewPractices.length} characters`);
    }

    // Characters due for review
    const dueForReview = characterMastery.filter(m => 
      m.nextReviewDate && new Date(m.nextReviewDate) <= new Date()
    );
    if (dueForReview.length > 0) {
      weakAreas.push(`Due for review: ${dueForReview.length} characters`);
    }

    // Low stroke order scores
    const lowStrokeOrder = characterMastery.filter(m => m.strokeOrderScore < 80);
    if (lowStrokeOrder.length > 0) {
      weakAreas.push(`Stroke order issues: ${lowStrokeOrder.length} characters`);
    }

    return weakAreas;
  }

  // Identify strong areas
  private identifyStrongAreas(characterMastery: any[]): string[] {
    const strongAreas = [];

    // High accuracy characters
    const highAccuracy = characterMastery.filter(m => m.accuracyScore >= 90);
    if (highAccuracy.length > 0) {
      strongAreas.push(`High accuracy: ${highAccuracy.length} characters`);
    }

    // Mastered characters
    const mastered = characterMastery.filter(m => m.masteryLevel === 'MASTERED' || m.masteryLevel === 'EXPERT');
    if (mastered.length > 0) {
      strongAreas.push(`Mastered: ${mastered.length} characters`);
    }

    // Consistent practice
    const consistentPractice = characterMastery.filter(m => m.practiceCount >= 10);
    if (consistentPractice.length > 0) {
      strongAreas.push(`Consistent practice: ${consistentPractice.length} characters`);
    }

    // Long streaks
    const longStreaks = characterMastery.filter(m => m.streakCount >= 5);
    if (longStreaks.length > 0) {
      strongAreas.push(`Long streaks: ${longStreaks.length} characters`);
    }

    return strongAreas;
  }

  // Calculate improvement rate
  private calculateImprovementRate(analytics: UserAnalytics[]): number {
    if (analytics.length < 2) return 0;

    const firstHalf = analytics.slice(0, Math.floor(analytics.length / 2));
    const secondHalf = analytics.slice(Math.floor(analytics.length / 2));

    const firstHalfAvg = firstHalf.reduce((sum, a) => sum + a.accuracyAverage, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, a) => sum + a.accuracyAverage, 0) / secondHalf.length;

    return secondHalfAvg - firstHalfAvg;
  }

  // Generate predictions
  private generatePredictions(userProgress: any, analytics: UserAnalytics[], period: string): any {
    const currentLevel = userProgress.currentLevel;
    const currentXp = userProgress.totalXp;
    const xpToNextLevel = userProgress.xpToNextLevel;

    // Calculate average daily XP
    const totalXp = analytics.reduce((sum, a) => sum + a.xpEarned, 0);
    const days = analytics.length || 1;
    const averageDailyXp = totalXp / days;

    // Predict next level date
    const daysToNextLevel = averageDailyXp > 0 ? Math.ceil(xpToNextLevel / averageDailyXp) : null;
    const nextLevelDate = daysToNextLevel ? moment().add(daysToNextLevel, 'days').toDate() : null;

    // Predict mastery projection
    const totalCharacters = userProgress.characterMastery.length;
    const masteredCharacters = userProgress.characterMastery.filter((m: any) => m.masteryLevel === 'MASTERED' || m.masteryLevel === 'EXPERT').length;
    const masteryRate = totalCharacters > 0 ? masteredCharacters / totalCharacters : 0;
    const projectedMastery = Math.min(100, masteryRate * 100 + (averageDailyXp * 0.1));

    // Recommend focus areas
    const recommendedFocus = this.getRecommendedFocus(userProgress.characterMastery);

    return {
      nextLevelDate,
      masteryProjection: projectedMastery,
      recommendedFocus
    };
  }

  // Get recommended focus areas
  private getRecommendedFocus(characterMastery: any[]): string[] {
    const recommendations = [];

    // Characters with low accuracy
    const lowAccuracy = characterMastery.filter(m => m.accuracyScore < 70);
    if (lowAccuracy.length > 0) {
      recommendations.push('Focus on characters with low accuracy scores');
    }

    // Characters due for review
    const dueForReview = characterMastery.filter(m => 
      m.nextReviewDate && new Date(m.nextReviewDate) <= new Date()
    );
    if (dueForReview.length > 0) {
      recommendations.push('Review characters that are due for practice');
    }

    // Characters with few practices
    const fewPractices = characterMastery.filter(m => m.practiceCount < 3);
    if (fewPractices.length > 0) {
      recommendations.push('Practice characters you haven\'t worked on much');
    }

    // Stroke order issues
    const strokeOrderIssues = characterMastery.filter(m => m.strokeOrderScore < 80);
    if (strokeOrderIssues.length > 0) {
      recommendations.push('Improve stroke order for characters with low scores');
    }

    return recommendations;
  }

  // Get progress metrics
  async getProgressMetrics(userId: string): Promise<{ success: boolean; data?: ProgressMetrics; message: string; error?: string }> {
    try {
      const cacheKey = `progress_metrics:${userId}`;
      const cached = await cacheGet<ProgressMetrics>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Progress metrics retrieved from cache'
        };
      }

      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId },
        include: {
          characterMastery: true,
          achievements: true,
          streaks: true
        }
      });

      if (!userProgress) {
        return {
          success: false,
          message: 'User progress not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Get recent analytics
      const recentAnalytics = await this.getUserAnalytics(userId, '7d');
      const weeklyData = recentAnalytics.data || [];

      // Calculate metrics
      const metrics = this.calculateProgressMetrics(userProgress, weeklyData);

      // Cache the result
      await cacheSet(cacheKey, metrics, config.CACHE_TTL);

      return {
        success: true,
        data: metrics,
        message: 'Progress metrics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get progress metrics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get progress metrics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate progress metrics
  private calculateProgressMetrics(userProgress: any, weeklyData: UserAnalytics[]): ProgressMetrics {
    const currentLevel = userProgress.currentLevel;
    const totalXp = userProgress.totalXp;
    const xpToNextLevel = userProgress.xpToNextLevel;
    const levelProgress = xpToNextLevel > 0 ? ((totalXp % 100) / 100) * 100 : 100;

    // Weekly goals and progress
    const weeklyGoal = 1000; // Default weekly XP goal
    const weeklyProgress = weeklyData.reduce((sum, a) => sum + a.xpEarned, 0);
    const weeklyProgressPercent = (weeklyProgress / weeklyGoal) * 100;

    // Monthly goals and progress
    const monthlyGoal = 5000; // Default monthly XP goal
    const monthlyProgress = totalXp; // This would need to be calculated from monthly data
    const monthlyProgressPercent = (monthlyProgress / monthlyGoal) * 100;

    // Achievements
    const achievementsUnlocked = userProgress.achievements.filter((a: any) => a.isUnlocked).length;
    const totalAchievements = userProgress.achievements.length;

    // Streaks
    const streakCount = userProgress.streakCount;

    // Rank and percentile (simplified)
    const rank = 1; // This would need to be calculated from leaderboard
    const percentile = 95; // This would need to be calculated from user distribution

    return {
      userId: userProgress.userId,
      currentLevel,
      levelProgress,
      streakCount,
      weeklyGoal,
      weeklyProgress,
      monthlyGoal,
      monthlyProgress,
      achievementsUnlocked,
      totalAchievements,
      rank,
      percentile
    };
  }

  // Create analytics entry
  async createAnalyticsEntry(userId: string, analyticsData: UserAnalyticsInput): Promise<{ success: boolean; data?: UserAnalytics; message: string; error?: string }> {
    try {
      const analytics = await this.prisma.userAnalytics.upsert({
        where: {
          userId_date: {
            userId,
            date: analyticsData.date || new Date()
          }
        },
        update: analyticsData,
        create: {
          userId,
          ...analyticsData
        }
      });

      // Clear cache
      await cacheDel(`user_analytics:${userId}:*`);
      await cacheDel(`learning_insights:${userId}:*`);
      await cacheDel(`progress_metrics:${userId}`);

      logger.info('Analytics entry created successfully', { userId, analyticsId: analytics.id });

      return {
        success: true,
        data: analytics,
        message: 'Analytics entry created successfully'
      };
    } catch (error) {
      logger.error('Failed to create analytics entry', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to create analytics entry',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get analytics statistics
  async getAnalyticsStatistics(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [totalDays, averageStudyTime, averageAccuracy, totalXp, improvementTrend] = await Promise.all([
        // Total days with activity
        this.prisma.userAnalytics.count({
          where: { userId }
        }),

        // Average study time
        this.prisma.userAnalytics.aggregate({
          where: { userId },
          _avg: { studyTimeMinutes: true }
        }),

        // Average accuracy
        this.prisma.userAnalytics.aggregate({
          where: { userId },
          _avg: { accuracyAverage: true }
        }),

        // Total XP earned
        this.prisma.userAnalytics.aggregate({
          where: { userId },
          _sum: { xpEarned: true }
        }),

        // Improvement trend (last 30 days vs previous 30 days)
        this.getImprovementTrend(userId)
      ]);

      return {
        success: true,
        data: {
          totalDays: totalDays,
          averageStudyTime: averageStudyTime._avg.studyTimeMinutes || 0,
          averageAccuracy: averageAccuracy._avg.accuracyAverage || 0,
          totalXp: totalXp._sum.xpEarned || 0,
          improvementTrend
        },
        message: 'Analytics statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get analytics statistics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get analytics statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get improvement trend
  private async getImprovementTrend(userId: string): Promise<number> {
    try {
      const now = moment();
      const last30Days = now.clone().subtract(30, 'days');
      const previous30Days = now.clone().subtract(60, 'days');

      const [recentAnalytics, previousAnalytics] = await Promise.all([
        this.prisma.userAnalytics.findMany({
          where: {
            userId,
            date: {
              gte: last30Days.toDate(),
              lte: now.toDate()
            }
          }
        }),
        this.prisma.userAnalytics.findMany({
          where: {
            userId,
            date: {
              gte: previous30Days.toDate(),
              lt: last30Days.toDate()
            }
          }
        })
      ]);

      const recentAvg = recentAnalytics.length > 0 ? 
        recentAnalytics.reduce((sum, a) => sum + a.accuracyAverage, 0) / recentAnalytics.length : 0;
      
      const previousAvg = previousAnalytics.length > 0 ? 
        previousAnalytics.reduce((sum, a) => sum + a.accuracyAverage, 0) / previousAnalytics.length : 0;

      return recentAvg - previousAvg;
    } catch (error) {
      logger.error('Failed to calculate improvement trend', { userId, error: error.message });
      return 0;
    }
  }

  // Clean up old analytics data
  async cleanupOldAnalytics(): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const cutoffDate = moment().subtract(config.ANALYTICS_RETENTION_DAYS, 'days').toDate();

      const deletedCount = await this.prisma.userAnalytics.deleteMany({
        where: {
          date: {
            lt: cutoffDate
          }
        }
      });

      logger.info('Old analytics data cleaned up', { deletedCount: deletedCount.count });

      return {
        success: true,
        data: { deletedCount: deletedCount.count },
        message: 'Old analytics data cleaned up successfully'
      };
    } catch (error) {
      logger.error('Failed to cleanup old analytics data', { error: error.message });
      return {
        success: false,
        message: 'Failed to cleanup old analytics data',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService(require('../config/database').default);
