import { logger } from '../utils/logger';
import { storage, generateId } from '../models';
import { QueueService } from '../workers/queue';
import { 
  Notification, 
  CreateNotificationRequest, 
  UpdateNotificationRequest,
  NotificationStatus,
  NotificationChannel,
  NotificationType,
  NotificationPriority
} from '../types';
import { userServiceClient } from '../../../shared/utils/user-service-client';
import { createConsumer, Topics } from '../../../shared/utils/kafka';

export class NotificationService {
  constructor() {
    logger.info('Notification service initialized');
    if (process.env.ENABLE_KAFKA === 'true') {
      this.startKafkaConsumer().catch(e => logger.error('Notification Kafka consumer failed to start', { error: e.message }));
    }
  }

  private async startKafkaConsumer(): Promise<void> {
    const consumer = await createConsumer('notification-service');
    await consumer.subscribe({ topics: [Topics.ARTICLES_EVENTS, Topics.COMMUNITY_EVENTS, Topics.USER_EVENTS, Topics.PROGRESS_EVENTS], fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) return;
          const event = JSON.parse(message.value.toString());
          logger.info('Notification Consumer received event', { topic, eventType: event.type, eventId: event.id });
          
          // Handle different event types and trigger appropriate notifications
          await this.handleKafkaEvent(topic, event);
        } catch (e: any) {
          logger.error('Notification Consumer error', { error: e.message, stack: e.stack, topic, message: message.value?.toString() });
        }
      }
    });
    logger.info('Notification Kafka consumer running', { topics: [Topics.ARTICLES_EVENTS, Topics.COMMUNITY_EVENTS, Topics.USER_EVENTS, Topics.PROGRESS_EVENTS] });
  }

  private async handleKafkaEvent(topic: string, event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'article.liked':
          await this.handleArticleLikedEvent(event);
          break;
        case 'article.created':
          // Optionally notify followers when user publishes an article
          // This would require a follow/subscription system
          logger.debug('Article created event received (no notification action configured)', { articleId: event.id });
          break;
        case 'comment.created':
          await this.handleCommentCreatedEvent(event);
          break;
        case 'post.created':
          // Optionally notify followers or category subscribers
          logger.debug('Post created event received (no notification action configured ranges)', { postId: event.id });
          break;
        case 'user.created':
          // Welcome notification for new users
          await this.handleUserCreatedEvent(event);
          break;
        case 'achievement.unlocked':
          await this.handleAchievementUnlockedEvent(event);
          break;
        case 'xp.earned':
          // Optionally send milestone notifications (e.g., level up)
          logger.debug('XP earned event received (no notification action configured)', { userId: event.userId });
          break;
        default:
          logger.debug('Unhandled event type in notification service', { eventType: event.type, topic });
      }
    } catch (error) {
      logger.error('Error handling Kafka event', { error: (error as any).message, eventType: event.type, eventId: event.id });
    }
  }

  private async handleArticleLikedEvent(event: any): Promise<void> {
    try {
      // Get article details to find the author
      const articleId = event.id || event.articleId;
      const likerUserId = event.userId;
      
      if (!articleId || !likerUserId) {
        logger.warn('Article liked event missing required fields', { event });
        return;
      }

      // Fetch article author from articles-service (via HTTP or get from event payload if available)
      // For now, we'll assume the authorId is in the event payload or we'd need to fetch it
      const authorId = event.authorId;
      if (!authorId || authorId === likerUserId) {
        // Don't notify if user likes their own article
        return;
      }

      // Fetch liker's profile from user-service for display name
      const adminToken = process.env.USER_SERVICE_ADMIN_TOKEN;
      let likerProfile: any = null;
      if (adminToken) {
        try {
          likerProfile = await userServiceClient.getUserByIdAdmin(likerUserId, adminToken);
        } catch (error) {
          logger.warn('Failed to fetch liker profile', { error: (error as any).message, likerUserId });
        }
      }
      const likerName = likerProfile?.firstName || likerProfile?.username || 'Someone';

      // Create in-app notification for article author
      await this.createNotification({
        userId: authorId,
        type: NotificationType.POST_LIKED, // Using POST_LIKED as closest match
        channel: NotificationChannel.IN_APP,
        title: 'Your article received a like',
        content: `${likerName} liked your article`,
        data: {
          articleId,
          likerId: likerUserId,
          likerName,
          likerAvatar: likerProfile?.avatar,
        },
        priority: NotificationPriority.LOW,
      });

      logger.info('Notification created for article like', { articleId, authorId, likerUserId });
    } catch (error) {
      logger.error('Error handling article liked event', { error: (error as any).message, event });
    }
  }

  private async handleCommentCreatedEvent(event: any): Promise<void> {
    try {
      const commentId = event.id || event.commentId;
      const authorId = event.authorId;
      const postId = event.postId;
      const parentId = event.parentId; // For nested comments
      
      if (!commentId || !authorId) {
        logger.warn('Comment created event missing required fields', { event });
        return;
      }

      // Fetch comment author profile
      const adminToken = process.env.USER_SERVICE_ADMIN_TOKEN;
      let commenterProfile: any = null;
      if (adminToken) {
        try {
          commenterProfile = await userServiceClient.getUserByIdAdmin(authorId, adminToken);
        } catch (error) {
          logger.warn('Failed to fetch commenter profile', { error: (error as any).message, authorId });
        }
      }
      const commenterName = commenterProfile?.firstName || commenterProfile?.username || 'Someone';

      // If it's a reply to another comment, notify the parent comment author
      if (parentId) {
        // We'd need to fetch the parent comment to get its author
        // For now, this is a placeholder - you'd need to call community-service API
        logger.debug('Nested comment created (parent notification not implemented)', { commentId, parentId });
      }

      // If it's a comment on a post, notify the post author
      if (postId) {
        const postAuthorId = event.postAuthorId; // Should be in event payload
        if (postAuthorId && postAuthorId !== authorId) {
          await this.createNotification({
            userId: postAuthorId,
            type: NotificationType.COMMENT_ADDED,
            channel: NotificationChannel.IN_APP,
            title: 'New comment on your post',
            content: `${commenterName} commented on your post`,
            data: {
              commentId,
              postId,
              commenterId: authorId,
              commenterName,
              commenterAvatar: commenterProfile?.avatar,
            },
            priority: NotificationPriority.NORMAL,
          });
          logger.info('Notification created for post comment', { postId, postAuthorId, commenterId: authorId });
        }
      }
    } catch (error) {
      logger.error('Error handling comment created event', { error: (error as any).message, event });
    }
  }

  private async handleUserCreatedEvent(event: any): Promise<void> {
    try {
      const userId = event.id || event.userId;
      if (!userId) {
        logger.warn('User created event missing userId', { event });
        return;
      }

      // Send welcome notification to new user
      await this.createNotification({
        userId,
        type: NotificationType.SYSTEM_UPDATE,
        channel: NotificationChannel.IN_APP,
        title: 'Welcome to WriteWave!',
        content: 'Thank you for joining WriteWave. Start your learning journey today!',
        data: {
          welcomeMessage: true,
        },
        priority: NotificationPriority.NORMAL,
      });

      logger.info('Welcome notification created for new user', { userId });
    } catch (error) {
      logger.error('Error handling user created event', { error: (error as any).message, event });
    }
  }

  private async handleAchievementUnlockedEvent(event: any): Promise<void> {
    try {
      const userId = event.userId;
      const achievementId = event.achievementId;
      const achievementName = event.name || event.achievementName;
      
      if (!userId || !achievementId) {
        logger.warn('Achievement unlocked event missing required fields', { event });
        return;
      }

      await this.createNotification({
        userId,
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        channel: NotificationChannel.IN_APP,
        title: 'Achievement Unlocked! 🎉',
        content: `You've unlocked the achievement: ${achievementName || 'New Achievement'}`,
        data: {
          achievementId,
          achievementName,
          xpReward: event.xpReward,
        },
        priority: NotificationPriority.HIGH,
      });

      logger.info('Achievement notification created', { userId, achievementId, achievementName });
    } catch (error) {
      logger.error('Error handling achievement unlocked event', { error: (error as any).message, event });
    }
  }

  async createNotification(notificationData: CreateNotificationRequest): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      logger.info('Creating notification', { 
        userId: notificationData.userId, 
        type: notificationData.type, 
        channel: notificationData.channel 
      });

      // Validate user exists and (optionally) fetch preferences from user-service
      const adminToken = process.env.USER_SERVICE_ADMIN_TOKEN;
      if (!adminToken) {
        logger.warn('USER_SERVICE_ADMIN_TOKEN not set; skipping user existence validation');
      } else {
        try {
          const user = await userServiceClient.getUserByIdAdmin(notificationData.userId, adminToken) as any;
          const settings = user?.settings || {};

          // Determine if this notification should be sent based on preferences
          const channelAllowed = this.isChannelAllowed(notificationData.channel, settings);
          const globalEnabled = settings?.notificationsEnabled !== false; // default true

          if (!globalEnabled || !channelAllowed) {
            // Store as cancelled/skipped for audit trail
            const skippedNotification: Notification = {
              id: generateId(),
              userId: notificationData.userId,
              type: notificationData.type,
              channel: notificationData.channel,
              title: notificationData.title,
              content: notificationData.content,
              data: notificationData.data,
              templateId: notificationData.templateId,
              scheduledAt: notificationData.scheduledAt,
              status: NotificationStatus.CANCELLED,
              priority: notificationData.priority || NotificationPriority.NORMAL,
              retryCount: 0,
              maxRetries: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
              metadata: {
                ...(notificationData.metadata || {}),
                skipReason: !globalEnabled ? 'notifications_disabled' : 'channel_disabled',
              },
            };

            await storage.createNotification(skippedNotification);
            logger.info('Notification skipped due to user preferences', { userId: notificationData.userId, channel: notificationData.channel });
            return { success: true, notification: skippedNotification };
          }
        } catch (e: any) {
          logger.warn('User validation failed in user-service', { userId: notificationData.userId, error: e.message });
          return { success: false, error: 'USER_NOT_FOUND' };
        }
      }

      // Create notification record
      const notification: Notification = {
        id: generateId(),
        userId: notificationData.userId,
        type: notificationData.type,
        channel: notificationData.channel,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data,
        templateId: notificationData.templateId,
        scheduledAt: notificationData.scheduledAt,
        status: notificationData.scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.PENDING,
        priority: notificationData.priority || NotificationPriority.NORMAL,
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: notificationData.metadata
      };

      // Store notification
      await storage.createNotification(notification);

      // Add to queue for processing
      if (!notificationData.scheduledAt) {
        await QueueService.addNotification(notificationData);
      }

      logger.info('Notification created successfully', { notificationId: notification.id });
      return { success: true, notification };

    } catch (error) {
      logger.error('Error creating notification', { 
        userId: notificationData.userId, 
        error: (error as any).message 
      });
      return { success: false, error: (error as any).message };
    }
  }

  private isChannelAllowed(channel: NotificationChannel, settings: any): boolean {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return settings?.emailNotifications !== false;
      case NotificationChannel.PUSH:
        return settings?.pushNotifications !== false;
      case NotificationChannel.SMS:
        return settings?.smsNotifications !== false;
      case NotificationChannel.IN_APP:
        // In-app usually always allowed unless globally disabled
        return true;
      default:
        return true;
    }
  }

  async getNotification(notificationId: string): Promise<Notification | null> {
    try {
      return await storage.getNotification(notificationId);
    } catch (error) {
      logger.error('Error getting notification', { notificationId, error: error.message });
      return null;
    }
  }

  async updateNotification(
    notificationId: string, 
    updates: UpdateNotificationRequest
  ): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      logger.info('Updating notification', { notificationId });

      const updatedNotification = await storage.updateNotification(notificationId, updates);
      if (!updatedNotification) {
        return { success: false, error: 'Notification not found' };
      }

      logger.info('Notification updated successfully', { notificationId });
      return { success: true, notification: updatedNotification };

    } catch (error) {
      logger.error('Error updating notification', { notificationId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getUserNotifications(
    userId: string, 
    limit: number = 50, 
    offset: number = 0,
    status?: NotificationStatus
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      logger.info('Getting user notifications', { userId, limit, offset, status });

      const notifications = await storage.getNotificationsByUser(userId, limit, offset);
      
      // Filter by status if provided
      const filteredNotifications = status 
        ? notifications.filter(n => n.status === status)
        : notifications;

      return {
        notifications: filteredNotifications,
        total: filteredNotifications.length
      };

    } catch (error) {
      logger.error('Error getting user notifications', { userId, error: error.message });
      return { notifications: [], total: 0 };
    }
  }

  async getNotificationsByStatus(
    status: NotificationStatus, 
    limit: number = 100
  ): Promise<Notification[]> {
    try {
      return await storage.getNotificationsByStatus(status, limit);
    } catch (error) {
      logger.error('Error getting notifications by status', { status, error: error.message });
      return [];
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      logger.info('Deleting notification', { notificationId });
      return await storage.deleteNotification(notificationId);
    } catch (error) {
      logger.error('Error deleting notification', { notificationId, error: error.message });
      return false;
    }
  }

  async sendBulkNotifications(
    notifications: CreateNotificationRequest[]
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Sending bulk notifications', { count: notifications.length });

    for (const notificationData of notifications) {
      try {
        const result = await this.createNotification(notificationData);
        results.push(result);
      } catch (error) {
        errors.push({
          userId: notificationData.userId,
          error: error.message
        });
      }
    }

    logger.info('Bulk notification sending completed', { 
      total: notifications.length, 
      successful: results.length, 
      failed: errors.length 
    });

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async sendNotificationToUsers(
    userIds: string[], 
    notificationData: Omit<CreateNotificationRequest, 'userId'>
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const notifications = userIds.map(userId => ({
      ...notificationData,
      userId
    }));

    return await this.sendBulkNotifications(notifications);
  }

  async sendNotificationToAllUsers(
    notificationData: Omit<CreateNotificationRequest, 'userId'>
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    try {
      // In a real implementation, you would fetch all active users
      // For now, we'll use a mock approach
      const allUsers = await this.getAllActiveUsers();
      const userIds = allUsers.map(user => user.id);

      return await this.sendNotificationToUsers(userIds, notificationData);

    } catch (error) {
      logger.error('Error sending notification to all users', { error: error.message });
      return { success: false, results: [], errors: [{ error: error.message }] };
    }
  }

  async sendNotificationByType(
    type: NotificationType, 
    notificationData: Omit<CreateNotificationRequest, 'userId' | 'type'>
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    try {
      // Get users who should receive this type of notification
      const targetUsers = await this.getUsersForNotificationType(type);
      const userIds = targetUsers.map(user => user.id);

      const notifications = userIds.map(userId => ({
        ...notificationData,
        userId,
        type
      }));

      return await this.sendBulkNotifications(notifications);

    } catch (error) {
      logger.error('Error sending notification by type', { type, error: error.message });
      return { success: false, results: [], errors: [{ error: error.message }] };
    }
  }

  async retryFailedNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Retrying failed notification', { notificationId });

      const notification = await storage.getNotification(notificationId);
      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      if (notification.status !== NotificationStatus.FAILED) {
        return { success: false, error: 'Notification is not in failed state' };
      }

      if (notification.retryCount >= notification.maxRetries) {
        return { success: false, error: 'Maximum retry attempts reached' };
      }

      // Update retry count and status
      await storage.updateNotification(notificationId, {
        status: NotificationStatus.PENDING,
        retryCount: notification.retryCount + 1,
        errorMessage: undefined
      });

      // Add to queue for retry
      const notificationData: CreateNotificationRequest = {
        userId: notification.userId,
        type: notification.type,
        channel: notification.channel,
        title: notification.title,
        content: notification.content,
        data: notification.data,
        templateId: notification.templateId,
        priority: notification.priority,
        metadata: notification.metadata
      };

      await QueueService.addNotification(notificationData);

      logger.info('Failed notification retried successfully', { notificationId });
      return { success: true };

    } catch (error) {
      logger.error('Error retrying failed notification', { notificationId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async cancelScheduledNotification(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Cancelling scheduled notification', { notificationId });

      const notification = await storage.getNotification(notificationId);
      if (!notification) {
        return { success: false, error: 'Notification not found' };
      }

      if (notification.status !== NotificationStatus.SCHEDULED) {
        return { success: false, error: 'Notification is not scheduled' };
      }

      // Update status to cancelled
      await storage.updateNotification(notificationId, {
        status: NotificationStatus.CANCELLED
      });

      // Cancel the job in the queue
      // This would require implementing job cancellation in the queue service

      logger.info('Scheduled notification cancelled successfully', { notificationId });
      return { success: true };

    } catch (error) {
      logger.error('Error cancelling scheduled notification', { notificationId, error: error.message });
      return { success: false, error: error.message };
    }
  }

  async getNotificationStats(startDate: Date, endDate: Date): Promise<any> {
    try {
      return await storage.getNotificationStats(startDate, endDate);
    } catch (error) {
      logger.error('Error getting notification stats', { error: error.message });
      return {};
    }
  }

  async cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
    try {
      logger.info('Cleaning up old notifications', { retentionDays });
      await storage.cleanupOldData(retentionDays);
      return 0; // Return actual count in real implementation
    } catch (error) {
      logger.error('Error cleaning up old notifications', { retentionDays, error: error.message });
      return 0;
    }
  }

  // Helper methods (these would typically fetch from user service)
  private async getAllActiveUsers(): Promise<any[]> {
    // Mock implementation - in real app, fetch from user service
    return [
      { id: 'user1', email: 'user1@example.com', isActive: true },
      { id: 'user2', email: 'user2@example.com', isActive: true },
      { id: 'user3', email: 'user3@example.com', isActive: true }
    ];
  }

  private async getUsersForNotificationType(type: NotificationType): Promise<any[]> {
    // Mock implementation - in real app, fetch users based on notification type
    return await this.getAllActiveUsers();
  }

  async validateNotificationData(notificationData: CreateNotificationRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check required fields
    if (!notificationData.userId) errors.push('User ID is required');
    if (!notificationData.type) errors.push('Type is required');
    if (!notificationData.channel) errors.push('Channel is required');
    if (!notificationData.title) errors.push('Title is required');
    if (!notificationData.content) errors.push('Content is required');

    // Check content length
    if (notificationData.title && notificationData.title.length > 200) {
      errors.push('Title is too long (max 200 characters)');
    }

    if (notificationData.content && notificationData.content.length > 1000) {
      errors.push('Content is too long (max 1000 characters)');
    }

    // Check scheduled time
    if (notificationData.scheduledAt && new Date(notificationData.scheduledAt) <= new Date()) {
      errors.push('Scheduled time must be in the future');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const notificationService = new NotificationService();
