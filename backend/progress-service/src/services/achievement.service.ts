import { PrismaClient } from '@prisma/client';
import { logger } from '@/config/logger';
import { config } from '@/config';
import { 
  Achievement, 
  AchievementInput, 
  UserAchievement, 
  UserAchievementInput,
  AchievementCategory,
  AchievementRarity
} from '@/types';
import { cacheGet, cacheSet, cacheDel } from '@/config/redis';

export class AchievementService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get all achievements
  async getAllAchievements(): Promise<{ success: boolean; data?: Achievement[]; message: string; error?: string }> {
    try {
      const cacheKey = 'all_achievements';
      const cached = await cacheGet<Achievement[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Achievements retrieved from cache'
        };
      }

      const achievements = await this.prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: [
          { category: 'asc' },
          { rarity: 'asc' },
          { name: 'asc' }
        ]
      });

      // Cache the result
      await cacheSet(cacheKey, achievements, config.CACHE_TTL);

      return {
        success: true,
        data: achievements,
        message: 'Achievements retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get all achievements', { error: error.message });
      return {
        success: false,
        message: 'Failed to get all achievements',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get achievement by ID
  async getAchievementById(achievementId: string): Promise<{ success: boolean; data?: Achievement; message: string; error?: string }> {
    try {
      const achievement = await this.prisma.achievement.findUnique({
        where: { id: achievementId }
      });

      if (!achievement) {
        return {
          success: false,
          message: 'Achievement not found',
          error: 'ACHIEVEMENT_NOT_FOUND'
        };
      }

      return {
        success: true,
        data: achievement,
        message: 'Achievement retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get achievement by ID', { achievementId, error: error.message });
      return {
        success: false,
        message: 'Failed to get achievement by ID',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get user achievements
  async getUserAchievements(userId: string, category?: AchievementCategory, rarity?: AchievementRarity, unlocked?: boolean): Promise<{ success: boolean; data?: UserAchievement[]; message: string; error?: string }> {
    try {
      const cacheKey = `user_achievements:${userId}:${category || 'all'}:${rarity || 'all'}:${unlocked !== undefined ? unlocked.toString() : 'all'}`;
      const cached = await cacheGet<UserAchievement[]>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User achievements retrieved from cache'
        };
      }

      const whereClause: any = { userId };
      if (unlocked !== undefined) {
        whereClause.isUnlocked = unlocked;
      }

      const userAchievements = await this.prisma.userAchievement.findMany({
        where: whereClause,
        include: {
          achievement: {
            where: {
              isActive: true,
              ...(category && { category }),
              ...(rarity && { rarity })
            }
          }
        },
        orderBy: [
          { isUnlocked: 'desc' },
          { unlockedAt: 'desc' },
          { createdAt: 'asc' }
        ]
      });

      // Filter out achievements that don't match the criteria
      const filteredAchievements = userAchievements.filter(ua => ua.achievement);

      // Cache the result
      await cacheSet(cacheKey, filteredAchievements, config.CACHE_TTL);

      return {
        success: true,
        data: filteredAchievements,
        message: 'User achievements retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user achievements', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get user achievements',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Check and unlock achievements
  async checkAndUnlockAchievements(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const unlockedAchievements = [];

      // Get all active achievements
      const achievements = await this.prisma.achievement.findMany({
        where: { isActive: true }
      });

      // Get user's current progress
      const userProgress = await this.prisma.userProgress.findUnique({
        where: { userId },
        include: {
          characterMastery: true,
          xpTransactions: true,
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

      // Check each achievement
      for (const achievement of achievements) {
        // Check if already unlocked
        const existingUserAchievement = await this.prisma.userAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: achievement.id
            }
          }
        });

        if (existingUserAchievement?.isUnlocked) {
          continue;
        }

        // Check unlock condition
        const isUnlocked = await this.checkUnlockCondition(achievement, userProgress);

        if (isUnlocked) {
          // Unlock the achievement
          const userAchievement = await this.prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: achievement.id
              }
            },
            update: {
              isUnlocked: true,
              unlockedAt: new Date()
            },
            create: {
              userId,
              achievementId: achievement.id,
              progress: {},
              isUnlocked: true,
              unlockedAt: new Date()
            }
          });

          // Award XP if specified
          if (achievement.xpReward > 0) {
            // This would typically call the XP service
            // For now, we'll just log it
            logger.info('Achievement XP reward', {
              userId,
              achievementId: achievement.id,
              xpReward: achievement.xpReward
            });
          }

          unlockedAchievements.push({
            achievement,
            userAchievement
          });

          logger.info('Achievement unlocked', {
            userId,
            achievementId: achievement.id,
            achievementName: achievement.name
          });
        }
      }

      // Clear cache
      await cacheDel(`user_achievements:${userId}:all:all:all`);
      await cacheDel(`user_achievements:${userId}:all:all:true`);

      return {
        success: true,
        data: {
          unlockedAchievements,
          count: unlockedAchievements.length
        },
        message: `${unlockedAchievements.length} achievements unlocked`
      };
    } catch (error) {
      logger.error('Failed to check and unlock achievements', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to check and unlock achievements',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Check unlock condition for an achievement
  private async checkUnlockCondition(achievement: Achievement, userProgress: any): Promise<boolean> {
    try {
      const condition = achievement.unlockCondition;

      switch (achievement.category) {
        case AchievementCategory.LEARNING:
          return this.checkLearningCondition(condition, userProgress);
        case AchievementCategory.PRACTICE:
          return this.checkPracticeCondition(condition, userProgress);
        case AchievementCategory.STREAK:
          return this.checkStreakCondition(condition, userProgress);
        case AchievementCategory.MASTERY:
          return this.checkMasteryCondition(condition, userProgress);
        case AchievementCategory.SOCIAL:
          return this.checkSocialCondition(condition, userProgress);
        case AchievementCategory.SPECIAL:
          return this.checkSpecialCondition(condition, userProgress);
        case AchievementCategory.MILESTONE:
          return this.checkMilestoneCondition(condition, userProgress);
        case AchievementCategory.CHALLENGE:
          return this.checkChallengeCondition(condition, userProgress);
        default:
          return false;
      }
    } catch (error) {
      logger.error('Failed to check unlock condition', { achievementId: achievement.id, error: error.message });
      return false;
    }
  }

  // Check learning condition
  private checkLearningCondition(condition: any, userProgress: any): boolean {
    if (condition.charactersLearned && userProgress.charactersLearned < condition.charactersLearned) {
      return false;
    }
    if (condition.charactersMastered && userProgress.charactersMastered < condition.charactersMastered) {
      return false;
    }
    if (condition.totalXp && userProgress.totalXp < condition.totalXp) {
      return false;
    }
    if (condition.level && userProgress.currentLevel < condition.level) {
      return false;
    }
    return true;
  }

  // Check practice condition
  private checkPracticeCondition(condition: any, userProgress: any): boolean {
    if (condition.practiceSessions && userProgress.characterMastery.length < condition.practiceSessions) {
      return false;
    }
    if (condition.perfectScores && userProgress.perfectScores < condition.perfectScores) {
      return false;
    }
    if (condition.studyTime && userProgress.totalStudyTime < condition.studyTime) {
      return false;
    }
    return true;
  }

  // Check streak condition
  private checkStreakCondition(condition: any, userProgress: any): boolean {
    if (condition.dailyStreak && userProgress.streakCount < condition.dailyStreak) {
      return false;
    }
    if (condition.longestStreak && userProgress.longestStreak < condition.longestStreak) {
      return false;
    }
    return true;
  }

  // Check mastery condition
  private checkMasteryCondition(condition: any, userProgress: any): boolean {
    if (condition.masteredCharacters && userProgress.charactersMastered < condition.masteredCharacters) {
      return false;
    }
    if (condition.accuracyThreshold) {
      const averageAccuracy = userProgress.characterMastery.reduce((sum: number, mastery: any) => sum + mastery.accuracyScore, 0) / userProgress.characterMastery.length;
      if (averageAccuracy < condition.accuracyThreshold) {
        return false;
      }
    }
    return true;
  }

  // Check social condition
  private checkSocialCondition(condition: any, userProgress: any): boolean {
    // Social conditions would typically involve interactions with other users
    // For now, we'll implement basic checks
    if (condition.shares && userProgress.xpTransactions.filter((tx: any) => tx.source === 'SOCIAL_SHARE').length < condition.shares) {
      return false;
    }
    return true;
  }

  // Check special condition
  private checkSpecialCondition(condition: any, userProgress: any): boolean {
    // Special conditions are custom and can be complex
    // This would depend on the specific achievement
    return true;
  }

  // Check milestone condition
  private checkMilestoneCondition(condition: any, userProgress: any): boolean {
    if (condition.milestone && userProgress.currentLevel < condition.milestone) {
      return false;
    }
    if (condition.xpMilestone && userProgress.totalXp < condition.xpMilestone) {
      return false;
    }
    return true;
  }

  // Check challenge condition
  private checkChallengeCondition(condition: any, userProgress: any): boolean {
    if (condition.challengeType === 'weekly' && condition.completed && userProgress.xpTransactions.filter((tx: any) => tx.source === 'WEEKLY_CHALLENGE').length < condition.completed) {
      return false;
    }
    if (condition.challengeType === 'monthly' && condition.completed && userProgress.xpTransactions.filter((tx: any) => tx.source === 'MONTHLY_CHALLENGE').length < condition.completed) {
      return false;
    }
    return true;
  }

  // Get achievement progress
  async getAchievementProgress(userId: string, achievementId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const userAchievement = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        },
        include: {
          achievement: true
        }
      });

      if (!userAchievement) {
        return {
          success: false,
          message: 'User achievement not found',
          error: 'USER_ACHIEVEMENT_NOT_FOUND'
        };
      }

      // Calculate progress percentage
      const progress = this.calculateProgress(userAchievement.achievement, userAchievement.progress);

      return {
        success: true,
        data: {
          userAchievement,
          progress
        },
        message: 'Achievement progress retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get achievement progress', { userId, achievementId, error: error.message });
      return {
        success: false,
        message: 'Failed to get achievement progress',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate progress percentage
  private calculateProgress(achievement: Achievement, currentProgress: any): number {
    const condition = achievement.unlockCondition;
    let totalRequirements = 0;
    let completedRequirements = 0;

    // This is a simplified progress calculation
    // In a real implementation, you'd want more sophisticated progress tracking
    if (condition.charactersLearned) {
      totalRequirements += condition.charactersLearned;
      completedRequirements += Math.min(currentProgress.charactersLearned || 0, condition.charactersLearned);
    }

    if (condition.totalXp) {
      totalRequirements += condition.totalXp;
      completedRequirements += Math.min(currentProgress.totalXp || 0, condition.totalXp);
    }

    if (condition.level) {
      totalRequirements += condition.level;
      completedRequirements += Math.min(currentProgress.level || 0, condition.level);
    }

    return totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
  }

  // Get achievement statistics
  async getAchievementStatistics(userId: string): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [totalAchievements, unlockedAchievements, achievementsByCategory, achievementsByRarity] = await Promise.all([
        // Total achievements
        this.prisma.achievement.count({
          where: { isActive: true }
        }),

        // Unlocked achievements
        this.prisma.userAchievement.count({
          where: {
            userId,
            isUnlocked: true
          }
        }),

        // Achievements by category
        this.prisma.userAchievement.groupBy({
          by: ['achievementId'],
          where: {
            userId,
            isUnlocked: true
          },
          _count: { id: true }
        }),

        // Achievements by rarity
        this.prisma.userAchievement.groupBy({
          by: ['achievementId'],
          where: {
            userId,
            isUnlocked: true
          },
          _count: { id: true }
        })
      ]);

      // Get category and rarity breakdowns
      const categoryBreakdown = await this.prisma.userAchievement.findMany({
        where: {
          userId,
          isUnlocked: true
        },
        include: {
          achievement: true
        }
      });

      const categoryStats = categoryBreakdown.reduce((acc: any, ua) => {
        const category = ua.achievement.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const rarityStats = categoryBreakdown.reduce((acc: any, ua) => {
        const rarity = ua.achievement.rarity;
        acc[rarity] = (acc[rarity] || 0) + 1;
        return acc;
      }, {});

      return {
        success: true,
        data: {
          totalAchievements,
          unlockedAchievements,
          completionRate: totalAchievements > 0 ? (unlockedAchievements / totalAchievements) * 100 : 0,
          categoryStats,
          rarityStats
        },
        message: 'Achievement statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get achievement statistics', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get achievement statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Create achievement (admin only)
  async createAchievement(achievementData: AchievementInput): Promise<{ success: boolean; data?: Achievement; message: string; error?: string }> {
    try {
      const achievement = await this.prisma.achievement.create({
        data: achievementData
      });

      // Clear cache
      await cacheDel('all_achievements');

      logger.info('Achievement created successfully', { achievementId: achievement.id });

      return {
        success: true,
        data: achievement,
        message: 'Achievement created successfully'
      };
    } catch (error) {
      logger.error('Failed to create achievement', { error: error.message });
      return {
        success: false,
        message: 'Failed to create achievement',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update achievement (admin only)
  async updateAchievement(achievementId: string, achievementData: Partial<AchievementInput>): Promise<{ success: boolean; data?: Achievement; message: string; error?: string }> {
    try {
      const achievement = await this.prisma.achievement.update({
        where: { id: achievementId },
        data: achievementData
      });

      // Clear cache
      await cacheDel('all_achievements');

      logger.info('Achievement updated successfully', { achievementId });

      return {
        success: true,
        data: achievement,
        message: 'Achievement updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update achievement', { achievementId, error: error.message });
      return {
        success: false,
        message: 'Failed to update achievement',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Delete achievement (admin only)
  async deleteAchievement(achievementId: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      await this.prisma.achievement.delete({
        where: { id: achievementId }
      });

      // Clear cache
      await cacheDel('all_achievements');

      logger.info('Achievement deleted successfully', { achievementId });

      return {
        success: true,
        message: 'Achievement deleted successfully'
      };
    } catch (error) {
      logger.error('Failed to delete achievement', { achievementId, error: error.message });
      return {
        success: false,
        message: 'Failed to delete achievement',
        error: 'INTERNAL_ERROR'
      };
    }
  }
}

// Export singleton instance
export const achievementService = new AchievementService(require('@/config/database').default);
