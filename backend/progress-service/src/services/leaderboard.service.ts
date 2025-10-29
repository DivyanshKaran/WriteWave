import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { config } from '../config';
import { 
  Leaderboard, 
  LeaderboardInput, 
  LeaderboardPeriod
} from '../types';
import { cacheGet, cacheSet, cacheDel } from '../config/redis';
import moment from 'moment';

export class LeaderboardService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Get leaderboard
  async getLeaderboard(period: LeaderboardPeriod, limit: number = 100, offset: number = 0): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const cacheKey = `leaderboard:${period}:${limit}:${offset}`;
      const cached = await cacheGet<any>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'Leaderboard retrieved from cache'
        };
      }

      // Calculate date range based on period
      const dateRange = this.getDateRange(period);
      
      // Get leaderboard data
      const leaderboardData = await this.calculateLeaderboard(period, dateRange, limit, offset);

      // Cache the result
      await cacheSet(cacheKey, leaderboardData, config.LEADERBOARD_CACHE_TTL);

      return {
        success: true,
        data: leaderboardData,
        message: 'Leaderboard retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get leaderboard', { period, error: error.message });
      return {
        success: false,
        message: 'Failed to get leaderboard',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get user rank
  async getUserRank(userId: string, period: LeaderboardPeriod): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const cacheKey = `user_rank:${userId}:${period}`;
      const cached = await cacheGet<any>(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User rank retrieved from cache'
        };
      }

      const dateRange = this.getDateRange(period);
      const userRank = await this.calculateUserRank(userId, period, dateRange);

      // Cache the result
      await cacheSet(cacheKey, userRank, config.LEADERBOARD_CACHE_TTL);

      return {
        success: true,
        data: userRank,
        message: 'User rank retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user rank', { userId, period, error: error.message });
      return {
        success: false,
        message: 'Failed to get user rank',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update leaderboard
  async updateLeaderboard(period: LeaderboardPeriod): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const dateRange = this.getDateRange(period);
      const leaderboardData = await this.calculateLeaderboard(period, dateRange, config.LEADERBOARD_TOP_COUNT, 0);

      // Update leaderboard entries
      await this.prisma.$transaction(async (tx) => {
        // Clear existing entries for this period
        await tx.leaderboard.deleteMany({
          where: { period }
        });

        // Insert new entries
        for (let i = 0; i < leaderboardData.entries.length; i++) {
          const entry = leaderboardData.entries[i];
          await tx.leaderboard.create({
            data: {
              userId: entry.userId,
              period,
              rank: i + 1,
              score: entry.score,
              metadata: entry.metadata
            }
          });
        }
      });

      // Clear cache
      await this.clearLeaderboardCache(period);

      logger.info('Leaderboard updated successfully', { period, entriesCount: leaderboardData.entries.length });

      return {
        success: true,
        data: {
          period,
          entriesCount: leaderboardData.entries.length,
          lastUpdated: new Date()
        },
        message: 'Leaderboard updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update leaderboard', { period, error: error.message });
      return {
        success: false,
        message: 'Failed to update leaderboard',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate leaderboard data
  private async calculateLeaderboard(period: LeaderboardPeriod, dateRange: { start: Date; end: Date }, limit: number, offset: number): Promise<any> {
    const { start, end } = dateRange;

    // Get user progress data for the period
    const userProgress = await this.prisma.userProgress.findMany({
      include: {
        xpTransactions: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        },
        characterMastery: {
          where: {
            lastPracticed: {
              gte: start,
              lte: end
            }
          }
        },
        achievements: {
          where: {
            unlockedAt: {
              gte: start,
              lte: end
            }
          }
        },
        streaks: {
          where: {
            lastActivity: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    // Calculate scores for each user
    const leaderboardEntries = userProgress.map(user => {
      const score = this.calculateScore(user, period, dateRange);
      return {
        userId: user.userId,
        score,
        metadata: {
          totalXp: user.totalXp,
          currentLevel: user.currentLevel,
          streakCount: user.streakCount,
          charactersMastered: user.charactersMastered,
          achievementsCount: user.achievementsCount,
          xpTransactions: user.xpTransactions.length,
          characterMastery: user.characterMastery.length,
          achievements: user.achievements.length,
          streaks: user.streaks.length
        }
      };
    });

    // Sort by score (descending)
    leaderboardEntries.sort((a, b) => b.score - a.score);

    // Apply pagination
    const paginatedEntries = leaderboardEntries.slice(offset, offset + limit);

    return {
      period,
      dateRange,
      entries: paginatedEntries,
      total: leaderboardEntries.length,
      pagination: {
        limit,
        offset,
        hasNext: offset + limit < leaderboardEntries.length,
        hasPrev: offset > 0
      }
    };
  }

  // Calculate user rank
  private async calculateUserRank(userId: string, period: LeaderboardPeriod, dateRange: { start: Date; end: Date }): Promise<any> {
    const { start, end } = dateRange;

    // Get user progress
    const userProgress = await this.prisma.userProgress.findUnique({
      where: { userId },
      include: {
        xpTransactions: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        },
        characterMastery: {
          where: {
            lastPracticed: {
              gte: start,
              lte: end
            }
          }
        },
        achievements: {
          where: {
            unlockedAt: {
              gte: start,
              lte: end
            }
          }
        },
        streaks: {
          where: {
            lastActivity: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    if (!userProgress) {
      return {
        rank: null,
        score: 0,
        percentile: 0,
        totalUsers: 0
      };
    }

    const userScore = this.calculateScore(userProgress, period, dateRange);

    // Get all users' scores to calculate rank
    const allUsers = await this.prisma.userProgress.findMany({
      include: {
        xpTransactions: {
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        },
        characterMastery: {
          where: {
            lastPracticed: {
              gte: start,
              lte: end
            }
          }
        },
        achievements: {
          where: {
            unlockedAt: {
              gte: start,
              lte: end
            }
          }
        },
        streaks: {
          where: {
            lastActivity: {
              gte: start,
              lte: end
            }
          }
        }
      }
    });

    const allScores = allUsers.map(user => this.calculateScore(user, period, dateRange));
    allScores.sort((a, b) => b - a);

    const rank = allScores.findIndex(score => score <= userScore) + 1;
    const percentile = ((allScores.length - rank + 1) / allScores.length) * 100;

    return {
      rank,
      score: userScore,
      percentile,
      totalUsers: allScores.length
    };
  }

  // Calculate score for a user
  private calculateScore(user: any, period: LeaderboardPeriod, dateRange: { start: Date; end: Date }): number {
    let score = 0;

    // XP-based scoring
    const periodXp = user.xpTransactions.reduce((sum: number, tx: any) => sum + tx.amount, 0);
    score += periodXp * 1.0;

    // Level-based scoring
    score += user.currentLevel * 100;

    // Streak-based scoring
    score += user.streakCount * 50;

    // Character mastery scoring
    const masteredCharacters = user.characterMastery.filter((cm: any) => 
      cm.masteryLevel === 'MASTERED' || cm.masteryLevel === 'EXPERT'
    ).length;
    score += masteredCharacters * 200;

    // Achievement scoring
    const unlockedAchievements = user.achievements.filter((a: any) => a.isUnlocked).length;
    score += unlockedAchievements * 150;

    // Practice consistency scoring
    const practiceDays = new Set(
      user.characterMastery.map((cm: any) => 
        moment(cm.lastPracticed).format('YYYY-MM-DD')
      )
    ).size;
    score += practiceDays * 25;

    // Accuracy scoring
    const averageAccuracy = user.characterMastery.length > 0 ? 
      user.characterMastery.reduce((sum: number, cm: any) => sum + cm.accuracyScore, 0) / user.characterMastery.length : 0;
    score += averageAccuracy * 2;

    // Period-specific multipliers
    switch (period) {
      case LeaderboardPeriod.DAILY:
        score *= 1.0;
        break;
      case LeaderboardPeriod.WEEKLY:
        score *= 1.2;
        break;
      case LeaderboardPeriod.MONTHLY:
        score *= 1.5;
        break;
      case LeaderboardPeriod.ALL_TIME:
        score *= 2.0;
        break;
    }

    return Math.round(score);
  }

  // Get date range for period
  private getDateRange(period: LeaderboardPeriod): { start: Date; end: Date } {
    const now = moment();
    let start: Date;
    let end: Date = now.toDate();

    switch (period) {
      case LeaderboardPeriod.DAILY:
        start = now.startOf('day').toDate();
        break;
      case LeaderboardPeriod.WEEKLY:
        start = now.startOf('week').toDate();
        break;
      case LeaderboardPeriod.MONTHLY:
        start = now.startOf('month').toDate();
        break;
      case LeaderboardPeriod.ALL_TIME:
        start = new Date(0); // Beginning of time
        break;
      default:
        start = now.startOf('day').toDate();
    }

    return { start, end };
  }

  // Clear leaderboard cache
  private async clearLeaderboardCache(period: LeaderboardPeriod): Promise<void> {
    const patterns = [
      `leaderboard:${period}:*`,
      `user_rank:*:${period}`
    ];

    for (const pattern of patterns) {
      // Note: Redis doesn't support pattern deletion in a single command
      // In a real implementation, you'd use SCAN to find and delete matching keys
      await cacheDel(pattern);
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStatistics(period: LeaderboardPeriod): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const [totalUsers, averageScore, topScore, lastUpdated] = await Promise.all([
        // Total users in leaderboard
        this.prisma.leaderboard.count({
          where: { period }
        }),

        // Average score
        this.prisma.leaderboard.aggregate({
          where: { period },
          _avg: { score: true }
        }),

        // Top score
        this.prisma.leaderboard.aggregate({
          where: { period },
          _max: { score: true }
        }),

        // Last updated
        this.prisma.leaderboard.findFirst({
          where: { period },
          orderBy: { updatedAt: 'desc' },
          select: { updatedAt: true }
        })
      ]);

      return {
        success: true,
        data: {
          period,
          totalUsers,
          averageScore: averageScore._avg.score || 0,
          topScore: topScore._max.score || 0,
          lastUpdated: lastUpdated?.updatedAt || null
        },
        message: 'Leaderboard statistics retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get leaderboard statistics', { period, error: error.message });
      return {
        success: false,
        message: 'Failed to get leaderboard statistics',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get user's leaderboard history
  async getUserLeaderboardHistory(userId: string, limit: number = 30): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const history = await this.prisma.leaderboard.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        take: limit
      });

      return {
        success: true,
        data: {
          userId,
          history: history.map(entry => ({
            period: entry.period,
            rank: entry.rank,
            score: entry.score,
            date: entry.updatedAt
          }))
        },
        message: 'User leaderboard history retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get user leaderboard history', { userId, error: error.message });
      return {
        success: false,
        message: 'Failed to get user leaderboard history',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Update all leaderboards
  async updateAllLeaderboards(): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const periods = [
        LeaderboardPeriod.DAILY,
        LeaderboardPeriod.WEEKLY,
        LeaderboardPeriod.MONTHLY,
        LeaderboardPeriod.ALL_TIME
      ];

      const results = [];

      for (const period of periods) {
        const result = await this.updateLeaderboard(period);
        results.push({
          period,
          success: result.success,
          message: result.message
        });
      }

      logger.info('All leaderboards updated', { results });

      return {
        success: true,
        data: { results },
        message: 'All leaderboards updated successfully'
      };
    } catch (error) {
      logger.error('Failed to update all leaderboards', { error: error.message });
      return {
        success: false,
        message: 'Failed to update all leaderboards',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Get leaderboard trends
  async getLeaderboardTrends(period: LeaderboardPeriod, days: number = 30): Promise<{ success: boolean; data?: any; message: string; error?: string }> {
    try {
      const endDate = moment();
      const startDate = endDate.clone().subtract(days, 'days');

      // Get historical leaderboard data
      const historicalData = await this.prisma.leaderboard.findMany({
        where: {
          period,
          updatedAt: {
            gte: startDate.toDate(),
            lte: endDate.toDate()
          }
        },
        orderBy: { updatedAt: 'asc' }
      });

      // Group by date and calculate trends
      const trends = this.calculateTrends(historicalData, period);

      return {
        success: true,
        data: {
          period,
          days,
          trends
        },
        message: 'Leaderboard trends retrieved successfully'
      };
    } catch (error) {
      logger.error('Failed to get leaderboard trends', { period, days, error: error.message });
      return {
        success: false,
        message: 'Failed to get leaderboard trends',
        error: 'INTERNAL_ERROR'
      };
    }
  }

  // Calculate trends from historical data
  private calculateTrends(historicalData: any[], period: LeaderboardPeriod): any {
    const dailyData = historicalData.reduce((acc: any, entry) => {
      const date = moment(entry.updatedAt).format('YYYY-MM-DD');
      if (!acc[date]) {
        acc[date] = {
          date,
          totalUsers: 0,
          averageScore: 0,
          topScore: 0,
          entries: []
        };
      }
      acc[date].entries.push(entry);
      acc[date].totalUsers++;
      acc[date].averageScore += entry.score;
      acc[date].topScore = Math.max(acc[date].topScore, entry.score);
      return acc;
    }, {});

    // Calculate averages and format data
    const trends = Object.values(dailyData).map((day: any) => ({
      date: day.date,
      totalUsers: day.totalUsers,
      averageScore: day.averageScore / day.totalUsers,
      topScore: day.topScore
    }));

    return trends.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

// Export singleton instance
export const leaderboardService = new LeaderboardService(require('../config/database').default);
