import { Request, Response, NextFunction } from 'express';
import { CreateEventRequest, EventType, EventSource, Platform } from '../types';

export const validateEvent = (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventData: CreateEventRequest = req.body;
    
    // Required fields validation
    if (!eventData.eventName) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Event name is required'
      });
    }

    if (!eventData.eventType) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Event type is required'
      });
    }

    // Validate event type
    if (!Object.values(EventType).includes(eventData.eventType)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Invalid event type. Must be one of: ${Object.values(EventType).join(', ')}`
      });
    }

    // Validate event source if provided
    if (eventData.source && !Object.values(EventSource).includes(eventData.source)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Invalid event source. Must be one of: ${Object.values(EventSource).join(', ')}`
      });
    }

    // Validate platform if provided
    if (eventData.platform && !Object.values(Platform).includes(eventData.platform)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: `Invalid platform. Must be one of: ${Object.values(Platform).join(', ')}`
      });
    }

    // Validate properties is an object
    if (eventData.properties && typeof eventData.properties !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Properties must be an object'
      });
    }

    // Validate timestamp if provided
    if (eventData.timestamp && isNaN(new Date(eventData.timestamp).getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid timestamp format'
      });
    }

    // Validate metadata is an object if provided
    if (eventData.metadata && typeof eventData.metadata !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Metadata must be an object'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const validateQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, startDate, endDate } = req.query;
    
    // Validate pagination
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Page must be a positive integer'
      });
    }

    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 1000)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Limit must be between 1 and 1000'
      });
    }

    // Validate dates
    if (startDate && isNaN(new Date(startDate as string).getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid startDate format'
      });
    }

    if (endDate && isNaN(new Date(endDate as string).getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Invalid endDate format'
      });
    }

    // Validate date range
    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'startDate must be before endDate'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const validateAnalyticsQuery = (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.body;
    
    // Required fields
    if (!query.select || !Array.isArray(query.select) || query.select.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Select fields are required and must be a non-empty array'
      });
    }

    if (!query.from) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'From table is required'
      });
    }

    // Validate where conditions
    if (query.where && !Array.isArray(query.where)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Where conditions must be an array'
      });
    }

    // Validate groupBy
    if (query.groupBy && !Array.isArray(query.groupBy)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'GroupBy must be an array'
      });
    }

    // Validate orderBy
    if (query.orderBy && !Array.isArray(query.orderBy)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'OrderBy must be an array'
      });
    }

    // Validate limit
    if (query.limit && (isNaN(Number(query.limit)) || Number(query.limit) < 1 || Number(query.limit) > 10000)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Limit must be between 1 and 10000'
      });
    }

    // Validate offset
    if (query.offset && (isNaN(Number(query.offset)) || Number(query.offset) < 0)) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: 'Offset must be a non-negative integer'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Validation error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
