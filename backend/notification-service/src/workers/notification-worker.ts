import { notificationQueue, emailQueue, pushQueue, smsQueue, inAppQueue, scheduledQueue, analyticsQueue } from './queue';
import { logger } from '@/utils/logger';
import { NotificationService } from '@/services/notification.service';
import { EmailService } from '@/services/email.service';
import { PushService } from '@/services/push.service';
import { SMSService } from '@/services/sms.service';
import { InAppService } from '@/services/in-app.service';
import { AnalyticsService } from '@/services/analytics.service';
import { 
  Notification, 
  NotificationChannel, 
  NotificationStatus,
  CreateNotificationRequest,
  CreateScheduledNotificationRequest
} from '@/types';
import { storage, generateId } from '@/models';

// Initialize services
const notificationService = new NotificationService();
const emailService = new EmailService();
const pushService = new PushService();
const smsService = new SMSService();
const inAppService = new InAppService();
const analyticsService = new AnalyticsService();

// Main notification processor
notificationQueue.process('process-notification', async (job) => {
  const { userId, type, channel, title, content, data, templateId, priority, metadata } = job.data as CreateNotificationRequest;
  
  try {
    logger.info(`Processing notification`, { jobId: job.id, userId, type, channel });

    // Create notification record
    const notification: Notification = {
      id: generateId(),
      userId,
      type,
      channel,
      title,
      content,
      data,
      templateId,
      status: NotificationStatus.PROCESSING,
      priority: priority || 'NORMAL',
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    };

    await storage.createNotification(notification);

    // Route to appropriate channel processor
    switch (channel) {
      case NotificationChannel.EMAIL:
        await emailQueue.add('send-email', { notification, jobId: job.id });
        break;
      case NotificationChannel.PUSH:
        await pushQueue.add('send-push', { notification, jobId: job.id });
        break;
      case NotificationChannel.SMS:
        await smsQueue.add('send-sms', { notification, jobId: job.id });
        break;
      case NotificationChannel.IN_APP:
        await inAppQueue.add('send-in-app', { notification, jobId: job.id });
        break;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }

    // Update notification status
    await storage.updateNotification(notification.id, { status: NotificationStatus.SENT });

    // Add analytics job
    await analyticsQueue.add('track-delivery', { notificationId: notification.id, event: 'sent' });

    logger.info(`Notification processed successfully`, { notificationId: notification.id });
    return { success: true, notificationId: notification.id };

  } catch (error) {
    logger.error(`Error processing notification`, { jobId: job.id, error: error.message });
    throw error;
  }
});

