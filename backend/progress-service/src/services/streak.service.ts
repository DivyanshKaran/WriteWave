import { PrismaClient } from '@prisma/client';
import { logger } from '@/config/logger';
import { config } from '@/config';
import { 
  Streak, 
  StreakInput, 
  StreakType
} from '@/types';
import { cacheGet, cacheSet, cacheDel } from '@/config/redis';
import moment from 'moment';

export class StreakService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get user streaks
  async getUserStreaks(userId: string, type?: StreakType): Promise<{ success: boolean; data?: Streak[]; message: string; error?: string }> {
    try {
      const cacheKey = `user_streaks:${userId}:${type || 'all'}`;
      const cached = await cacheGet<Streak[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User streaks retrieved from cache'
        };
      }

      const whereClause: any = { userId, isActive: true };
      if (type) {
        whereClause.type = type;
      }

      const streaks = await this.prisma.streak.findMany({
        where: whereClause,
        orderBy: { type: 'asc' }
      });

      // Cache the result
      await cacheSet(cacheKey, streaks, config.CACHE_TTL);

      return {
        success: true,
        data: streaks,
        message: 'User streaks retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user streaks', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get user streaks',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update streak
  async updateStreak(userId: string, type: StreakType, activityDate?: Date): Promise<{ success: boolean; data?: Streak; message: string; error?: string }> {
    try {
      const now = activityDate || new Date();
      const today = moment(now).startOf('day');
      
      const result = await this.prisma.$transaction(async (tx) => {
        // Get or create streak
        let streak = await tx.streak.findUnique({
          where: {
            userId_type: {
              userId,
              type
            }
          }
        });

        if (!streak) {
          // Create new streak
          streak = await tx.streak.create({
            data: {
              userId,
              type,
              currentCount: 1,
              longestCount: 1,
              lastActivity: now,
              freezeCount: 0,
              isActive: true
            }
          });
        } else {
          // Update existing streak
          const lastActivity = streak.lastActivity ? moment(streak.lastActivity).startOf('day') : null;
          const daysDiff = lastActivity ? today.diff(lastActivity, 'days') : 1;

          let newCurrentCount = streak.currentCount;
          let newLongestCount = streak.longestCount;

          if (daysDiff === 1) {
            // Consecutive day - increment streak
            newCurrentCount = streak.currentCount + 1;
            newLongestCount = Math.max(streak.longestCount, newCurrentCount);
          } else if (daysDiff === 0) {
            // Same day - no change
            newCurrentCount = streak.currentCount;
          } else if (daysDiff <= streak.freezeCount + 1) {
            // Within freeze limit - maintain streak
            newCurrentCount = streak.currentCount;
            // Reduce freeze count
            const newFreezeCount = Math.max(0, streak.freezeCount - (daysDiff - 1));
            await tx.streak.update({
              where: { id: streak.id },
              data: { freezeCount: newFreezeCount }
            });
          } else {
            // Streak broken - reset
            newCurrentCount = 1;
          }

          streak = await tx.streak.update({
            where: { id: streak.id },
            data: {
              currentCount: newCurrentCount,
              longestCount: newLongestCount,
              lastActivity: now
            }
          });
        }

        return streak;
      });

      // Clear cache
      await cacheDel(`user_streaks:${userId}:all`);
      await cacheDel(`user_streaks:${userId}:${type}`);

      logger.info('Streak updated successfully', {
        userId,
        type,
        currentCount: result.currentCount,
        longestCount: result.longestCount
      });

      return {
        success: true,
        data: result,
        message: 'Streak updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update streak', { userId, type, error: error.message });
      return {
        success: false,
        message: 'Failed to update streak',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Freeze streak
  async freezeStreak(userId: string, type: StreakType): Promise<{ success: boolean; data?: Streak; message: string; error?: string }> {
    try {
      const streak = await this.prisma.streak.findUnique({
        where: {
          userId_type: {
            userId,
            type
          }
        }
      });

      if (!streak) {
        return {
          success: false,
          message: 'Streak not found',
          error: 'STREAK_NOT_FOUND'
        };
      }

      if (streak.freezeCount >= config.STREAK_FREEZE_LIMIT) {
        return {
          success: false,
          message: 'Streak freeze limit reached',
          error: 'FREEZE_LIMIT_REACHED'
        };
      }

      const updatedStreak = await this.prisma.streak.update({
        where: { id: streak.id },
        data: {
          freezeCount: streak.freezeCount + 1
        }
      });

      // Clear cache
      await cacheDel(`user_streaks:${userId}:all`);
      await cacheDel(`user_streaks:${userId}:${type}`);

      logger.info('Streak frozen successfully', {
        userId,
        type,
        freezeCount: updatedStreak.freezeCount
      });

      return {
        success: true,
        data: updatedStreak,
        message: 'Streak frozen successfully'
      };
    } catch (error) {
      logger.error('Failed to freeze streak', { userId, type, error: error.message });
      return {
        success: false,
        message: 'Failed to freeze streak',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get streak milestones
  async getStreakMilestones(userId: string, type: StreakType): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const streak = await this.prisma.streak.findUnique({
        where: {
          userId_type: {
            userId,
            type
          }
        }
      });

      if (!streak) {
        return {
          success: false,
          message: 'Streak not found',
          error: 'STREAK_NOT_FOUND'
        };
      }

      const milestones = this.calculateStreakMilestones(streak.currentCount, type);
      const nextMilestone = this.getNextMilestone(streak.currentCount, type);

      return {
        success: true,
        data: {
          currentStreak: streak.currentCount,
          longestStreak: streak.longestCount,
          milestones,
          nextMilestone,
          freezeCount: streak.freezeCount,
          freezeLimit: config.STREAK_FREEZE_LIMIT
        },
        message: 'Streak milestones retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get streak milestones', { userId, type, error: error.message });
      return {
        success: false,
        message: 'Failed to get streak milestones',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate streak milestones
  private calculateStreakMilestones(currentCount: number, type: StreakType): any[] {
    const milestones = [];
    const milestoneDays = [3, 7, 14, 30, 60, 100, 200, 365];

    for (const days of milestoneDays) {
      if (currentCount >= days) {
        milestones.push({
          days,
          achieved: true,
          achievedAt: this.calculateMilestoneDate(days, currentCount),
          reward: this.getMilestoneReward(days, type)
        });
      } else {
        milestones.push({
          days,
          achieved: false,
          progress: (currentCount / days) * 100,
          reward: this.getMilestoneReward(days, type)
        });
      }
    }

    return milestones;
  }

  // Get next milestone
  private getNextMilestone(currentCount: number, type: StreakType): any {
    const milestoneDays = [3, 7, 14, 30, 60, 100, 200, 365];
    const nextMilestone = milestoneDays.find(days => days > currentCount);

    if (!nextMilestone) {
      return null;
    }

    return {
      days: nextMilestone,
      daysRemaining: nextMilestone - currentCount,
      progress: (currentCount / nextMilestone) * 100,
      reward: this.getMilestoneReward(nextMilestone, type)
    };
  }

  // Calculate milestone date
  private calculateMilestoneDate(milestoneDays: number, currentCount: number): Date {
    const daysAgo = currentCount - milestoneDays;
    return moment().subtract(daysAgo, 'days').toDate();
  }

  // Get milestone reward
  private getMilestoneReward(days: number, type: StreakType): any {
    const rewards = {
      [StreakType.DAILY_LOGIN]: {
        3: { xp: 50, badge: 'Early Bird' },
        7: { xp: 100, badge: 'Week Warrior' },
        14: { xp: 200, badge: 'Fortnight Fighter' },
        30: { xp: 500, badge: 'Monthly Master' },
        60: { xp: 1000, badge: 'Bi-Monthly Boss' },
        100: { xp: 2000, badge: 'Century Champion' },
        200: { xp: 5000, badge: 'Double Century' },
        365: { xp: 10000, badge: 'Yearly Legend' }
      },
      [StreakType.DAILY_PRACTICE]: {
        3: { xp: 75, badge: 'Practice Starter' },
        7: { xp: 150, badge: 'Weekly Worker' },
        14: { xp: 300, badge: 'Fortnight Focus' },
        30: { xp: 750, badge: 'Monthly Master' },
        60: { xp: 1500, badge: 'Bi-Monthly Boss' },
        100: { xp: 3000, badge: 'Century Champion' },
        200: { xp: 7500, badge: 'Double Century' },
        365: { xp: 15000, badge: 'Yearly Legend' }
      },
      [StreakType.PERFECT_SCORE]: {
        3: { xp: 100, badge: 'Perfect Start' },
        7: { xp: 200, badge: 'Perfect Week' },
        14: { xp: 400, badge: 'Perfect Fortnight' },
        30: { xp: 1000, badge: 'Perfect Month' },
        60: { xp: 2000, badge: 'Perfect Bi-Month' },
        100: { xp: 4000, badge: 'Perfect Century' },
        200: { xp: 10000, badge: 'Perfect Double' },
        365: { xp: 20000, badge: 'Perfect Year' }
      }
    };

    return rewards[type]?.[days] || { xp: 0, badge: 'Unknown' };
  }

  // Get streak statistics
  async getStreakStatistics(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [streaks, totalDays, averageStreak, longestStreak] = await Promise.all([
        // All streaks
        this.prisma.streak.findMany({
          where: { userId, isActive: true }
        }),

        // Total days with activity
        this.prisma.userProgress.findUnique({
          where: { userId },
          select: { totalStudyTime: true }
        }),

        // Average streak length
        this.prisma.streak.aggregate({
          where: { userId, isActive: true },
          _avg: { currentCount: true }
        }),

        // Longest streak
        this.prisma.streak.aggregate({
          where: { userId, isActive: true },
          _max: { longestCount: true }
        })
      ]);

      const streakBreakdown = streaks.reduce((acc: any, streak) => {
        acc[streak.type] = {
          current: streak.currentCount,
          longest: streak.longestCount,
          freezeCount: streak.freezeCount
        };
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalStreaks: streaks.length,
          totalDays: totalDays?.totalStudyTime || 0,
          averageStreak: averageStreak._avg.currentCount || 0,
          longestStreak: longestStreak._max.longestCount || 0,
          streakBreakdown
        },
        message: 'Streak statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get streak statistics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get streak statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Reset streak (admin only)
  async resetStreak(userId: string, type: StreakType): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      await this.prisma.streak.deleteMany({
        where: {
          userId,
          type
        }
      });

      // Clear cache
      await cacheDel(`user_streaks:${userId}:all`);
      await cacheDel(`user_streaks:${userId}:${type}`);

      logger.info('Streak reset successfully', { userId, type });

      return {
        success: true,
        message: 'Streak reset successfully'
      };
    } catch (error) {
      logger.error('Failed to reset streak', { userId, type, error: error.message });
      return {
        success: false,
        message: 'Failed to reset streak',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Check and update daily streaks
  async checkDailyStreaks(): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const yesterday = moment().subtract(1, 'day').startOf('day');
      const today = moment().startOf('day');

      // Get all active streaks
      const streaks = await this.prisma.streak.findMany({
        where: { isActive: true }
      });

      const updatedStreaks = [];
      const brokenStreaks = [];

      for (const streak of streaks) {
        const lastActivity = streak.lastActivity ? moment(streak.lastActivity).startOf('day') : null;
        const daysDiff = lastActivity ? today.diff(lastActivity, 'days') : 1;

        if (daysDiff > 1 && daysDiff > streak.freezeCount + 1) {
          // Streak broken
          brokenStreaks.push(streak);
          
          await this.prisma.streak.update({
            where: { id: streak.id },
            data: {
              currentCount: 0,
              isActive: false
            }
          });
        } else if (daysDiff === 1) {
          // Streak continues
          updatedStreaks.push(streak);
        }
      }

      logger.info('Daily streaks checked', {
        totalStreaks: streaks.length,
        updatedStreaks: updatedStreaks.length,
        brokenStreaks: brokenStreaks.length
      });

      return {
        success: true,
        data: {
          totalStreaks: streaks.length,
          updatedStreaks: updatedStreaks.length,
          brokenStreaks: brokenStreaks.length
        },
        message: 'Daily streaks checked successfully'
      };
    } catch (error) {
      logger.error('Failed to check daily streaks', { error: error.message });
      return {
        success: false,
        message: 'Failed to check daily streaks',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

// Export singleton instance
export const streakService = new StreakService(require('@/config/database').default);
