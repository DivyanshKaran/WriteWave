import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/errors';
import { 
  CreateNotificationRequest, 
  UpdateNotificationRequest,
  NotificationStatus 
} from '../types';

export class NotificationController {
  // Send notification
  static sendNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const notificationData: CreateNotificationRequest = req.body;
    
    logger.info('Sending notification', { 
      userId: notificationData.userId, 
      type: notificationData.type, 
      channel: notificationData.channel 
    });

    const result = await notificationService.createNotification(notificationData);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: result.notification,
      message: 'Notification sent successfully'
    });
  });

  // Send bulk notifications
  static sendBulkNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { notifications } = req.body;
    
    logger.info('Sending bulk notifications', { count: notifications.length });

    const result = await notificationService.sendBulkNotifications(notifications);
    
    res.status(201).json({
      success: result.success,
      data: {
        total: notifications.length,
        successful: result.results.length,
        failed: result.errors.length,
        results: result.results,
        errors: result.errors
      },
      message: `Bulk notifications processed: ${result.results.length} successful, ${result.errors.length} failed`
    });
  });

  // Send notification to multiple users
  static sendToUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userIds, ...notificationData } = req.body;
    
    logger.info('Sending notification to users', { userIds: userIds.length });

    const result = await notificationService.sendNotificationToUsers(userIds, notificationData);
    
    res.status(201).json({
      success: result.success,
      data: {
        total: userIds.length,
        successful: result.results.length,
        failed: result.errors.length,
        results: result.results,
        errors: result.errors
      },
      message: `Notifications sent to ${result.results.length} users, ${result.errors.length} failed`
    });
  });

  // Send notification to all users
  static sendToAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const notificationData = req.body;
    
    logger.info('Sending notification to all users');

    const result = await notificationService.sendNotificationToAllUsers(notificationData);
    
    res.status(201).json({
      success: result.success,
      data: {
        total: result.results.length,
        successful: result.results.length,
        failed: result.errors.length,
        results: result.results,
        errors: result.errors
      },
      message: `Notifications sent to all users: ${result.results.length} successful, ${result.errors.length} failed`
    });
  });

  // Send notification by type
  static sendByType = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { type, ...notificationData } = req.body;
    
    logger.info('Sending notification by type', { type });

    const result = await notificationService.sendNotificationByType(type, notificationData);
    
    res.status(201).json({
      success: result.success,
      data: {
        type,
        total: result.results.length,
        successful: result.results.length,
        failed: result.errors.length,
        results: result.results,
        errors: result.errors
      },
      message: `Notifications sent by type ${type}: ${result.results.length} successful, ${result.errors.length} failed`
    });
  });

  // Get notification by ID
  static getNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    const notification = await notificationService.getNotification(id);
    
    if (!notification) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      data: notification
    });
  });

  // Update notification
  static updateNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updates: UpdateNotificationRequest = req.body;
    
    logger.info('Updating notification', { id });

    const result = await notificationService.updateNotification(id, updates);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.json({
      success: true,
      data: result.notification,
      message: 'Notification updated successfully'
    });
  });

  // Get user notifications
  static getUserNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    const { page = 1, limit = 50, status } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const result = await notificationService.getUserNotifications(
      userId, 
      Number(limit), 
      offset, 
      status as NotificationStatus
    );
    
    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
        hasNext: offset + Number(limit) < result.total,
        hasPrev: Number(page) > 1
      }
    });
  });

  // Get notifications by status
  static getNotificationsByStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { status } = req.params;
    const { limit = 100 } = req.query;
    
    const notifications = await notificationService.getNotificationsByStatus(
      status as NotificationStatus, 
      Number(limit)
    );
    
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  });

  // Delete notification
  static deleteNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Deleting notification', { id });

    const success = await notificationService.deleteNotification(id);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  });

  // Retry failed notification
  static retryNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Retrying failed notification', { id });

    const result = await notificationService.retryFailedNotification(id);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification retry initiated successfully'
    });
  });

  // Cancel scheduled notification
  static cancelScheduledNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    
    logger.info('Cancelling scheduled notification', { id });

    const result = await notificationService.cancelScheduledNotification(id);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.json({
      success: true,
      message: 'Scheduled notification cancelled successfully'
    });
  });

  // Get notification statistics
  static getNotificationStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
      return;
    }

    const stats = await notificationService.getNotificationStats(
      new Date(startDate as string), 
      new Date(endDate as string)
    );
    
    res.json({
      success: true,
      data: stats
    });
  });

  // Cleanup old notifications
  static cleanupOldNotifications = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { retentionDays = 30 } = req.body;
    
    logger.info('Cleaning up old notifications', { retentionDays });

    const deletedCount = await notificationService.cleanupOldNotifications(Number(retentionDays));
    
    res.json({
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old notifications`
    });
  });

  // Validate notification data
  static validateNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const notificationData: CreateNotificationRequest = req.body;
    
    const validation = await notificationService.validateNotificationData(notificationData);
    
    res.json({
      success: true,
      data: {
        valid: validation.valid,
        errors: validation.errors
      }
    });
  });
}

export default NotificationController;