// Email processor
emailQueue.process('send-email', async (job) => {
  const { notification, jobId } = job.data;
  
  try {
    logger.info(`Sending email notification`, { jobId, notificationId: notification.id });

    // Get user preferences
    const preferences = await storage.getPreferences(notification.userId);
    if (!preferences?.emailEnabled) {
      logger.info(`Email disabled for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'email_disabled' };
    }

    // Get user data
    const user = await storage.getUser(notification.userId);
    if (!user) {
      throw new Error(`User not found: ${notification.userId}`);
    }

    // Send email
    const result = await emailService.sendEmail({
      to: user.email,
      subject: notification.title,
      html: notification.content,
      data: notification.data
    });

    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.DELIVERED,
      sentAt: new Date()
    });

    // Add analytics job
    await analyticsQueue.add('track-delivery', { 
      notificationId: notification.id, 
      event: 'delivered',
      channel: 'email',
      providerId: result.messageId
    });

    logger.info(`Email sent successfully`, { notificationId: notification.id, messageId: result.messageId });
    return { success: true, messageId: result.messageId };

  } catch (error) {
    logger.error(`Error sending email`, { jobId, notificationId: notification.id, error: error.message });
    
    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.FAILED,
      errorMessage: error.message
    });

    throw error;
  }
});

// Push notification processor
pushQueue.process('send-push', async (job) => {
  const { notification, jobId } = job.data;
  
  try {
    logger.info(`Sending push notification`, { jobId, notificationId: notification.id });

    // Get user preferences
    const preferences = await storage.getPreferences(notification.userId);
    if (!preferences?.pushEnabled) {
      logger.info(`Push notifications disabled for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'push_disabled' };
    }

    // Get user's push subscriptions
    const subscriptions = await storage.getSubscriptionsByUser(notification.userId);
    if (subscriptions.length === 0) {
      logger.info(`No push subscriptions found for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'no_subscriptions' };
    }

    // Send push notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(subscription => 
        pushService.sendPushNotification(subscription, {
          title: notification.title,
          body: notification.content,
          data: notification.data
        })
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: successful > 0 ? NotificationStatus.DELIVERED : NotificationStatus.FAILED,
      sentAt: new Date()
    });

    // Add analytics job
    await analyticsQueue.add('track-delivery', { 
      notificationId: notification.id, 
      event: 'delivered',
      channel: 'push',
      successful,
      failed
    });

    logger.info(`Push notifications sent`, { notificationId: notification.id, successful, failed });
    return { success: true, successful, failed };

  } catch (error) {
    logger.error(`Error sending push notification`, { jobId, notificationId: notification.id, error: error.message });
    
    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.FAILED,
      errorMessage: error.message
    });

    throw error;
  }
});

// SMS processor
smsQueue.process('send-sms', async (job) => {
  const { notification, jobId } = job.data;
  
  try {
    logger.info(`Sending SMS notification`, { jobId, notificationId: notification.id });

    // Get user preferences
    const preferences = await storage.getPreferences(notification.userId);
    if (!preferences?.smsEnabled) {
      logger.info(`SMS disabled for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'sms_disabled' };
    }

    // Get user data
    const user = await storage.getUser(notification.userId);
    if (!user?.phoneNumber) {
      logger.info(`No phone number for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'no_phone' };
    }

    // Send SMS
    const result = await smsService.sendSMS({
      to: user.phoneNumber,
      message: `${notification.title}: ${notification.content}`
    });

    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.DELIVERED,
      sentAt: new Date()
    });

    // Add analytics job
    await analyticsQueue.add('track-delivery', { 
      notificationId: notification.id, 
      event: 'delivered',
      channel: 'sms',
      providerId: result.sid
    });

    logger.info(`SMS sent successfully`, { notificationId: notification.id, sid: result.sid });
    return { success: true, sid: result.sid };

  } catch (error) {
    logger.error(`Error sending SMS`, { jobId, notificationId: notification.id, error: error.message });
    
    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.FAILED,
      errorMessage: error.message
    });

    throw error;
  }
});

// In-app notification processor
inAppQueue.process('send-in-app', async (job) => {
  const { notification, jobId } = job.data;
  
  try {
    logger.info(`Sending in-app notification`, { jobId, notificationId: notification.id });

    // Get user preferences
    const preferences = await storage.getPreferences(notification.userId);
    if (!preferences?.inAppEnabled) {
      logger.info(`In-app notifications disabled for user`, { userId: notification.userId });
      return { success: true, skipped: true, reason: 'in_app_disabled' };
    }

    // Send in-app notification
    const result = await inAppService.sendInAppNotification({
      userId: notification.userId,
      title: notification.title,
      content: notification.content,
      data: notification.data
    });

    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.DELIVERED,
      sentAt: new Date()
    });

    // Add analytics job
    await analyticsQueue.add('track-delivery', { 
      notificationId: notification.id, 
      event: 'delivered',
      channel: 'in_app'
    });

    logger.info(`In-app notification sent successfully`, { notificationId: notification.id });
    return { success: true };

  } catch (error) {
    logger.error(`Error sending in-app notification`, { jobId, notificationId: notification.id, error: error.message });
    
    // Update notification status
    await storage.updateNotification(notification.id, { 
      status: NotificationStatus.FAILED,
      errorMessage: error.message
    });

    throw error;
  }
});

// Scheduled notification processor
scheduledQueue.process('process-scheduled', async (job) => {
  const { userId, type, channel, templateId, data, timezone, isRecurring, recurrencePattern } = job.data as CreateScheduledNotificationRequest;
  
  try {
    logger.info(`Processing scheduled notification`, { jobId: job.id, userId, type, channel });

    // Get template if specified
    let template = null;
    if (templateId) {
      template = await storage.getTemplate(templateId);
    }

    // Create notification request
    const notificationRequest: CreateNotificationRequest = {
      userId,
      type,
      channel,
      title: template?.title || 'Scheduled Notification',
      content: template?.content || 'This is a scheduled notification',
      data,
      templateId,
      priority: 'NORMAL'
    };

    // Add to notification queue
    await notificationQueue.add('process-notification', notificationRequest);

    // Handle recurring notifications
    if (isRecurring && recurrencePattern) {
      // Calculate next occurrence
      const nextScheduledAt = calculateNextOccurrence(new Date(), recurrencePattern);
      
      if (nextScheduledAt) {
        await scheduledQueue.add('process-scheduled', job.data, {
          delay: nextScheduledAt.getTime() - Date.now()
        });
      }
    }

    logger.info(`Scheduled notification processed successfully`, { jobId: job.id });
    return { success: true };

  } catch (error) {
    logger.error(`Error processing scheduled notification`, { jobId: job.id, error: error.message });
    throw error;
  }
});

// Analytics processor
analyticsQueue.process('track-delivery', async (job) => {
  const { notificationId, event, channel, providerId, successful, failed } = job.data;
  
  try {
    logger.info(`Tracking delivery event`, { jobId: job.id, notificationId, event, channel });

    // Create delivery tracking record
    const tracking = {
      id: generateId(),
      notificationId,
      channel: channel || 'unknown',
      status: event === 'sent' ? 'SENT' : event === 'delivered' ? 'DELIVERED' : 'FAILED',
      providerId,
      deliveredAt: event === 'delivered' ? new Date() : undefined,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await storage.createDeliveryTracking(tracking);

    // Update analytics
    await analyticsService.trackEvent(notificationId, event, {
      channel,
      providerId,
      successful,
      failed
    });

    logger.info(`Delivery event tracked successfully`, { trackingId: tracking.id });
    return { success: true, trackingId: tracking.id };

  } catch (error) {
    logger.error(`Error tracking delivery event`, { jobId: job.id, error: error.message });
    throw error;
  }
});

// Helper function to calculate next occurrence for recurring notifications
function calculateNextOccurrence(currentDate: Date, pattern: any): Date | null {
  const nextDate = new Date(currentDate);
  
  switch (pattern.frequency) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + pattern.interval);
      break;
    case 'WEEKLY':
      nextDate.setDate(nextDate.getDate() + (pattern.interval * 7));
      break;
    case 'MONTHLY':
      nextDate.setMonth(nextDate.getMonth() + pattern.interval);
      break;
    case 'YEARLY':
      nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
      break;
    default:
      return null;
  }
  
  // Check if we've exceeded the end date
  if (pattern.endDate && nextDate > new Date(pattern.endDate)) {
    return null;
  }
  
  return nextDate;
}

// Start the worker
logger.info('Notification worker started');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down worker...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down worker...');
  process.exit(0);
});
