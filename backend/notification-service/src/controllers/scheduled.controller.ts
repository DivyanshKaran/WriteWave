import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { storage } from '../models';
import { asyncHandler } from '../utils/errors';
import { 
  CreateScheduledNotificationRequest, 
  ScheduledNotification,
  ScheduleStatus 
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ScheduledController {
  // Create scheduled notification
  static createScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const data: CreateScheduledNotificationRequest = req.body;
    
    logger.info('Creating scheduled notification', { 
      userId: data.userId,
      type: data.type,
      scheduledAt: data.scheduledAt
    });

    const scheduled: ScheduledNotification = {
      id: uuidv4(),
      userId: data.userId,
      type: data.type,
      channel: data.channel,
      templateId: data.templateId,
      data: data.data,
      scheduledAt: new Date(data.scheduledAt),
      timezone: data.timezone,
      isRecurring: data.isRecurring || false,
      recurrencePattern: data.recurrencePattern,
      status: ScheduleStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await storage.createScheduledNotification(scheduled);

    res.status(201).json({
      success: true,
      data: created,
      message: 'Scheduled notification created successfully'
    });
  });

  // Get scheduled notification
  static getScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    const scheduled = await storage.getScheduledNotification(id);
    
    if (!scheduled) {
      res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
      return;
    }

    res.json({
      success: true,
      data: scheduled
    });
  });

  // Update scheduled notification
  static updateScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info('Updating scheduled notification', { id });

    const scheduled = await storage.getScheduledNotification(id);
    
    if (!scheduled) {
      res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
      return;
    }

    const updated = await storage.updateScheduledNotification(id, {
      ...updates,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: updated,
      message: 'Scheduled notification updated successfully'
    });
  });

  // Delete scheduled notification
  static deleteScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Deleting scheduled notification', { id });

    const scheduled = await storage.getScheduledNotification(id);
    
    if (!scheduled) {
      res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
      return;
    }

    await storage.deleteScheduledNotification(id);

    res.json({
      success: true,
      message: 'Scheduled notification deleted successfully'
    });
  });

  // Get user's scheduled notifications
  static getUserScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    logger.info('Getting user scheduled notifications', { userId });

    const scheduled = await storage.getScheduledNotificationsByUser(
      userId,
      Number(limit),
      (Number(page) - 1) * Number(limit)
    );

    res.json({
      success: true,
      data: scheduled,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: scheduled.length
      }
    });
  });

  // Cancel scheduled notification
  static cancelScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Cancelling scheduled notification', { id });

    const scheduled = await storage.getScheduledNotification(id);
    
    if (!scheduled) {
      res.status(404).json({
        success: false,
        error: 'Scheduled notification not found'
      });
      return;
    }

    const updated = await storage.updateScheduledNotification(id, {
      status: ScheduleStatus.CANCELLED,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: updated,
      message: 'Scheduled notification cancelled successfully'
    });
  });

  // Get scheduled stats
  static getScheduledStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;
    
    logger.info('Getting scheduled stats', { startDate, endDate });

    const stats = await storage.getScheduledStats(
      startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate ? new Date(endDate as string) : new Date()
    );

    res.json({
      success: true,
      data: stats
    });
  });

  // Process due scheduled notifications
  static processDueScheduled = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.info('Processing due scheduled notifications');

    const now = new Date();
    const dueScheduled = await storage.getDueScheduledNotifications(now);

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as any[]
    };

    for (const scheduled of dueScheduled) {
      try {
        // Mark as processing
        await storage.updateScheduledNotification(scheduled.id, {
          status: ScheduleStatus.PROCESSING,
          updatedAt: new Date()
        });

        // Here you would send the notification
        // For now, we'll just mark it as completed
        await storage.updateScheduledNotification(scheduled.id, {
          status: ScheduleStatus.COMPLETED,
          updatedAt: new Date()
        });

        results.processed++;
      } catch (error: any) {
        logger.error('Error processing scheduled notification', {
          id: scheduled.id,
          error: error.message
        });

        await storage.updateScheduledNotification(scheduled.id, {
          status: ScheduleStatus.FAILED,
          updatedAt: new Date()
        });

        results.failed++;
        results.errors.push({
          id: scheduled.id,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Processed ${results.processed} scheduled notifications, ${results.failed} failed`
    });
  });
}

export default ScheduledController;

