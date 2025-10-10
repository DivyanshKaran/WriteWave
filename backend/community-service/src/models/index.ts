// Database Models and Prisma Client
import { PrismaClient } from '@prisma/client';

// Extend Prisma Client with custom methods
class ExtendedPrismaClient extends PrismaClient {
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  // Custom methods for complex queries
  async getLeaderboard(type: string, period?: string, category?: string, limit = 50) {
    const where: any = { type };
    if (period) where.period = period;
    if (category) where.category = category;

    return this.leaderboardEntry.findMany({
      where,
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
      take: limit,
    });
  }

  async getPostWithDetails(postId: string, userId?: string) {
    return this.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: true,
        comments: {
          where: { isDeleted: false },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
                reputation: true,
              },
            },
            replies: {
              where: { isDeleted: false },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    reputation: true,
                  },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        votes: userId ? {
          where: { userId },
        } : false,
      },
    });
  }

  async getUserActivity(userId: string, limit = 20, offset = 0) {
    return this.activity.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getStudyGroupWithMembers(groupId: string, userId?: string) {
    return this.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        members: {
          where: { isActive: true },
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
          orderBy: { joinedAt: 'asc' },
        },
        challenges: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });
  }

  async searchPosts(query: string, filters: any = {}) {
    const where: any = {
      isDeleted: false,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.dateFrom) where.createdAt = { gte: new Date(filters.dateFrom) };
    if (filters.dateTo) where.createdAt = { ...where.createdAt, lte: new Date(filters.dateTo) };

    return this.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      skip: filters.offset || 0,
    });
  }

  async getUserStats(userId: string) {
    const [
      postCount,
      commentCount,
      reputation,
      friendCount,
      groupCount,
      achievementCount,
    ] = await Promise.all([
      this.post.count({ where: { authorId: userId, isDeleted: false } }),
      this.comment.count({ where: { authorId: userId, isDeleted: false } }),
      this.user.findUnique({ where: { id: userId }, select: { reputation: true } }),
      this.friendship.count({ where: { userId } }),
      this.studyGroupMember.count({ where: { userId, isActive: true } }),
      this.userAchievement.count({ where: { userId } }),
    ]);

    return {
      postCount,
      commentCount,
      reputation: reputation?.reputation || 0,
      friendCount,
      groupCount,
      achievementCount,
    };
  }

  async getModerationDashboard() {
    const [
      pendingReports,
      recentReports,
      bannedUsers,
      activeModerators,
    ] = await Promise.all([
      this.report.count({ where: { status: 'PENDING' } }),
      this.report.findMany({
        where: { status: 'PENDING' },
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          reported: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.user.count({ where: { isBanned: true } }),
      this.user.count({ where: { isModerator: true } }),
    ]);

    return {
      pendingReports,
      recentReports,
      bannedUsers,
      activeModerators,
    };
  }
}

// Create and export the Prisma client instance
export const prisma = new ExtendedPrismaClient();

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
