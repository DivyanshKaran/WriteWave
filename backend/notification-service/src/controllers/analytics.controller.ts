import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { analyticsService } from '../services/analytics.service';
import { asyncHandler } from '../utils/errors';

export class AnalyticsController {
  // Get analytics
  static getAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate } = req.query;
    
    logger.info('Getting analytics', { startDate, endDate });

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const analytics = await analyticsService.getNotificationAnalytics(start, end);

    res.json({
      success: true,
      data: analytics
    });
  });

  // Get user analytics
  static getUserAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;
    
    logger.info('Getting user analytics', { userId, startDate, endDate });

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const analytics = await analyticsService.getUserAnalytics(userId, start, end);

    res.json({
      success: true,
      data: analytics
    });
  });

  // Get channel analytics
  static getChannelAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { channel } = req.params;
    const { startDate, endDate } = req.query;
    
    logger.info('Getting channel analytics', { channel, startDate, endDate });

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const analytics = await analyticsService.getChannelAnalytics(channel, start, end);

    res.json({
      success: true,
      data: analytics
    });
  });

  // Get type analytics
  static getTypeAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { type } = req.params;
    const { startDate, endDate } = req.query;
    
    logger.info('Getting type analytics', { type, startDate, endDate });

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const analytics = await analyticsService.getTypeAnalytics(type, start, end);

    res.json({
      success: true,
      data: analytics
    });
  });

  // Get real-time analytics
  static getRealtimeAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    logger.info('Getting real-time analytics');

    const analytics = await analyticsService.getRealTimeStats();

    res.json({
      success: true,
      data: analytics
    });
  });

  // Export analytics
  static exportAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { startDate, endDate, format = 'json' } = req.query;
    
    logger.info('Exporting analytics', { startDate, endDate, format });

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    const result = await analyticsService.exportAnalytics(start, end, format as string);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics_${Date.now()}.${format}"`);
    
    res.send(result.data);
  });
}

export default AnalyticsController;

