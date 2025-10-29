import { prisma } from '../models';
import { 
  FriendRequest, 
  Friendship, 
  Follow, 
  Activity, 
  UserAchievement,
  MentorshipRequest,
  CreateFriendRequestRequest,
  UpdateFriendRequestRequest,
  CreateMentorshipRequestRequest,
  FriendRequestStatus,
  MentorshipStatus,
  ActivityType,
  AchievementType,
  PaginationQuery
} from '../types';
import { AppError } from '../utils/errors';
import { contentModeration } from '../utils/moderation';

export class SocialService {
  // Friend Requests
  async getFriendRequests(userId: string, type: 'sent' | 'received' = 'received'): Promise<FriendRequest[]> {
    const where = type === 'sent' 
      ? { senderId: userId, status: FriendRequestStatus.PENDING }
      : { receiverId: userId, status: FriendRequestStatus.PENDING };

    return prisma.friendRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFriendRequest(data: CreateFriendRequestRequest, senderId: string): Promise<FriendRequest> {
    if (data.receiverId === senderId) {
      throw new AppError('Cannot send friend request to yourself', 400);
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: data.receiverId } })
    ]);

    if (!sender || !receiver) {
      throw new AppError('User not found', 404);
    }

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: data.receiverId },
          { userId: data.receiverId, friendId: senderId }
        ]
      }
    });

    if (existingFriendship) {
      throw new AppError('Users are already friends', 400);
    }

    // Check if friend request already exists
    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: data.receiverId },
          { senderId: data.receiverId, receiverId: senderId }
        ],
        status: FriendRequestStatus.PENDING
      }
    });

    if (existingRequest) {
      throw new AppError('Friend request already exists', 400);
    }

    // Content moderation for message
    if (data.message) {
      const moderationResult = await contentModeration.checkContent(data.message);
      if (!moderationResult.isApproved) {
        throw new AppError('Message violates community guidelines', 400);
      }
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId: data.receiverId,
        message: data.message,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        receiver: {
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

    // Create activity
    await prisma.activity.create({
      data: {
        userId: senderId,
        type: ActivityType.FRIEND_ADDED,
        title: 'Sent friend request',
        description: `Sent friend request to ${receiver.username}`,
        metadata: { receiverId: data.receiverId, requestId: friendRequest.id }
      }
    });

    return friendRequest;
  }

  async updateFriendRequest(requestId: string, data: UpdateFriendRequestRequest, userId: string): Promise<FriendRequest> {
    const friendRequest = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!friendRequest) {
      throw new AppError('Friend request not found', 404);
    }

    if (friendRequest.receiverId !== userId) {
      throw new AppError('Not authorized to update this friend request', 403);
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new AppError('Friend request has already been processed', 400);
    }

    const updatedRequest = await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: data.status },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        receiver: {
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

    // If accepted, create friendship
    if (data.status === FriendRequestStatus.ACCEPTED) {
      await Promise.all([
        prisma.friendship.create({
          data: {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId,
          }
        }),
        prisma.friendship.create({
          data: {
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId,
          }
        })
      ]);

      // Create activities for both users
      await Promise.all([
        prisma.activity.create({
          data: {
            userId: friendRequest.senderId,
            type: ActivityType.FRIEND_ADDED,
            title: 'Friend request accepted',
            description: `${updatedRequest.receiver.username} accepted your friend request`,
            metadata: { friendId: friendRequest.receiverId }
          }
        }),
        prisma.activity.create({
          data: {
            userId: friendRequest.receiverId,
            type: ActivityType.FRIEND_ADDED,
            title: 'New friend added',
            description: `You are now friends with ${updatedRequest.sender.username}`,
            metadata: { friendId: friendRequest.senderId }
          }
        })
      ]);
    }

    return updatedRequest;
  }

  async cancelFriendRequest(requestId: string, userId: string): Promise<void> {
    const friendRequest = await prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!friendRequest) {
      throw new AppError('Friend request not found', 404);
    }

    if (friendRequest.senderId !== userId) {
      throw new AppError('Not authorized to cancel this friend request', 403);
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.CANCELLED }
    });
  }

  // Friendships
  async getFriends(userId: string, pagination: PaginationQuery = {}): Promise<{ friends: Friendship[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [friends, total] = await Promise.all([
      prisma.friendship.findMany({
        where: { userId },
        include: {
          friend: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
              lastActiveAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.friendship.count({ where: { userId } })
    ]);

    return { friends, total };
  }

  async removeFriend(friendId: string, userId: string): Promise<void> {
    // Remove both directions of friendship
    await Promise.all([
      prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId, friendId },
            { userId: friendId, friendId: userId }
          ]
        }
      })
    ]);

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: ActivityType.FRIEND_ADDED, // Could add REMOVE_FRIEND type
        title: 'Friend removed',
        description: `Removed friend`,
        metadata: { friendId }
      }
    });
  }

  // Follow System
  async followUser(followingId: string, followerId: string): Promise<Follow> {
    if (followingId === followerId) {
      throw new AppError('Cannot follow yourself', 400);
    }

    // Check if users exist
    const [follower, following] = await Promise.all([
      prisma.user.findUnique({ where: { id: followerId } }),
      prisma.user.findUnique({ where: { id: followingId } })
    ]);

    if (!follower || !following) {
      throw new AppError('User not found', 404);
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (existingFollow) {
      throw new AppError('Already following this user', 400);
    }

    const follow = await prisma.follow.create({
      data: { followerId, followingId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        following: {
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

    // Create activity
    await prisma.activity.create({
      data: {
        userId: followerId,
        type: ActivityType.FRIEND_ADDED, // Could add FOLLOW type
        title: 'Started following',
        description: `Started following ${following.username}`,
        metadata: { followingId }
      }
    });

    return follow;
  }

  async unfollowUser(followingId: string, followerId: string): Promise<void> {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } }
    });

    if (!follow) {
      throw new AppError('Not following this user', 400);
    }

    await prisma.follow.delete({
      where: { id: follow.id }
    });
  }

  async getFollowers(userId: string, pagination: PaginationQuery = {}): Promise<{ followers: Follow[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [followers, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
              lastActiveAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.follow.count({ where: { followingId: userId } })
    ]);

    return { followers, total };
  }

  async getFollowing(userId: string, pagination: PaginationQuery = {}): Promise<{ following: Follow[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [following, total] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
              reputation: true,
              lastActiveAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.follow.count({ where: { followerId: userId } })
    ]);

    return { following, total };
  }

  // Activities
  async getUserActivity(userId: string, pagination: PaginationQuery = {}): Promise<{ activities: Activity[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.getUserActivity(userId, limit, offset),
      prisma.activity.count({ where: { userId } })
    ]);

    return { activities, total };
  }

  async getFriendActivity(userId: string, pagination: PaginationQuery = {}): Promise<{ activities: Activity[], total: number }> {
    const { page = 1, limit = 20 } = pagination;
    const offset = (page - 1) * limit;

    // Get user's friends
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true }
    });

    const friendIds = friendships.map(f => f.friendId);

    if (friendIds.length === 0) {
      return { activities: [], total: 0 };
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId: { in: friendIds } },
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
      }),
      prisma.activity.count({ where: { userId: { in: friendIds } } })
    ]);

    return { activities, total };
  }

  // Achievements
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

  async unlockAchievement(userId: string, achievementType: AchievementType, title: string, description: string, points: number = 0, icon?: string): Promise<UserAchievement> {
    // Check if achievement already exists
    const existingAchievement = await prisma.userAchievement.findUnique({
      where: { userId_achievementType: { userId, achievementType } }
    });

    if (existingAchievement) {
      return existingAchievement;
    }

    const achievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementType,
        title,
        description,
        icon,
        points,
      }
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        type: ActivityType.ACHIEVEMENT_UNLOCKED,
        title: 'Achievement unlocked',
        description: `Unlocked achievement: ${title}`,
        metadata: { achievementType, points }
      }
    });

    return achievement;
  }

  // Mentorship
  async getMentorshipRequests(userId: string, type: 'sent' | 'received' = 'received'): Promise<MentorshipRequest[]> {
    const where = type === 'sent' 
      ? { menteeId: userId, status: MentorshipStatus.PENDING }
      : { mentorId: userId, status: MentorshipStatus.PENDING };

    return prisma.mentorshipRequest.findMany({
      where,
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        mentee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMentorshipRequest(data: CreateMentorshipRequestRequest, menteeId: string): Promise<MentorshipRequest> {
    if (data.mentorId === menteeId) {
      throw new AppError('Cannot request mentorship from yourself', 400);
    }

    // Check if users exist
    const [mentor, mentee] = await Promise.all([
      prisma.user.findUnique({ where: { id: data.mentorId } }),
      prisma.user.findUnique({ where: { id: menteeId } })
    ]);

    if (!mentor || !mentee) {
      throw new AppError('User not found', 404);
    }

    // Check if mentorship request already exists
    const existingRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        mentorId: data.mentorId,
        menteeId,
        status: MentorshipStatus.PENDING
      }
    });

    if (existingRequest) {
      throw new AppError('Mentorship request already exists', 400);
    }

    // Content moderation for message
    if (data.message) {
      const moderationResult = await contentModeration.checkContent(data.message);
      if (!moderationResult.isApproved) {
        throw new AppError('Message violates community guidelines', 400);
      }
    }

    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        mentorId: data.mentorId,
        menteeId,
        message: data.message,
      },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        mentee: {
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

    return mentorshipRequest;
  }

  async updateMentorshipRequest(requestId: string, status: MentorshipStatus, userId: string): Promise<MentorshipRequest> {
    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({ where: { id: requestId } });
    if (!mentorshipRequest) {
      throw new AppError('Mentorship request not found', 404);
    }

    if (mentorshipRequest.mentorId !== userId) {
      throw new AppError('Not authorized to update this mentorship request', 403);
    }

    if (mentorshipRequest.status !== MentorshipStatus.PENDING) {
      throw new AppError('Mentorship request has already been processed', 400);
    }

    const updatedRequest = await prisma.mentorshipRequest.update({
      where: { id: requestId },
      data: { status },
      include: {
        mentor: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            reputation: true,
          },
        },
        mentee: {
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

    // Create activity if accepted
    if (status === MentorshipStatus.ACCEPTED) {
      await Promise.all([
        prisma.activity.create({
          data: {
            userId: mentorshipRequest.mentorId,
            type: ActivityType.ACHIEVEMENT_UNLOCKED, // Could add MENTORSHIP type
            title: 'Mentorship accepted',
            description: `Accepted mentorship request from ${updatedRequest.mentee.username}`,
            metadata: { menteeId: mentorshipRequest.menteeId }
          }
        }),
        prisma.activity.create({
          data: {
            userId: mentorshipRequest.menteeId,
            type: ActivityType.ACHIEVEMENT_UNLOCKED,
            title: 'Mentorship started',
            description: `Started mentorship with ${updatedRequest.mentor.username}`,
            metadata: { mentorId: mentorshipRequest.mentorId }
          }
        })
      ]);
    }

    return updatedRequest;
  }

  // User Stats
  async getUserStats(userId: string): Promise<any> {
    return prisma.getUserStats(userId);
  }
}

export const socialService = new SocialService();
