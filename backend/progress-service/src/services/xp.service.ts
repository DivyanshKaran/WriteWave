import { PrismaClient } from '@prisma/client';
import { logger } from '@/config/logger';
import { config } from '@/config';
import { 
  XpTransaction, 
  XpTransactionInput, 
  XpSource, 
  XpCalculation,
  LevelInfo,
  UserProgress
} from '@/types';
import { cacheGet, cacheSet, cacheDel } from '@/config/redis';

export class XpService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Calculate XP for different activities
  calculateXp(source: XpSource, metadata?: any): XpCalculation {
    let baseXp = 0;
    let description = '';

    switch (source) {
      case XpSource.CHARACTER_PRACTICE:
        baseXp = 10;
        description = 'Character practice completed';
        break;
      case XpSource.PERFECT_STROKE:
        baseXp = 20;
        description = 'Perfect stroke achieved';
        break;
      case XpSource.DAILY_STREAK:
        baseXp = 50;
        description = 'Daily streak maintained';
        break;
      case XpSource.ACHIEVEMENT_UNLOCK:
        baseXp = metadata?.xpReward || 100;
        description = `Achievement unlocked: ${metadata?.name || 'Unknown'}`;
        break;
      case XpSource.LESSON_COMPLETION:
        baseXp = 30;
        description = 'Lesson completed';
        break;
      case XpSource.VOCABULARY_LEARNED:
        baseXp = 15;
        description = 'Vocabulary word learned';
        break;
      case XpSource.STREAK_MILESTONE:
        baseXp = metadata?.streakCount * 10 || 100;
        description = `Streak milestone: ${metadata?.streakCount || 0} days`;
        break;
      case XpSource.PERFECT_SCORE:
        baseXp = 25;
        description = 'Perfect score achieved';
        break;
      case XpSource.DAILY_LOGIN:
        baseXp = 5;
        description = 'Daily login bonus';
        break;
      case XpSource.WEEKLY_CHALLENGE:
        baseXp = 200;
        description = 'Weekly challenge completed';
        break;
      case XpSource.MONTHLY_CHALLENGE:
        baseXp = 500;
        description = 'Monthly challenge completed';
        break;
      case XpSource.SOCIAL_SHARE:
        baseXp = 10;
        description = 'Achievement shared';
        break;
      case XpSource.REVIEW_SESSION:
        baseXp = 15;
        description = 'Review session completed';
        break;
      case XpSource.MISTAKE_CORRECTION:
        baseXp = 5;
        description = 'Mistake corrected';
        break;
      case XpSource.SPEED_CHALLENGE:
        baseXp = 40;
        description = 'Speed challenge completed';
        break;
      default:
        baseXp = 10;
        description = 'Activity completed';
    }

    // Apply multipliers
    let multiplier = config.XP_BASE_MULTIPLIER;
    
    if (metadata?.streakMultiplier) {
      multiplier *= config.XP_STREAK_MULTIPLIER;
    }
    
    if (metadata?.achievementMultiplier) {
      multiplier *= config.XP_ACHIEVEMENT_MULTIPLIER;
    }

    const bonusXp = Math.floor(baseXp * (multiplier - 1));
    const totalXp = Math.floor(baseXp * multiplier);

    return {
      baseXp,
      multiplier,
      bonusXp,
      totalXp,
      source,
      description
    };
  }

  // Add XP to user
  async addXp(userId: string, source: XpSource, metadata?: any): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const xpCalculation = this.calculateXp(source, metadata);
      
      // Get current user progress
      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId }
      });

      if (!userProgress) {
        return {
          success: false,
          message: 'User progress not found',
          error: 'USER_NOT_FOUND'
        };
      }

      // Create XP transaction
      const xpTransaction = await this.prisma.xpTransaction.create({
        data: {
          userId,
          amount: xpCalculation.totalXp,
          source: xpCalculation.source,
          description: xpCalculation.description,
          metadata: metadata || {}
        }
      });

      // Update user progress
      const newTotalXp = userProgress.totalXp + xpCalculation.totalXp;
      const newCurrentXp = userProgress.currentXp + xpCalculation.totalXp;

      // Check for level up
      const levelInfo = await this.calculateLevel(newTotalXp);
      const leveledUp = levelInfo.level > userProgress.currentLevel;

      const updatedProgress = await this.prisma.userProgress.update({
        where: { userId },
        data: {
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          currentLevel: levelInfo.level,
          levelName: levelInfo.name,
          xpToNextLevel: levelInfo.xpToNext,
          lastActivityDate: new Date()
        }
      });

      // Clear cache
      await cacheDel(`user_progress:${userId}`);
      await cacheDel(`user_level:${userId}`);

      logger.info('XP added successfully', {
        userId,
        amount: xpCalculation.totalXp,
        source: xpCalculation.source,
        newLevel: levelInfo.level,
        leveledUp
      });

      return {
        success: true,
        data: {
          xpTransaction,
          userProgress: updatedProgress,
          levelInfo,
          leveledUp,
          xpCalculation
        },
        message: 'XP added successfully'
      };
    } catch (error) {
      logger.error('Failed to add XP', { userId, source, error: error.message });
      return {
        success: false,
        message: 'Failed to add XP',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate level from total XP
  async calculateLevel(totalXp: number): Promise<LevelInfo> {
    let level = 1;
    let xpRequired = 0;
    let xpToNext = 0;

    // Calculate level based on XP
    while (xpRequired <= totalXp) {
      level++;
      xpRequired += Math.floor(config.LEVEL_UP_XP_BASE * Math.pow(config.LEVEL_UP_XP_MULTIPLIER, level - 2));
    }

    level--; // Adjust for the last increment

    // Calculate XP required for current level
    let currentLevelXp = 0;
    for (let i = 1; i < level; i++) {
      currentLevelXp += Math.floor(config.LEVEL_UP_XP_BASE * Math.pow(config.LEVEL_UP_XP_MULTIPLIER, i - 1));
    }

    // Calculate XP to next level
    const nextLevelXp = currentLevelXp + Math.floor(config.LEVEL_UP_XP_BASE * Math.pow(config.LEVEL_UP_XP_MULTIPLIER, level - 1));
    xpToNext = nextLevelXp - totalXp;

    // Determine level name
    let levelName = 'Bronze';
    if (level >= 20) levelName = 'Platinum';
    else if (level >= 15) levelName = 'Gold';
    else if (level >= 10) levelName = 'Silver';

    // Calculate multiplier
    const multiplier = 1 + (level - 1) * 0.1;

    // Generate rewards
    const rewards = this.generateLevelRewards(level);

    return {
      level,
      name: levelName,
      xpRequired: currentLevelXp,
      xpToNext,
      totalXp,
      multiplier,
      rewards
    };
  }

  // Generate rewards for level
  private generateLevelRewards(level: number): string[] {
    const rewards: string[] = [];

    if (level % 5 === 0) {
      rewards.push('Achievement Badge');
    }

    if (level % 10 === 0) {
      rewards.push('Special Avatar');
    }

    if (level % 20 === 0) {
      rewards.push('Exclusive Theme');
    }

    if (level % 50 === 0) {
      rewards.push('Legendary Title');
    }

    return rewards;
  }

  // Get user level info
  async getUserLevel(userId: string): Promise<{ success: boolean; data?: LevelInfo; message: string; error?: string }> {
    try {
      // Check cache first
      const cacheKey = `user_level:${userId}`;
      const cached = await cacheGet<LevelInfo>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User level retrieved from cache'
        };
      }

      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId }
      });

      if (!userProgress) {
        return {
          success: false,
          message: 'User progress not found',
          error: 'USER_NOT_FOUND'
        };
      }

      const levelInfo = await this.calculateLevel(userProgress.totalXp);

      // Cache the result
      await cacheSet(cacheKey, levelInfo, config.CACHE_TTL);

      return {
        success: true,
        data: levelInfo,
        message: 'User level retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user level', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get user level',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get XP transaction history
  async getXpHistory(userId: string, page: number = 1, limit: number = 20): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const skip = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        this.prisma.xpTransaction.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        this.prisma.xpTransaction.count({
          where: { userId }
        })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          transactions,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        },
        message: 'XP history retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get XP history', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get XP history',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get XP statistics
  async getXpStatistics(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [totalXp, todayXp, weekXp, monthXp, sourceStats] = await Promise.all([
        // Total XP
        this.prisma.xpTransaction.aggregate({
          where: { userId },
          _sum: { amount: true }
        }),

        // Today's XP
        this.prisma.xpTransaction.aggregate({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          _sum: { amount: true }
        }),

        // This week's XP
        this.prisma.xpTransaction.aggregate({
          where: {
            userId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          _sum: { amount: true }
        }),

        // This month's XP
        this.prisma.xpTransaction.aggregate({
          where: {
            userId,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { amount: true }
        }),

        // XP by source
        this.prisma.xpTransaction.groupBy({
          by: ['source'],
          where: { userId },
          _sum: { amount: true },
          _count: { id: true }
        })
      ]);

      return {
        success: true,
        data: {
          totalXp: totalXp._sum.amount || 0,
          todayXp: todayXp._sum.amount || 0,
          weekXp: weekXp._sum.amount || 0,
          monthXp: monthXp._sum.amount || 0,
          sourceStats: sourceStats.map(stat => ({
            source: stat.source,
            totalXp: stat._sum.amount || 0,
            count: stat._count.id
          }))
        },
        message: 'XP statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get XP statistics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get XP statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Reset user XP (admin only)
  async resetUserXp(userId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      await this.prisma.$transaction(async (tx) => {
        // Delete all XP transactions
        await tx.xpTransaction.deleteMany({
          where: { userId }
        });

        // Reset user progress
        await tx.userProgress.update({
          where: { userId },
          data: {
            totalXp: 0,
            currentXp: 0,
            currentLevel: 1,
            levelName: 'Bronze',
            xpToNextLevel: 100
          }
        });
      });

      // Clear cache
      await cacheDel(`user_progress:${userId}`);
      await cacheDel(`user_level:${userId}`);

      logger.info('User XP reset successfully', { userId });

      return {
        success: true,
        message: 'User XP reset successfully'
      };
    } catch (error) {
      logger.error('Failed to reset user XP', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to reset user XP',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

// Export singleton instance
export const xpService = new XpService(require('@/config/database').default);
