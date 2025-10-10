import webpush from 'web-push';
import { logger } from '@/utils/logger';
import { PushNotificationData, PushSubscription } from '@/types';

export class PushService {
  private vapidKeys: {
    publicKey: string;
    privateKey: string;
  };

  constructor() {
    this.initializeVapidKeys();
    this.setupWebPush();
  }

  private initializeVapidKeys(): void {
    this.vapidKeys = {
      publicKey: process.env.VAPID_PUBLIC_KEY || '',
      privateKey: process.env.VAPID_PRIVATE_KEY || ''
    };

    if (!this.vapidKeys.publicKey || !this.vapidKeys.privateKey) {
      logger.warn('VAPID keys not configured, push notifications will not work');
    }
  }

  private setupWebPush(): void {
    if (this.vapidKeys.publicKey && this.vapidKeys.privateKey) {
      webpush.setVapidDetails(
        process.env.VAPID_SUBJECT || 'mailto:admin@writewave.com',
        this.vapidKeys.publicKey,
        this.vapidKeys.privateKey
      );
      logger.info('Web Push service initialized');
    }
  }

  async sendPushNotification(
    subscription: PushSubscription, 
    notificationData: PushNotificationData
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      logger.info('Sending push notification', { 
        userId: subscription.userId, 
        endpoint: subscription.endpoint.substring(0, 50) + '...' 
      });

      const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth
        }
      };

      const payload = JSON.stringify({
        title: notificationData.title,
        body: notificationData.body,
        icon: notificationData.icon || '/icon-192x192.png',
        badge: notificationData.badge || '/badge-72x72.png',
        image: notificationData.image,
        data: notificationData.data,
        actions: notificationData.actions,
        requireInteraction: notificationData.requireInteraction || false,
        silent: notificationData.silent || false,
        tag: notificationData.tag,
        renotify: notificationData.renotify || false,
        timestamp: notificationData.timestamp || Date.now(),
        vibrate: notificationData.vibrate,
        url: notificationData.url
      });

      const options = {
        TTL: 24 * 60 * 60, // 24 hours
        urgency: 'normal' as const,
        topic: notificationData.tag
      };

      const result = await webpush.sendNotification(pushSubscription, payload, options);
      
      logger.info('Push notification sent successfully', { 
        userId: subscription.userId,
        statusCode: result.statusCode 
      });

      return { 
        success: true, 
        messageId: result.headers['location'] || 'unknown' 
      };

    } catch (error) {
      logger.error('Error sending push notification', { 
        userId: subscription.userId, 
        error: error.message 
      });

      // Handle specific error cases
      if (error.statusCode === 410) {
        // Subscription is no longer valid
        logger.warn('Push subscription is no longer valid', { userId: subscription.userId });
        return { 
          success: false, 
          error: 'Subscription expired' 
        };
      }

      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async sendBulkPushNotifications(
    subscriptions: PushSubscription[], 
    notificationData: PushNotificationData
  ): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Sending bulk push notifications', { count: subscriptions.length });

    // Process subscriptions in batches to avoid overwhelming the service
    const batchSize = 10;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      
      const batchResults = await Promise.allSettled(
        batch.map(subscription => this.sendPushNotification(subscription, notificationData))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          errors.push({
            userId: batch[index].userId,
            error: result.reason
          });
        }
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < subscriptions.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logger.info('Bulk push notification sending completed', { 
      total: subscriptions.length, 
      successful: results.length, 
      failed: errors.length 
    });

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async validateSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      // Send a test notification to validate the subscription
      const testNotification: PushNotificationData = {
        title: 'Test',
        body: 'This is a test notification',
        silent: true
      };

      const result = await this.sendPushNotification(subscription, testNotification);
      return result.success;

    } catch (error) {
      logger.error('Error validating push subscription', { 
        userId: subscription.userId, 
        error: error.message 
      });
      return false;
    }
  }

  async getVapidPublicKey(): Promise<string> {
    return this.vapidKeys.publicKey;
  }

  async generateVapidKeys(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const vapidKeys = webpush.generateVAPIDKeys();
      logger.info('Generated new VAPID keys');
      return vapidKeys;
    } catch (error) {
      logger.error('Error generating VAPID keys', { error: error.message });
      throw error;
    }
  }

  async sendNotificationToUser(
    userId: string, 
    notificationData: PushNotificationData,
    subscriptions?: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    try {
      // If subscriptions are not provided, we would need to fetch them from storage
      // For now, we'll assume they're provided
      if (!subscriptions || subscriptions.length === 0) {
        logger.warn('No push subscriptions found for user', { userId });
        return { success: false, sent: 0, failed: 0 };
      }

      const result = await this.sendBulkPushNotifications(subscriptions, notificationData);
      
      return {
        success: result.success,
        sent: result.results.length,
        failed: result.errors.length
      };

    } catch (error) {
      logger.error('Error sending notification to user', { userId, error: error.message });
      return { success: false, sent: 0, failed: 0 };
    }
  }

  async sendNotificationToTopic(
    topic: string, 
    notificationData: PushNotificationData,
    subscriptions: PushSubscription[]
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    try {
      // Filter subscriptions by topic (if you implement topic-based subscriptions)
      const topicSubscriptions = subscriptions.filter(sub => 
        sub.metadata?.topics?.includes(topic)
      );

      if (topicSubscriptions.length === 0) {
        logger.warn('No subscriptions found for topic', { topic });
        return { success: false, sent: 0, failed: 0 };
      }

      const result = await this.sendBulkPushNotifications(topicSubscriptions, notificationData);
      
      return {
        success: result.success,
        sent: result.results.length,
        failed: result.errors.length
      };

    } catch (error) {
      logger.error('Error sending notification to topic', { topic, error: error.message });
      return { success: false, sent: 0, failed: 0 };
    }
  }

  async createNotificationPayload(
    title: string, 
    body: string, 
    options: Partial<PushNotificationData> = {}
  ): Promise<PushNotificationData> {
    return {
      title,
      body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      image: options.image,
      data: options.data,
      actions: options.actions,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      tag: options.tag,
      renotify: options.renotify || false,
      timestamp: options.timestamp || Date.now(),
      vibrate: options.vibrate,
      url: options.url
    };
  }

  async sendScheduledNotification(
    subscription: PushSubscription, 
    notificationData: PushNotificationData, 
    scheduledTime: Date
  ): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const delay = scheduledTime.getTime() - Date.now();
      
      if (delay <= 0) {
        // Send immediately if scheduled time has passed
        return await this.sendPushNotification(subscription, notificationData);
      }

      // For scheduled notifications, you would typically use a job queue
      // This is a simplified implementation
      setTimeout(async () => {
        await this.sendPushNotification(subscription, notificationData);
      }, delay);

      logger.info('Scheduled push notification', { 
        userId: subscription.userId, 
        scheduledTime: scheduledTime.toISOString() 
      });

      return { 
        success: true, 
        jobId: `scheduled_${Date.now()}` 
      };

    } catch (error) {
      logger.error('Error scheduling push notification', { 
        userId: subscription.userId, 
        error: error.message 
      });
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  async getPushStats(): Promise<any> {
    // This would typically fetch statistics from your database
    // For now, return mock data
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      notificationsSent: 0,
      deliveryRate: 0,
      openRate: 0
    };
  }

  async cleanupExpiredSubscriptions(): Promise<number> {
    // This would typically clean up expired subscriptions from your database
    // For now, return 0
    return 0;
  }
}

export const pushService = new PushService();
