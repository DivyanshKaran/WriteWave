import { logger } from '@/utils/logger';
import { storage } from '@/models';
import { Notification, NotificationStatus } from '@/types';

export class InAppService {
  constructor() {
    logger.info('In-app notification service initialized');
  }

  async sendInAppNotification(notificationData: {
    userId: string;
    title: string;
    content: string;
    data?: any;
    priority?: string;
    expiresAt?: Date;
  }): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      logger.info('Sending in-app notification', { userId: notificationData.userId });

      // Create notification record
      const notification: Notification = {
        id: Date.now().toString(),
        userId: notificationData.userId,
        type: 'IN_APP' as any,
        channel: 'IN_APP' as any,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data,
        status: NotificationStatus.DELIVERED,
        priority: (notificationData.priority as any) || 'NORMAL',
        retryCount: 0,
        maxRetries: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        sentAt: new Date()
      };

      // Store notification in database
      await storage.createNotification(notification);

      // In a real implementation, you would:
      // 1. Store the notification in the user's in-app notification list
      // 2. Send real-time update via WebSocket to the user's active sessions
      // 3. Update unread count
      // 4. Trigger any client-side notifications

      logger.info('In-app notification sent successfully', { 
        notificationId: notification.id, 
        userId: notificationData.userId 
      });

