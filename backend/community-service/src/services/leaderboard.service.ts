import { prisma } from '../models';
import { 
  LeaderboardEntry, 
  LeaderboardQuery, 
  LeaderboardType,
  User,
  UserAchievement,
  AchievementType,
  PaginationQuery
} from '../types';
import { AppError } from '../utils/errors';
import { redis } from '../utils/redis';

export class LeaderboardService {
  // Leaderboard Management
  async getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardEntry[]> {
    const { type, period, category, limit = 50 } = query;
    
    // Try to get from cache first
    const cacheKey = `leaderboard:${type}:${period || 'all'}:${category || 'all'}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const entries = await prisma.getLeaderboard(type, period, category, limit);
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(entries));
    
    return entries;
  }

  async updateLeaderboardEntry(userId: string, type: LeaderboardType, score: number, period?: string, category?: string): Promise<LeaderboardEntry> {
    const existingEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        type,
        period: period ?? null,
        category: category ?? null,
      }
    });

    if (existingEntry) {
      return prisma.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: { score },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
            },
          },
        },
      });
    } else {
      return prisma.leaderboardEntry.create({
        data: {
          userId,
          type,
          score,
          period,
          category,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
            },
          },
        },
      });
    }
  }

  async getUserRank(userId: string, type: LeaderboardType, period?: string, category?: string): Promise<number | null> {
    const where: any = { type };
    if (period) where.period = period;
    if (category) where.category = category;

    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        type,
        period: period ?? null,
        category: category ?? null,
      }
    });

    if (!userEntry) {
      return null;
    }

    const rank = await prisma.leaderboardEntry.count({
      where: {
        ...where,
        score: { gt: userEntry.score }
      }
    }) + 1;

    return rank;
  }

  async getLeaderboardAroundUser(userId: string, type: LeaderboardType, period?: string, category?: string, limit: number = 10): Promise<LeaderboardEntry[]> {
    const userEntry = await prisma.leaderboardEntry.findFirst({
      where: {
        userId,
        type,
        period: period ?? null,
        category: category ?? null,
      }
    });

    if (!userEntry) {
      return [];
    }

    const where: any = { type };
    if (period) where.period = period;
    if (category) where.category = category;

    // Get entries around the user's score
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        ...where,
        OR: [
          { score: { gte: userEntry.score } },
          { score: { lte: userEntry.score } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit * 2, // Get more entries to ensure we have enough around the user
    });

    // Find user's position and return entries around it
    const userIndex = entries.findIndex(entry => entry.userId === userId);
    if (userIndex === -1) {
      return [];
    }

    const startIndex = Math.max(0, userIndex - Math.floor(limit / 2));
    const endIndex = Math.min(entries.length, startIndex + limit);

    return entries.slice(startIndex, endIndex);
  }

  // Achievement System
  async checkAndUnlockAchievements(userId: string): Promise<UserAchievement[]> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const stats = await prisma.getUserStats(userId);
    const newAchievements: UserAchievement[] = [];

    // Check for various achievements
    const achievementChecks = [
      {
        type: AchievementType.FIRST_POST,
        condition: stats.postCount >= 1,
        title: 'First Post',
        description: 'Created your first post',
        points: 10,
        icon: '📝'
      },
      {
        type: AchievementType.HELPFUL_MEMBER,
        condition: stats.reputation >= 100,
        title: 'Helpful Member',
        description: 'Gained 100 reputation points',
        points: 50,
        icon: '👍'
      },
      {
        type: AchievementType.ACTIVE_PARTICIPANT,
        condition: stats.commentCount >= 50,
        title: 'Active Participant',
        description: 'Made 50 comments',
        points: 25,
        icon: '💬'
      },
      {
        type: AchievementType.STUDY_GROUP_LEADER,
        condition: stats.groupCount >= 3,
        title: 'Study Group Leader',
        description: 'Joined 3 study groups',
        points: 30,
        icon: '👥'
      },
      {
        type: AchievementType.KNOWLEDGE_SHARER,
        condition: stats.postCount >= 10,
        title: 'Knowledge Sharer',
        description: 'Created 10 posts',
        points: 40,
        icon: '📚'
      },
      {
        type: AchievementType.COMMUNITY_BUILDER,
        condition: stats.friendCount >= 20,
        title: 'Community Builder',
        description: 'Made 20 friends',
        points: 60,
        icon: '🏗️'
      }
    ];

    for (const check of achievementChecks) {
      if (check.condition) {
        try {
          const achievement = await prisma.userAchievement.upsert({
            where: {
              userId_achievementType: {
                userId,
                achievementType: check.type
              }
            },
            update: {},
            create: {
              userId,
              achievementType: check.type,
              title: check.title,
              description: check.description,
              icon: check.icon,
              points: check.points,
            }
          });

          // Check if this is a new achievement
          if (achievement.unlockedAt.getTime() === new Date().getTime()) {
            newAchievements.push(achievement);
          }
        } catch (error) {
          // Achievement already exists, skip
          continue;
        }
      }
    }

    return newAchievements;
  }

  async getUserAchievements(userId: string, pagination: PaginationQuery = {}): Promise<{ achievements: UserAchievement[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [achievements, total] = await Promise.all([
      prisma.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.userAchievement.count({ where: { userId } })
    ]);

    return { achievements, total };
  }

  // Daily/Weekly/Monthly Leaderboards
  async updateDailyLeaderboards(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Update daily reputation leaderboard
    const dailyReputation = await prisma.user.findMany({
      select: {
        id: true,
        reputation: true,
      },
      orderBy: { reputation: 'desc' },
      take: 100
    });

    for (const user of dailyReputation) {
      await this.updateLeaderboardEntry(user.id, LeaderboardType.REPUTATION, user.reputation, 'daily');
    }

    // Update daily posts leaderboard
    const dailyPosts = await prisma.post.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: yesterday },
        isDeleted: false
      },
      _count: { authorId: true },
      orderBy: { _count: { authorId: 'desc' } },
      take: 100
    });

    for (const post of dailyPosts) {
      await this.updateLeaderboardEntry(post.authorId, LeaderboardType.POSTS_COUNT, post._count.authorId, 'daily');
    }

    // Clear cache
    await redis.del('leaderboard:REPUTATION:daily:all');
    await redis.del('leaderboard:POSTS_COUNT:daily:all');
  }

  async updateWeeklyLeaderboards(): Promise<void> {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    // Update weekly study streak leaderboard
    const weeklyStreaks = await prisma.user.findMany({
      select: {
        id: true,
        reputation: true, // Using reputation as proxy for activity
      },
      orderBy: { reputation: 'desc' },
      take: 100
    });

    for (const user of weeklyStreaks) {
      await this.updateLeaderboardEntry(user.id, LeaderboardType.STUDY_STREAK, user.reputation, 'weekly');
    }

    // Clear cache
    await redis.del('leaderboard:STUDY_STREAK:weekly:all');
  }

  async updateMonthlyLeaderboards(): Promise<void> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Update monthly achievements leaderboard
    const monthlyAchievements = await prisma.userAchievement.groupBy({
      by: ['userId'],
      where: {
        unlockedAt: { gte: monthStart }
      },
      _count: { userId: true },
      orderBy: { _count: { userId: 'desc' } },
      take: 100
    });

    for (const achievement of monthlyAchievements) {
      await this.updateLeaderboardEntry(achievement.userId, LeaderboardType.ACHIEVEMENTS_COUNT, achievement._count.userId, 'monthly');
    }

    // Clear cache
    await redis.del('leaderboard:ACHIEVEMENTS_COUNT:monthly:all');
  }

  // Category-specific Leaderboards
  async getCategoryLeaderboard(categoryId: string, type: LeaderboardType, period?: string): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:${type}:${period || 'all'}:${categoryId}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    const entries = await prisma.getLeaderboard(type, period, categoryId, 50);
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(entries));
    
    return entries;
  }

  // Group Leaderboards
  async getGroupLeaderboard(groupId: string, type: LeaderboardType): Promise<LeaderboardEntry[]> {
    const cacheKey = `leaderboard:group:${groupId}:${type}`;
    const cached = await redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }

    // Get group members
    const members = await prisma.studyGroupMember.findMany({
      where: { groupId, isActive: true },
      select: { userId: true }
    });

    const memberIds = members.map(m => m.userId);

    if (memberIds.length === 0) {
      return [];
    }

    // Get leaderboard entries for group members
    const entries = await prisma.leaderboardEntry.findMany({
      where: {
        userId: { in: memberIds },
        type,
        period: null,
        category: null
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
      orderBy: { score: 'desc' },
      take: 50
    });

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(entries));
    
    return entries;
  }

  // Clear all leaderboard caches
  async clearLeaderboardCache(): Promise<void> {
    const keys = await redis.keys('leaderboard:*');
    if (keys.length > 0) {
      await redis.delMultiple(keys);
    }
  }

  // Get leaderboard statistics
  async getLeaderboardStats(): Promise<any> {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalGroups,
      totalAchievements
    ] = await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { isDeleted: false } }),
      prisma.comment.count({ where: { isDeleted: false } }),
      prisma.studyGroup.count({ where: { isActive: true } }),
      prisma.userAchievement.count()
    ]);

    return {
      totalUsers,
      totalPosts,
      totalComments,
      totalGroups,
      totalAchievements,
      averageReputation: await prisma.user.aggregate({
        _avg: { reputation: true }
      }).then(result => result._avg.reputation || 0)
    };
  }
}

export const leaderboardService = new LeaderboardService();
