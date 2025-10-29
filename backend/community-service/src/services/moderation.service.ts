import { prisma } from '../models';
import { User as PrismaUser } from '@prisma/client';
import { 
  Report, 
  CreateReportRequest, 
  UpdateReportRequest,
  ReportReason,
  ReportStatus,
  User,
  Post,
  Comment,
  ModerationResult,
  ContentFilter,
  PaginationQuery
} from '../types';
import { AppError } from '../utils/errors';
import { contentModeration } from '../utils/moderation';

export class ModerationService {
  // Reports
  async getReports(pagination: PaginationQuery = {}, status?: ReportStatus): Promise<{ reports: Report[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          reported: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              content: true,
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
        take: limit,
        skip: offset,
      }),
      prisma.report.count({ where })
    ]);

    return { reports, total };
  }

  async getReport(reportId: string): Promise<Report | null> {
    return prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reported: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }

  async createReport(data: CreateReportRequest, reporterId: string): Promise<Report> {
    // Validate that at least one target is specified
    if (!data.reportedId && !data.postId && !data.commentId) {
      throw new AppError('Must specify a user, post, or comment to report', 400);
    }

    // Content moderation for description
    if (data.description) {
      const moderationResult = await contentModeration.checkContent(data.description);
      if (!moderationResult.isApproved) {
        throw new AppError('Report description violates community guidelines', 400);
      }
    }

    // Check if user is trying to report themselves
    if (data.reportedId === reporterId) {
      throw new AppError('Cannot report yourself', 400);
    }

    // Check if report already exists for this content
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId,
        reportedId: data.reportedId,
        postId: data.postId,
        commentId: data.commentId,
        status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] }
      }
    });

    if (existingReport) {
      throw new AppError('You have already reported this content', 400);
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        reportedId: data.reportedId,
        postId: data.postId,
        commentId: data.commentId,
        reason: data.reason,
        description: data.description,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reported: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
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
    });

    // Auto-moderate if threshold is reached
    await this.checkAutoModeration(data.reportedId, data.postId, data.commentId);

    return report;
  }

  async updateReport(reportId: string, data: UpdateReportRequest, moderatorId: string): Promise<Report> {
    const report = await prisma.report.findUnique({ where: { id: reportId } });
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    // Check if user is moderator
    const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
    if (!moderator?.isModerator) {
      throw new AppError('Not authorized to moderate reports', 403);
    }

    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        moderatorId,
        moderatorNotes: data.moderatorNotes,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        reported: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
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
    });

    // Take action based on report resolution
    if (data.status === ReportStatus.RESOLVED) {
      await this.handleReportResolution(report, data.moderatorNotes);
    }

    return updatedReport;
  }

  // Content Moderation
  async moderateContent(content: string, type: 'post' | 'comment' | 'message'): Promise<ModerationResult> {
    return contentModeration.checkContent(content);
  }

  async moderateUser(userId: string): Promise<ModerationResult> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check user's recent activity for violations
    const recentReports = await prisma.report.count({
      where: {
        reportedId: userId,
        status: ReportStatus.RESOLVED,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      }
    });

    const recentViolations = await prisma.report.count({
      where: {
        OR: [
          { reportedId: userId },
          { post: { authorId: userId } },
          { comment: { authorId: userId } }
        ],
        status: ReportStatus.RESOLVED,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      }
    });

    const isApproved = recentReports < 3 && recentViolations < 5;
    const confidence = Math.min(0.9, (recentReports + recentViolations) / 10);

    return {
      isApproved,
      confidence,
      reasons: isApproved ? [] : ['Multiple recent violations detected'],
      suggestions: isApproved ? [] : ['Consider temporary suspension']
    };
  }

  // Auto-moderation
  async checkAutoModeration(userId?: string, postId?: string, commentId?: string): Promise<void> {
    if (userId) {
      const reportCount = await prisma.report.count({
        where: {
          reportedId: userId,
          status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] }
        }
      });

      if (reportCount >= 5) {
        await this.autoSuspendUser(userId, 'Multiple reports received');
      }
    }

    if (postId) {
      const reportCount = await prisma.report.count({
        where: {
          postId,
          status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] }
        }
      });

      if (reportCount >= 3) {
        await this.autoHidePost(postId, 'Multiple reports received');
      }
    }

    if (commentId) {
      const reportCount = await prisma.report.count({
        where: {
          commentId,
          status: { in: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW] }
        }
      });

      if (reportCount >= 3) {
        await this.autoHideComment(commentId, 'Multiple reports received');
      }
    }
  }

  async autoSuspendUser(userId: string, reason: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        banExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED', // Could add SUSPENSION type
        title: 'Account suspended',
        description: `Account suspended: ${reason}`,
        metadata: { reason, duration: '7 days' }
      }
    });
  }

  async autoHidePost(postId: string, reason: string): Promise<void> {
    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true }
    });
  }

  async autoHideComment(commentId: string, reason: string): Promise<void> {
    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    });
  }

  // User Management
  async suspendUser(userId: string, reason: string, duration: number, moderatorId: string): Promise<PrismaUser> {
    const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
    if (!moderator?.isModerator) {
      throw new AppError('Not authorized to suspend users', 403);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason: reason,
        banExpiresAt: duration > 0 ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Account suspended',
        description: `Account suspended by moderator: ${reason}`,
        metadata: { reason, duration: duration > 0 ? `${duration} days` : 'permanent' }
      }
    });

    return user;
  }

  async unsuspendUser(userId: string, moderatorId: string): Promise<PrismaUser> {
    const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
    if (!moderator?.isModerator) {
      throw new AppError('Not authorized to unsuspend users', 403);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: false,
        banReason: null,
        banExpiresAt: null
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Account restored',
        description: 'Account suspension lifted by moderator',
        metadata: { restoredBy: moderatorId }
      }
    });

    return user;
  }

  async promoteToModerator(userId: string, promoterId: string): Promise<PrismaUser> {
    const promoter = await prisma.user.findUnique({ where: { id: promoterId } });
    if (!promoter?.isModerator) {
      throw new AppError('Not authorized to promote users', 403);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isModerator: true }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Promoted to moderator',
        description: 'Promoted to community moderator',
        metadata: { promotedBy: promoterId }
      }
    });

    return user;
  }

  async demoteFromModerator(userId: string, demoterId: string): Promise<PrismaUser> {
    const demoter = await prisma.user.findUnique({ where: { id: demoterId } });
    if (!demoter?.isModerator) {
      throw new AppError('Not authorized to demote users', 403);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isModerator: false }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: 'Moderator status removed',
        description: 'Moderator privileges removed',
        metadata: { demotedBy: demoterId }
      }
    });

    return user;
  }

  // Content Management
  async deletePost(postId: string, moderatorId: string, reason: string): Promise<void> {
    const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
    if (!moderator?.isModerator) {
      throw new AppError('Not authorized to delete posts', 403);
    }

    await prisma.post.update({
      where: { id: postId },
      data: { isDeleted: true }
    });

    // Create activity
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post) {
      await prisma.activity.create({
        data: {
          userId: post.authorId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Post deleted by moderator',
          description: `Post "${post.title}" deleted: ${reason}`,
          metadata: { postId, reason, deletedBy: moderatorId }
        }
      });
    }
  }

  async deleteComment(commentId: string, moderatorId: string, reason: string): Promise<void> {
    const moderator = await prisma.user.findUnique({ where: { id: moderatorId } });
    if (!moderator?.isModerator) {
      throw new AppError('Not authorized to delete comments', 403);
    }

    await prisma.comment.update({
      where: { id: commentId },
      data: { isDeleted: true }
    });

    // Create activity
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (comment) {
      await prisma.activity.create({
        data: {
          userId: comment.authorId,
          type: 'ACHIEVEMENT_UNLOCKED',
          title: 'Comment deleted by moderator',
          description: `Comment deleted: ${reason}`,
          metadata: { commentId, reason, deletedBy: moderatorId }
        }
      });
    }
  }

  // Moderation Dashboard
  async getModerationDashboard(): Promise<any> {
    return prisma.getModerationDashboard();
  }

  async getModerationStats(): Promise<any> {
    const [
      totalReports,
      pendingReports,
      resolvedReports,
      bannedUsers,
      activeModerators,
      recentReports
    ] = await Promise.all([
      prisma.report.count(),
      prisma.report.count({ where: { status: ReportStatus.PENDING } }),
      prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { isModerator: true } }),
      prisma.report.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      bannedUsers,
      activeModerators,
      recentReports,
      resolutionRate: totalReports > 0 ? (resolvedReports / totalReports) * 100 : 0
    };
  }

  // Handle report resolution
  private async handleReportResolution(report: Report, moderatorNotes?: string): Promise<void> {
    if (report.reportedId) {
      // User was reported - could implement user-specific actions
      const userReports = await prisma.report.count({
        where: {
          reportedId: report.reportedId,
          status: ReportStatus.RESOLVED
        }
      });

      if (userReports >= 5) {
        await this.autoSuspendUser(report.reportedId, 'Multiple resolved reports');
      }
    }

    if (report.postId) {
      // Post was reported - could implement post-specific actions
      const postReports = await prisma.report.count({
        where: {
          postId: report.postId,
          status: ReportStatus.RESOLVED
        }
      });

      if (postReports >= 3) {
        await this.autoHidePost(report.postId, 'Multiple resolved reports');
      }
    }

    if (report.commentId) {
      // Comment was reported - could implement comment-specific actions
      const commentReports = await prisma.report.count({
        where: {
          commentId: report.commentId,
          status: ReportStatus.RESOLVED
        }
      });

      if (commentReports >= 3) {
        await this.autoHideComment(report.commentId, 'Multiple resolved reports');
      }
    }
  }
}

export const moderationService = new ModerationService();
