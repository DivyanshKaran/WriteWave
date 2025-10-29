import Queue from 'bull';
import IORedis from 'ioredis';
import { logger } from '../utils/logger';
import { 
  Notification, 
  NotificationChannel, 
  NotificationType,
  CreateNotificationRequest,
  CreateScheduledNotificationRequest
} from '../types';
import { publish, Topics } from '../../../shared/utils/kafka';

// Redis connection
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
});

// Queue configurations
const queueOptions = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3'),
    backoff: {
      type: 'exponential',
      delay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000'),
    },
  },
};

// Create queues
export const notificationQueue = new Queue('notification processing', queueOptions);
export const emailQueue = new Queue('email notifications', queueOptions);
export const pushQueue = new Queue('push notifications', queueOptions);
export const smsQueue = new Queue('sms notifications', queueOptions);
export const inAppQueue = new Queue('in-app notifications', queueOptions);
export const scheduledQueue = new Queue('scheduled notifications', queueOptions);
export const analyticsQueue = new Queue('analytics processing', queueOptions);

// Queue event handlers
const setupQueueEvents = (queue: Queue.Queue, queueName: string) => {
  queue.on('completed', async (job, result) => {
    logger.info(`Job ${job.id} completed in ${queueName} queue`, { result });
    try { await publish(Topics.NOTIFICATION_EVENTS, String(job.id), { type: 'notification.delivered', jobId: job.id, queue: queueName, occurredAt: new Date().toISOString() }); } catch {}
  });

  queue.on('failed', async (job, err) => {
    logger.error(`Job ${job.id} failed in ${queueName} queue`, { error: err.message, stack: err.stack });
    try { await publish(Topics.NOTIFICATION_EVENTS, String(job?.id || Date.now()), { type: 'notification.failed', jobId: job?.id, queue: queueName, error: err.message, occurredAt: new Date().toISOString() }); } catch {}
  });

  queue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled in ${queueName} queue`);
  });

  queue.on('progress', (job, progress) => {
    logger.debug(`Job ${job.id} progress in ${queueName} queue: ${progress}%`);
  });
};

// Setup event handlers for all queues
setupQueueEvents(notificationQueue, 'notification');
setupQueueEvents(emailQueue, 'email');
setupQueueEvents(pushQueue, 'push');
setupQueueEvents(smsQueue, 'sms');
setupQueueEvents(inAppQueue, 'in-app');
setupQueueEvents(scheduledQueue, 'scheduled');
setupQueueEvents(analyticsQueue, 'analytics');

// Queue processors
export class QueueService {
  // Add notification to processing queue
  static async addNotification(notification: CreateNotificationRequest): Promise<Queue.Job> {
    const job = await notificationQueue.add('process-notification', notification, {
      priority: this.getPriority(notification.priority),
      delay: notification.scheduledAt ? new Date(notification.scheduledAt).getTime() - Date.now() : 0,
    });

    logger.info(`Added notification to queue`, { 
      jobId: job.id, 
      userId: notification.userId, 
      type: notification.type,
      channel: notification.channel 
    });

    try { await publish(Topics.NOTIFICATION_EVENTS, String(job.id), { type: 'notification.sent', jobId: job.id, userId: notification.userId, channel: notification.channel, occurredAt: new Date().toISOString() }); } catch {}

    return job;
  }

  // Add scheduled notification
  static async addScheduledNotification(scheduled: CreateScheduledNotificationRequest): Promise<Queue.Job> {
    const job = await scheduledQueue.add('process-scheduled', scheduled, {
      delay: new Date(scheduled.scheduledAt).getTime() - Date.now(),
      repeat: scheduled.isRecurring ? this.getRepeatOptions(scheduled.recurrencePattern) : undefined,
    });

    logger.info(`Added scheduled notification to queue`, { 
      jobId: job.id, 
      userId: scheduled.userId, 
      scheduledAt: scheduled.scheduledAt 
    });

    return job;
  }

  // Add email notification
  static async addEmailNotification(emailData: any): Promise<Queue.Job> {
    const job = await emailQueue.add('send-email', emailData, {
      priority: this.getPriority(emailData.priority),
    });

    logger.info(`Added email notification to queue`, { jobId: job.id, to: emailData.to });
    return job;
  }

  // Add push notification
  static async addPushNotification(pushData: any): Promise<Queue.Job> {
    const job = await pushQueue.add('send-push', pushData, {
      priority: this.getPriority(pushData.priority),
    });

    logger.info(`Added push notification to queue`, { jobId: job.id, userId: pushData.userId });
    return job;
  }

  // Add SMS notification
  static async addSMSNotification(smsData: any): Promise<Queue.Job> {
    const job = await smsQueue.add('send-sms', smsData, {
      priority: this.getPriority(smsData.priority),
    });

    logger.info(`Added SMS notification to queue`, { jobId: job.id, to: smsData.to });
    return job;
  }

  // Add in-app notification
  static async addInAppNotification(inAppData: any): Promise<Queue.Job> {
    const job = await inAppQueue.add('send-in-app', inAppData, {
      priority: this.getPriority(inAppData.priority),
    });

    logger.info(`Added in-app notification to queue`, { jobId: job.id, userId: inAppData.userId });
    return job;
  }

  // Add analytics job
  static async addAnalyticsJob(analyticsData: any): Promise<Queue.Job> {
    const job = await analyticsQueue.add('process-analytics', analyticsData);

    logger.info(`Added analytics job to queue`, { jobId: job.id, type: analyticsData.type });
    return job;
  }

  // Get queue statistics
  static async getQueueStats(): Promise<any> {
    const [notificationStats, emailStats, pushStats, smsStats, inAppStats, scheduledStats, analyticsStats] = await Promise.all([
      this.getQueueStat(notificationQueue),
      this.getQueueStat(emailQueue),
      this.getQueueStat(pushQueue),
      this.getQueueStat(smsQueue),
      this.getQueueStat(inAppQueue),
      this.getQueueStat(scheduledQueue),
      this.getQueueStat(analyticsQueue),
    ]);

    return {
      notification: notificationStats,
      email: emailStats,
      push: pushStats,
      sms: smsStats,
      inApp: inAppStats,
      scheduled: scheduledStats,
      analytics: analyticsStats,
    };
  }

  // Get individual queue statistics
  private static async getQueueStat(queue: Queue.Queue): Promise<any> {
    const [waiting, active, completed, failed, delayed, isPaused] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
      queue.isPaused(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: isPaused ? 1 : 0,
    };
  }

  // Get job by ID
  static async getJob(queue: Queue.Queue, jobId: string): Promise<Queue.Job | null> {
    try {
      return await queue.getJob(jobId);
    } catch (error) {
      logger.error('Error getting job', { jobId, error: error.message });
      return null;
    }
  }

  // Cancel job
  static async cancelJob(queue: Queue.Queue, jobId: string): Promise<boolean> {
    try {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        logger.info(`Cancelled job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error cancelling job', { jobId, error: error.message });
      return false;
    }
  }

  // Retry failed job
  static async retryJob(queue: Queue.Queue, jobId: string): Promise<boolean> {
    try {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.retry();
        logger.info(`Retried job ${jobId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error retrying job', { jobId, error: error.message });
      return false;
    }
  }

  // Pause queue
  static async pauseQueue(queue: Queue.Queue): Promise<void> {
    await queue.pause();
    logger.info(`Paused queue ${queue.name}`);
  }

  // Resume queue
  static async resumeQueue(queue: Queue.Queue): Promise<void> {
    await queue.resume();
    logger.info(`Resumed queue ${queue.name}`);
  }

  // Clean queue
  static async cleanQueue(queue: Queue.Queue, grace: number = 5000): Promise<void> {
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
    logger.info(`Cleaned queue ${queue.name}`);
  }

  // Get priority value
  private static getPriority(priority?: string): number {
    switch (priority) {
      case 'URGENT': return 1;
      case 'HIGH': return 2;
      case 'NORMAL': return 3;
      case 'LOW': return 4;
      default: return 3;
    }
  }

  // Get repeat options for recurring notifications
  private static getRepeatOptions(pattern?: any): any {
    if (!pattern) return undefined;

    switch (pattern.frequency) {
      case 'DAILY':
        return { every: pattern.interval * 24 * 60 * 60 * 1000 };
      case 'WEEKLY':
        return { every: pattern.interval * 7 * 24 * 60 * 60 * 1000 };
      case 'MONTHLY':
        return { every: pattern.interval * 30 * 24 * 60 * 60 * 1000 };
      case 'YEARLY':
        return { every: pattern.interval * 365 * 24 * 60 * 60 * 1000 };
      default:
        return undefined;
    }
  }

  // Close all queues
  static async closeAllQueues(): Promise<void> {
    await Promise.all([
      notificationQueue.close(),
      emailQueue.close(),
      pushQueue.close(),
      smsQueue.close(),
      inAppQueue.close(),
      scheduledQueue.close(),
      analyticsQueue.close(),
    ]);

    await redis.disconnect();
    logger.info('All queues closed');
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, closing queues...');
  await QueueService.closeAllQueues();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, closing queues...');
  await QueueService.closeAllQueues();
  process.exit(0);
});

export default QueueService;
