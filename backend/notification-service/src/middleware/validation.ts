import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        throw new ValidationError(`Validation failed: ${errorMessages.join(', ')}`);
      }

      req.body = value;
      next();
    } catch (error) {
      logger.warn('Validation failed', { 
        error: error.message, 
        url: req.url, 
        method: req.method 
      });
      next(error);
    }
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        throw new ValidationError(`Query validation failed: ${errorMessages.join(', ')}`);
      }

      req.query = value;
      next();
    } catch (error) {
      logger.warn('Query validation failed', { 
        error: error.message, 
        url: req.url, 
        method: req.method 
      });
      next(error);
    }
  };
};

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        allowUnknown: false
      });

      if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        throw new ValidationError(`Params validation failed: ${errorMessages.join(', ')}`);
      }

      req.params = value;
      next();
    } catch (error) {
      logger.warn('Params validation failed', { 
        error: error.message, 
        url: req.url, 
        method: req.method 
      });
      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    sortBy: Joi.string().valid('createdAt', 'updatedAt', 'title', 'status').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Date range
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  }),

  // ID validation
  id: Joi.object({
    id: Joi.string().required()
  }),

  // User ID validation
  userId: Joi.object({
    userId: Joi.string().required()
  }),

  // Email validation
  email: Joi.string().email().required(),

  // Phone validation
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),

  // URL validation
  url: Joi.string().uri().required()
};

// Notification-specific validation schemas
export const notificationSchemas = {
  // Create notification
  createNotification: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid(
      'LEARNING_REMINDER',
      'STREAK_WARNING',
      'ACHIEVEMENT_UNLOCKED',
      'FRIEND_REQUEST',
      'COMMENT_ADDED',
      'POST_LIKED',
      'SYSTEM_UPDATE',
      'MAINTENANCE_NOTICE',
      'MARKETING_CAMPAIGN',
      'FEATURE_ANNOUNCEMENT',
      'WEEKLY_SUMMARY',
      'MONTHLY_ROUNDUP',
      'PASSWORD_RESET',
      'EMAIL_VERIFICATION',
      'SECURITY_ALERT'
    ).required(),
    channel: Joi.string().valid('EMAIL', 'PUSH', 'SMS', 'IN_APP').required(),
    title: Joi.string().max(200).required(),
    content: Joi.string().max(1000).required(),
    data: Joi.object().optional(),
    templateId: Joi.string().optional(),
    scheduledAt: Joi.date().iso().min('now').optional(),
    priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').default('NORMAL'),
    metadata: Joi.object().optional()
  }),

  // Update notification
  updateNotification: Joi.object({
    status: Joi.string().valid(
      'PENDING',
      'SCHEDULED',
      'PROCESSING',
      'SENT',
      'DELIVERED',
      'OPENED',
      'CLICKED',
      'FAILED',
      'CANCELLED'
    ).optional(),
    errorMessage: Joi.string().optional(),
    sentAt: Joi.date().iso().optional()
  }),

  // Bulk notification
  bulkNotification: Joi.object({
    userIds: Joi.array().items(Joi.string()).min(1).max(1000).required(),
    type: Joi.string().required(),
    channel: Joi.string().valid('EMAIL', 'PUSH', 'SMS', 'IN_APP').required(),
    title: Joi.string().max(200).required(),
    content: Joi.string().max(1000).required(),
    data: Joi.object().optional(),
    templateId: Joi.string().optional(),
    priority: Joi.string().valid('LOW', 'NORMAL', 'HIGH', 'URGENT').default('NORMAL')
  })
};

// Template validation schemas
export const templateSchemas = {
  // Create template
  createTemplate: Joi.object({
    name: Joi.string().max(100).required(),
    type: Joi.string().required(),
    channel: Joi.string().valid('EMAIL', 'PUSH', 'SMS', 'IN_APP').required(),
    language: Joi.string().length(2).default('en'),
    subject: Joi.string().max(200).optional(),
    title: Joi.string().max(200).required(),
    content: Joi.string().max(1000).required(),
    htmlContent: Joi.string().max(10000).optional(),
    variables: Joi.array().items(Joi.string()).max(20).default([])
  }),

  // Update template
  updateTemplate: Joi.object({
    name: Joi.string().max(100).optional(),
    subject: Joi.string().max(200).optional(),
    title: Joi.string().max(200).optional(),
    content: Joi.string().max(1000).optional(),
    htmlContent: Joi.string().max(10000).optional(),
    variables: Joi.array().items(Joi.string()).max(20).optional(),
    isActive: Joi.boolean().optional()
  })
};