      return { 
        success: true, 
        notificationId: notification.id 
      };

    } catch (error) {
      logger.error('Error sending in-app notification', { 
        userId: notificationData.userId, 
        error: error.message 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendBulkInAppNotifications(
    notifications: Array<{
      userId: string;
      title: string;
      content: string;
      data?: any;
      priority?: string;
    }>
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Sending bulk in-app notifications', { count: notifications.length });

    for (const notificationData of notifications) {
      try {
        const result = await this.sendInAppNotification(notificationData);
        results.push(result);
      } catch (error) {
        errors.push({
          userId: notificationData.userId,
          error: error.message
        });
      }
    }

    logger.info('Bulk in-app notification sending completed', { 
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

  async getUserNotifications(
    userId: string, 
    limit: number = 50, 
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    try {
      logger.info('Getting user notifications', { userId, limit, offset, unreadOnly });

      // Get all notifications for user
      const allNotifications = await storage.getNotificationsByUser(userId, 1000, 0);
      
      // Filter in-app notifications
      const inAppNotifications = allNotifications.filter(n => n.channel === 'IN_APP');
      
      // Filter unread if requested
      const filteredNotifications = unreadOnly 
        ? inAppNotifications.filter(n => n.status === 'DELIVERED')
        : inAppNotifications;

      // Apply pagination
      const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);
      
      // Count unread notifications
      const unreadCount = inAppNotifications.filter(n => n.status === 'DELIVERED').length;

      return {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
        unreadCount
      };

    } catch (error) {
      logger.error('Error getting user notifications', { userId, error: error.message });
      return {
        notifications: [],
        total: 0,
        unreadCount: 0
      };
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      logger.info('Marking notification as read', { notificationId, userId });

      const notification = await storage.getNotification(notificationId);
      if (!notification || notification.userId !== userId) {
        logger.warn('Notification not found or access denied', { notificationId, userId });
        return false;
      }

      // Update notification status to opened
      await storage.updateNotification(notificationId, { 
        status: NotificationStatus.OPENED 
      });

      logger.info('Notification marked as read', { notificationId, userId });
      return true;

    } catch (error) {
      logger.error('Error marking notification as read', { 
        notificationId, 
        userId, 
        error: error.message 
      });
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      logger.info('Marking all notifications as read', { userId });

      // Get all unread notifications for user
      const notifications = await storage.getNotificationsByUser(userId, 1000, 0);
      const unreadNotifications = notifications.filter(n => 
        n.channel === 'IN_APP' && n.status === 'DELIVERED'
      );

      // Mark all as read
      let markedCount = 0;
      for (const notification of unreadNotifications) {
        await storage.updateNotification(notification.id, { 
          status: NotificationStatus.OPENED 
        });
        markedCount++;
      }

      logger.info('All notifications marked as read', { userId, count: markedCount });
      return markedCount;

    } catch (error) {
      logger.error('Error marking all notifications as read', { 
        userId, 
        error: error.message 
      });
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      logger.info('Deleting notification', { notificationId, userId });

      const notification = await storage.getNotification(notificationId);
      if (!notification || notification.userId !== userId) {
        logger.warn('Notification not found or access denied', { notificationId, userId });
        return false;
      }

      // Delete notification
      await storage.deleteNotification(notificationId);

      logger.info('Notification deleted', { notificationId, userId });
      return true;

    } catch (error) {
      logger.error('Error deleting notification', { 
        notificationId, 
        userId, 
        error: error.message 
      });
      return false;
    }
  }

  async deleteAllNotifications(userId: string): Promise<number> {
    try {
      logger.info('Deleting all notifications', { userId });

      // Get all notifications for user
      const notifications = await storage.getNotificationsByUser(userId, 1000, 0);
      const inAppNotifications = notifications.filter(n => n.channel === 'IN_APP');

      // Delete all
      let deletedCount = 0;
      for (const notification of inAppNotifications) {
        await storage.deleteNotification(notification.id);
        deletedCount++;
      }

      logger.info('All notifications deleted', { userId, count: deletedCount });
      return deletedCount;

    } catch (error) {
      logger.error('Error deleting all notifications', { 
        userId, 
        error: error.message 
      });
      return 0;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await storage.getNotificationsByUser(userId, 1000, 0);
      const unreadCount = notifications.filter(n => 
        n.channel === 'IN_APP' && n.status === 'DELIVERED'
      ).length;

      return unreadCount;

    } catch (error) {
      logger.error('Error getting unread count', { userId, error: error.message });
      return 0;
    }
  }

  async createNotificationTemplate(
    name: string,
    title: string,
    content: string,
    variables: string[] = []
  ): Promise<{ success: boolean; templateId?: string; error?: string }> {
    try {
      logger.info('Creating notification template', { name });

      // In a real implementation, you would store this in a templates table
      const templateId = `template_${Date.now()}`;
      
      logger.info('Notification template created', { templateId, name });
      return { 
        success: true, 
        templateId 
      };

    } catch (error) {
      logger.error('Error creating notification template', { 
        name, 
        error: error.message 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendTemplateNotification(
    userId: string,
    templateId: string,
    variables: any = {}
  ): Promise<{ success: boolean; notificationId?: string; error?: string }> {
    try {
      logger.info('Sending template notification', { userId, templateId });

      // In a real implementation, you would:
      // 1. Fetch the template
      // 2. Render the template with variables
      // 3. Send the notification

      const title = `Template Notification ${templateId}`;
      const content = `This is a template notification with variables: ${JSON.stringify(variables)}`;

      return await this.sendInAppNotification({
        userId,
        title,
        content,
        data: { templateId, variables }
      });

    } catch (error) {
      logger.error('Error sending template notification', { 
        userId, 
        templateId, 
        error: error.message 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async getNotificationStats(userId: string): Promise<any> {
    try {
      const notifications = await storage.getNotificationsByUser(userId, 1000, 0);
      const inAppNotifications = notifications.filter(n => n.channel === 'IN_APP');

      const total = inAppNotifications.length;
      const unread = inAppNotifications.filter(n => n.status === 'DELIVERED').length;
      const read = inAppNotifications.filter(n => n.status === 'OPENED').length;
      const clicked = inAppNotifications.filter(n => n.status === 'CLICKED').length;

      return {
        total,
        unread,
        read,
        clicked,
        readRate: total > 0 ? (read / total) * 100 : 0,
        clickRate: read > 0 ? (clicked / read) * 100 : 0
      };

    } catch (error) {
      logger.error('Error getting notification stats', { userId, error: error.message });
      return {
        total: 0,
        unread: 0,
        read: 0,
        clicked: 0,
        readRate: 0,
        clickRate: 0
      };
    }
  }

  async cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
    try {
      logger.info('Cleaning up old notifications', { retentionDays });

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      // Get all notifications
      const allNotifications = await storage.getNotificationsByUser('all', 10000, 0);
      const oldNotifications = allNotifications.filter(n => 
        n.channel === 'IN_APP' && n.createdAt < cutoffDate
      );

      // Delete old notifications
      let deletedCount = 0;
      for (const notification of oldNotifications) {
        await storage.deleteNotification(notification.id);
        deletedCount++;
      }

      logger.info('Old notifications cleaned up', { deletedCount });
      return deletedCount;

    } catch (error) {
      logger.error('Error cleaning up old notifications', { 
        retentionDays, 
        error: error.message 
      });
      return 0;
    }
  }
}

export const inAppService = new InAppService();
