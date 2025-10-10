import express from 'express';
import { createBullBoard } from 'bull-board';
import { BullAdapter } from 'bull-board/bullAdapter';
import basicAuth from 'express-basic-auth';
import { 
  notificationQueue, 
  emailQueue, 
  pushQueue, 
  smsQueue, 
  inAppQueue, 
  scheduledQueue, 
  analyticsQueue 
} from './queue';
import { logger } from '@/utils/logger';

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3001;

// Basic authentication
const auth = basicAuth({
  users: { 
    [process.env.DASHBOARD_USERNAME || 'admin']: process.env.DASHBOARD_PASSWORD || 'admin123' 
  },
  challenge: true,
  realm: 'Bull Queue Dashboard'
});

// Create Bull Board
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard([
  new BullAdapter(notificationQueue),
  new BullAdapter(emailQueue),
  new BullAdapter(pushQueue),
  new BullAdapter(smsQueue),
  new BullAdapter(inAppQueue),
  new BullAdapter(scheduledQueue),
  new BullAdapter(analyticsQueue),
]);

// Apply authentication to all routes
app.use(auth);

// Mount Bull Board
app.use('/admin/queues', addQueue);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Queue Dashboard is running',
    timestamp: new Date().toISOString()
  });
});

// Queue statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const [notificationStats, emailStats, pushStats, smsStats, inAppStats, scheduledStats, analyticsStats] = await Promise.all([
      getQueueStats(notificationQueue),
      getQueueStats(emailQueue),
      getQueueStats(pushQueue),
      getQueueStats(smsQueue),
      getQueueStats(inAppQueue),
      getQueueStats(scheduledQueue),
      getQueueStats(analyticsQueue),
    ]);

    res.json({
      success: true,
      data: {
        notification: notificationStats,
        email: emailStats,
        push: pushStats,
        sms: smsStats,
        inApp: inAppStats,
        scheduled: scheduledStats,
        analytics: analyticsStats,
        total: {
          waiting: notificationStats.waiting + emailStats.waiting + pushStats.waiting + smsStats.waiting + inAppStats.waiting + scheduledStats.waiting + analyticsStats.waiting,
          active: notificationStats.active + emailStats.active + pushStats.active + smsStats.active + inAppStats.active + scheduledStats.active + analyticsStats.active,
          completed: notificationStats.completed + emailStats.completed + pushStats.completed + smsStats.completed + inAppStats.completed + scheduledStats.completed + analyticsStats.completed,
          failed: notificationStats.failed + emailStats.failed + pushStats.failed + smsStats.failed + inAppStats.failed + scheduledStats.failed + analyticsStats.failed,
          delayed: notificationStats.delayed + emailStats.delayed + pushStats.delayed + smsStats.delayed + inAppStats.delayed + scheduledStats.delayed + analyticsStats.delayed,
          paused: notificationStats.paused + emailStats.paused + pushStats.paused + smsStats.paused + inAppStats.paused + scheduledStats.paused + analyticsStats.paused,
        }
      }
    });
  } catch (error) {
    logger.error('Error getting queue stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get queue statistics'
    });
  }
});

// Queue management endpoints
app.post('/api/queues/:queueName/pause', async (req, res) => {
  try {
    const { queueName } = req.params;
    const queue = getQueueByName(queueName);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }

    await queue.pause();
    logger.info(`Queue ${queueName} paused via dashboard`);
    
    res.json({
      success: true,
      message: `Queue ${queueName} paused successfully`
    });
  } catch (error) {
    logger.error('Error pausing queue', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to pause queue'
    });
  }
});

app.post('/api/queues/:queueName/resume', async (req, res) => {
  try {
    const { queueName } = req.params;
    const queue = getQueueByName(queueName);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }

    await queue.resume();
    logger.info(`Queue ${queueName} resumed via dashboard`);
    
    res.json({
      success: true,
      message: `Queue ${queueName} resumed successfully`
    });
  } catch (error) {
    logger.error('Error resuming queue', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to resume queue'
    });
  }
});

app.post('/api/queues/:queueName/clean', async (req, res) => {
  try {
    const { queueName } = req.params;
    const { grace = 5000 } = req.body;
    const queue = getQueueByName(queueName);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }

    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
    logger.info(`Queue ${queueName} cleaned via dashboard`);
    
    res.json({
      success: true,
      message: `Queue ${queueName} cleaned successfully`
    });
  } catch (error) {
    logger.error('Error cleaning queue', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to clean queue'
    });
  }
});

app.delete('/api/queues/:queueName/jobs/:jobId', async (req, res) => {
  try {
    const { queueName, jobId } = req.params;
    const queue = getQueueByName(queueName);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    await job.remove();
    logger.info(`Job ${jobId} removed from queue ${queueName} via dashboard`);
    
    res.json({
      success: true,
      message: `Job ${jobId} removed successfully`
    });
  } catch (error) {
    logger.error('Error removing job', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to remove job'
    });
  }
});

app.post('/api/queues/:queueName/jobs/:jobId/retry', async (req, res) => {
  try {
    const { queueName, jobId } = req.params;
    const queue = getQueueByName(queueName);
    
    if (!queue) {
      return res.status(404).json({
        success: false,
        error: 'Queue not found'
      });
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    await job.retry();
    logger.info(`Job ${jobId} retried in queue ${queueName} via dashboard`);
    
    res.json({
      success: true,
      message: `Job ${jobId} retried successfully`
    });
  } catch (error) {
    logger.error('Error retrying job', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to retry job'
    });
  }
});

// Helper function to get queue by name
function getQueueByName(queueName: string) {
  const queues = {
    notification: notificationQueue,
    email: emailQueue,
    push: pushQueue,
    sms: smsQueue,
    inApp: inAppQueue,
    scheduled: scheduledQueue,
    analytics: analyticsQueue,
  };
  
  return queues[queueName as keyof typeof queues];
}

// Helper function to get queue statistics
async function getQueueStats(queue: any) {
  const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
    queue.getDelayed(),
    queue.getPaused(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
    delayed: delayed.length,
    paused: paused.length,
  };
}

// Start the dashboard server
app.listen(PORT, () => {
  logger.info(`Queue Dashboard running on http://localhost:${PORT}`);
  logger.info(`Bull Board available at http://localhost:${PORT}/admin/queues`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down dashboard...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down dashboard...');
  process.exit(0);
});