// Preferences validation schemas
export const preferencesSchemas = {
  // Update preferences
  updatePreferences: Joi.object({
    emailEnabled: Joi.boolean().optional(),
    pushEnabled: Joi.boolean().optional(),
    smsEnabled: Joi.boolean().optional(),
    inAppEnabled: Joi.boolean().optional(),
    learningReminders: Joi.boolean().optional(),
    streakWarnings: Joi.boolean().optional(),
    achievements: Joi.boolean().optional(),
    socialNotifications: Joi.boolean().optional(),
    systemUpdates: Joi.boolean().optional(),
    marketingEmails: Joi.boolean().optional(),
    weeklyDigest: Joi.boolean().optional(),
    monthlyRoundup: Joi.boolean().optional(),
    preferredTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    timezone: Joi.string().optional(),
    language: Joi.string().length(2).optional(),
    quietHoursStart: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    quietHoursEnd: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional()
  })
};

// Subscription validation schemas
export const subscriptionSchemas = {
  // Create subscription
  createSubscription: Joi.object({
    endpoint: Joi.string().uri().required(),
    p256dh: Joi.string().required(),
    auth: Joi.string().required(),
    userAgent: Joi.string().optional()
  })
};

// Scheduled notification validation schemas
export const scheduledSchemas = {
  // Create scheduled notification
  createScheduled: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().required(),
    channel: Joi.string().valid('EMAIL', 'PUSH', 'SMS', 'IN_APP').required(),
    templateId: Joi.string().optional(),
    data: Joi.object().optional(),
    scheduledAt: Joi.date().iso().min('now').required(),
    timezone: Joi.string().required(),
    isRecurring: Joi.boolean().default(false),
    recurrencePattern: Joi.object({
      frequency: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY').required(),
      interval: Joi.number().integer().min(1).default(1),
      daysOfWeek: Joi.array().items(Joi.number().integer().min(0).max(6)).optional(),
      daysOfMonth: Joi.array().items(Joi.number().integer().min(1).max(31)).optional(),
      endDate: Joi.date().iso().min(Joi.ref('scheduledAt')).optional()
    }).optional()
  })
};

// Analytics validation schemas
export const analyticsSchemas = {
  // Get analytics
  getAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    channel: Joi.string().valid('EMAIL', 'PUSH', 'SMS', 'IN_APP').optional(),
    type: Joi.string().optional(),
    userId: Joi.string().optional()
  }),

  // Export analytics
  exportAnalytics: Joi.object({
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
    format: Joi.string().valid('json', 'csv').default('json')
  })
};

// Email validation schemas
export const emailSchemas = {
  // Send email
  sendEmail: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().max(200).required(),
    text: Joi.string().optional(),
    html: Joi.string().optional(),
    templateId: Joi.string().optional(),
    variables: Joi.object().optional(),
    attachments: Joi.array().items(Joi.object({
      filename: Joi.string().required(),
      content: Joi.string().required(),
      contentType: Joi.string().optional(),
      disposition: Joi.string().optional()
    })).optional(),
    replyTo: Joi.string().email().optional(),
    cc: Joi.array().items(Joi.string().email()).optional(),
    bcc: Joi.array().items(Joi.string().email()).optional()
  })
};

// SMS validation schemas
export const smsSchemas = {
  // Send SMS
  sendSMS: Joi.object({
    to: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    message: Joi.string().max(1600).required(),
    from: Joi.string().optional(),
    mediaUrl: Joi.array().items(Joi.string().uri()).optional()
  })
};

// Push notification validation schemas
export const pushSchemas = {
  // Send push notification
  sendPush: Joi.object({
    title: Joi.string().max(100).required(),
    body: Joi.string().max(200).required(),
    icon: Joi.string().uri().optional(),
    badge: Joi.string().uri().optional(),
    image: Joi.string().uri().optional(),
    data: Joi.object().optional(),
    actions: Joi.array().items(Joi.object({
      action: Joi.string().required(),
      title: Joi.string().required(),
      icon: Joi.string().uri().optional()
    })).optional(),
    requireInteraction: Joi.boolean().optional(),
    silent: Joi.boolean().optional(),
    tag: Joi.string().optional(),
    renotify: Joi.boolean().optional(),
    timestamp: Joi.number().optional(),
    vibrate: Joi.array().items(Joi.number()).optional(),
    url: Joi.string().uri().optional()
  })
};

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateTimezone = (timezone: string): boolean => {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
};

export const validateLanguage = (language: string): boolean => {
  const languageRegex = /^[a-z]{2}$/;
  return languageRegex.test(language);
};

export const validateTime = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export default {
  validate,
  validateQuery,
  validateParams,
  commonSchemas,
  notificationSchemas,
  templateSchemas,
  preferencesSchemas,
  subscriptionSchemas,
  scheduledSchemas,
  analyticsSchemas,
  emailSchemas,
  smsSchemas,
  pushSchemas,
  validateEmail,
  validatePhone,
  validateURL,
  validateTimezone,
  validateLanguage,
  validateTime
};
