import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '@/models';
import { JWTPayload, WebSocketMessage, NotificationData } from '@/types';
import { redis } from '@/utils/redis';

export class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, string> = new Map(); // userId -> socketId
  private userRooms: Map<string, Set<string>> = new Map(); // userId -> Set of room names

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.WS_CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

        if (!user || user.isBanned) {
          return next(new Error('Invalid or banned user'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      const user = socket.data.user;
      console.log(`User ${user.username} connected with socket ${socket.id}`);

      // Store user connection
      this.connectedUsers.set(user.id, socket.id);
      this.userRooms.set(user.id, new Set());

      // Join user to their personal room
      socket.join(`user:${user.id}`);
      this.userRooms.get(user.id)!.add(`user:${user.id}`);

      // Join user to general community room
      socket.join('community');
      this.userRooms.get(user.id)!.add('community');

      // Handle joining study groups
      socket.on('join_study_group', async (groupId: string) => {
        try {
          const membership = await prisma.studyGroupMember.findUnique({
            where: { groupId_userId: { groupId, userId: user.id } }
          });

          if (membership && membership.isActive) {
            socket.join(`group:${groupId}`);
            this.userRooms.get(user.id)!.add(`group:${groupId}`);
            socket.emit('joined_study_group', { groupId });
          } else {
            socket.emit('error', { message: 'Not a member of this study group' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to join study group' });
        }
      });

      // Handle leaving study groups
      socket.on('leave_study_group', (groupId: string) => {
        socket.leave(`group:${groupId}`);
        this.userRooms.get(user.id)?.delete(`group:${groupId}`);
        socket.emit('left_study_group', { groupId });
      });

      // Handle joining forum categories
      socket.on('join_forum_category', (categoryId: string) => {
        socket.join(`category:${categoryId}`);
        this.userRooms.get(user.id)!.add(`category:${categoryId}`);
        socket.emit('joined_forum_category', { categoryId });
      });

      // Handle leaving forum categories
      socket.on('leave_forum_category', (categoryId: string) => {
        socket.leave(`category:${categoryId}`);
        this.userRooms.get(user.id)?.delete(`category:${categoryId}`);
        socket.emit('left_forum_category', { categoryId });
      });

      // Handle real-time chat in study groups
      socket.on('group_message', async (data: { groupId: string, message: string }) => {
        try {
          const membership = await prisma.studyGroupMember.findUnique({
            where: { groupId_userId: { groupId: data.groupId, userId: user.id } }
          });

          if (membership && membership.isActive) {
            const messageData = {
              id: Date.now().toString(),
              groupId: data.groupId,
              userId: user.id,
              username: user.username,
              displayName: user.displayName,
              avatar: user.avatar,
              message: data.message,
              timestamp: new Date().toISOString()
            };

            // Broadcast to group members
            this.io.to(`group:${data.groupId}`).emit('group_message', messageData);

            // Store message in Redis for persistence (optional)
            await redis.lpush(`group:${data.groupId}:messages`, JSON.stringify(messageData));
            await redis.ltrim(`group:${data.groupId}:messages`, 0, 99); // Keep last 100 messages
          } else {
            socket.emit('error', { message: 'Not authorized to send messages to this group' });
          }
        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data: { groupId: string }) => {
        socket.to(`group:${data.groupId}`).emit('user_typing', {
          userId: user.id,
          username: user.username,
          groupId: data.groupId
        });
      });

      socket.on('typing_stop', (data: { groupId: string }) => {
        socket.to(`group:${data.groupId}`).emit('user_stopped_typing', {
          userId: user.id,
          groupId: data.groupId
        });
      });

      // Handle online status
      socket.on('update_status', (status: 'online' | 'away' | 'busy') => {
        socket.to('community').emit('user_status_changed', {
          userId: user.id,
          username: user.username,
          status
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${user.username} disconnected`);
        this.connectedUsers.delete(user.id);
        this.userRooms.delete(user.id);
        
        // Notify others that user went offline
        socket.to('community').emit('user_offline', {
          userId: user.id,
          username: user.username
        });
      });
    });
  }

  // Notification methods
  async sendNotification(userId: string, notification: NotificationData): Promise<void> {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.io.to(socketId).emit('notification', notification);
    }

    // Store notification in database for offline users
    await prisma.activity.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED', // Could add NOTIFICATION type
        title: notification.title,
        description: notification.message,
        metadata: notification.data
      }
    });
  }

  async sendNotificationToRoom(room: string, notification: NotificationData): Promise<void> {
    this.io.to(room).emit('room_notification', notification);
  }

  async sendNotificationToMultipleUsers(userIds: string[], notification: NotificationData): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification(userId, notification);
    }
  }

  // Real-time updates
  async notifyNewPost(post: any): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId: '', // Will be set per user
      type: 'new_post',
      title: 'New Post',
      message: `New post in ${post.category.name}: ${post.title}`,
      data: { postId: post.id, categoryId: post.categoryId },
      read: false,
      createdAt: new Date()
    };

    // Notify users following the category
    this.io.to(`category:${post.categoryId}`).emit('new_post', {
      post,
      notification
    });

    // Notify community
    this.io.to('community').emit('community_activity', {
      type: 'new_post',
      data: post
    });
  }

  async notifyNewComment(comment: any, post: any): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId: post.authorId,
      type: 'new_comment',
      title: 'New Comment',
      message: `${comment.author.username} commented on your post: ${post.title}`,
      data: { commentId: comment.id, postId: post.id },
      read: false,
      createdAt: new Date()
    };

    // Notify post author
    await this.sendNotification(post.authorId, notification);

    // Notify users following the post
    this.io.to(`post:${post.id}`).emit('new_comment', {
      comment,
      post
    });
  }

  async notifyFriendRequest(friendRequest: any): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId: friendRequest.receiverId,
      type: 'friend_request',
      title: 'Friend Request',
      message: `${friendRequest.sender.username} sent you a friend request`,
      data: { requestId: friendRequest.id, senderId: friendRequest.senderId },
      read: false,
      createdAt: new Date()
    };

    await this.sendNotification(friendRequest.receiverId, notification);
  }

  async notifyAchievementUnlocked(userId: string, achievement: any): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You unlocked: ${achievement.title}`,
      data: { achievementId: achievement.id, achievementType: achievement.achievementType },
      read: false,
      createdAt: new Date()
    };

    await this.sendNotification(userId, notification);

    // Notify friends
    const friendships = await prisma.friendship.findMany({
      where: { userId },
      select: { friendId: true }
    });

    const friendIds = friendships.map(f => f.friendId);
    if (friendIds.length > 0) {
      const friendNotification: NotificationData = {
        id: Date.now().toString(),
        userId: '', // Will be set per friend
        type: 'friend_achievement',
        title: 'Friend Achievement',
        message: `${achievement.user?.username} unlocked: ${achievement.title}`,
        data: { achievementId: achievement.id, friendId: userId },
        read: false,
        createdAt: new Date()
      };

      await this.sendNotificationToMultipleUsers(friendIds, friendNotification);
    }
  }

  async notifyStudyGroupActivity(groupId: string, activity: any): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId: '', // Will be set per member
      type: 'group_activity',
      title: 'Study Group Activity',
      message: activity.message,
      data: { groupId, activityId: activity.id },
      read: false,
      createdAt: new Date()
    };

    this.io.to(`group:${groupId}`).emit('group_activity', activity);
  }

  async notifyLeaderboardUpdate(type: string, period?: string): Promise<void> {
    const notification: NotificationData = {
      id: Date.now().toString(),
      userId: '',
      type: 'leaderboard_update',
      title: 'Leaderboard Updated',
      message: `${type} leaderboard has been updated`,
      data: { leaderboardType: type, period },
      read: false,
      createdAt: new Date()
    };

    this.io.to('community').emit('leaderboard_update', notification);
  }

  // Utility methods
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  getUserRooms(userId: string): string[] {
    return Array.from(this.userRooms.get(userId) || []);
  }

  async getGroupMessages(groupId: string, limit: number = 50): Promise<any[]> {
    const messages = await redis.lrange(`group:${groupId}:messages`, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg)).reverse();
  }

  // Cleanup methods
  async cleanup(): Promise<void> {
    this.connectedUsers.clear();
    this.userRooms.clear();
  }
}

export let webSocketService: WebSocketService;

export const initializeWebSocket = (server: HTTPServer): WebSocketService => {
  webSocketService = new WebSocketService(server);
  return webSocketService;
};
