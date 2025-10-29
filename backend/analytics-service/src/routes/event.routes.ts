import { Router } from 'express';
import { Request, Response } from 'express';
import { CreateEventRequest, EventType, EventSource, Platform } from '../types';
import { eventTrackingService } from '../services/event-tracking.service';
import { validateEvent } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// Track single event
router.post('/', authenticate, validateEvent, async (req: Request, res: Response) => {
  try {
    const eventData: CreateEventRequest = {
      ...req.body,
      userId: req.user?.userId || req.body.userId,
      timestamp: req.body.timestamp || new Date(),
      source: req.body.source || EventSource.WEB_APP,
      platform: req.body.platform || Platform.WEB,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const event = await eventTrackingService.trackEvent(eventData);
    
    res.status(201).json({
      success: true,
      data: event,
      message: 'Event tracked successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Track multiple events (batch)
router.post('/batch', authenticate, async (req: Request, res: Response) => {
  try {
    const events: CreateEventRequest[] = req.body.events;
    
    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid events array',
        message: 'Events must be a non-empty array'
      });
    }

    const trackedEvents = await eventTrackingService.trackBatchEvents(events, req.user?.userId);
    
    res.status(201).json({
      success: true,
      data: trackedEvents,
      message: `${trackedEvents.length} events tracked successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to track batch events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get event statistics
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const { 
      startDate, 
      endDate, 
      eventType, 
      eventName, 
      userId,
      groupBy = 'day'
    } = req.query;

    const stats = await eventTrackingService.getEventStats({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      eventType: eventType as EventType,
      eventName: eventName as string,
      userId: userId as string,
      groupBy: groupBy as string
    });
    
    res.json({
      success: true,
      data: stats,
      message: 'Event statistics retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get event statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Search events
router.get('/search', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      query,
      eventType,
      eventName,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const results = await eventTrackingService.searchEvents({
      query: query as string,
      eventType: eventType as EventType,
      eventName: eventName as string,
      userId: userId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });
    
    res.json({
      success: true,
      data: results.events,
      pagination: results.pagination,
      message: 'Events search completed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export events data
router.get('/export', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      format = 'json',
      startDate,
      endDate,
      eventType,
      eventName,
      userId
    } = req.query;

    const exportData = await eventTrackingService.exportEvents({
      format: format as 'json' | 'csv' | 'parquet',
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      eventType: eventType as EventType,
      eventName: eventName as string,
      userId: userId as string
    });
    
    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="events-export-${Date.now()}.${format}"`);
    
    res.send(exportData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to export events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get event by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = await eventTrackingService.getEventById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
        message: `Event with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: event,
      message: 'Event retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
