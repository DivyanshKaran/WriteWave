import { logger } from '@/utils/logger';
import { storage, generateId } from '@/models';
import { QueueService } from '@/workers/queue';
import { 
  Notification, 
  CreateNotificationRequest, 
  UpdateNotificationRequest,
  NotificationStatus,
  NotificationChannel,
  NotificationType
} from '@/types';

export class NotificationService {
  constructor() {
    logger.info('Notification service initialized');
  }

  async createNotification(notificationData: CreateNotificationRequest): Promise<{ success: boolean; notification?: Notification; error?: string }> {
    try {
      logger.info('Creating notification', { 
        userId: notificationData.userId, 
        type: notificationData.type, 
        channel: notificationData.channel 
      });

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
        priority: notificationData.priority || 'NORMAL',
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
        error: error.message 
      });
      return { success: false, error: error.message };
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
