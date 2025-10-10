import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/config/logger';

// Validation error class
export class ValidationError extends Error {
  public statusCode: number = 400;
  public errors: any[];

  constructor(message: string, errors: any[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        logger.warn('Validation failed', {
          errors,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: 'VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    } catch (error) {
      logger.error('Validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        logger.warn('Query validation failed', {
          errors,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          message: 'Query validation failed',
          error: 'VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      req.query = value;
      next();
    } catch (error) {
      logger.error('Query validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        logger.warn('Params validation failed', {
          errors,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        res.status(400).json({
          success: false,
          message: 'Params validation failed',
          error: 'VALIDATION_ERROR',
          errors,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      req.params = value;
      next();
    } catch (error) {
      logger.error('Params validation middleware error', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Validation schemas
export const validationSchemas = {
  // User registration
  userRegistration: Joi.object({
    email: Joi.string()
      .email()
      .max(254)
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email must be no more than 254 characters',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be no more than 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'Password is required',
      }),
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name must be no more than 50 characters',
      }),
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name must be no more than 50 characters',
      }),
    username: Joi.string()
      .min(3)
      .max(30)
      .pattern(/^[a-zA-Z0-9_-]+$/)
      .optional()
      .messages({
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username must be no more than 30 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
      }),
  }),

  // User login
  userLogin: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required',
      }),
  }),

  // Password reset request
  passwordResetRequest: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required',
      }),
  }),

  // Password reset confirm
  passwordResetConfirm: Joi.object({
    token: Joi.string()
      .min(32)
      .required()
      .messages({
        'string.min': 'Invalid reset token',
        'any.required': 'Reset token is required',
      }),
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password must be no more than 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
        'any.required': 'New password is required',
      }),
  }),

  // Email verification
  emailVerification: Joi.object({
    token: Joi.string()
      .min(32)
      .required()
      .messages({
        'string.min': 'Invalid verification token',
        'any.required': 'Verification token is required',
      }),
  }),

  // Refresh token
  refreshToken: Joi.object({
    refreshToken: Joi.string()
      .min(32)
      .required()
      .messages({
        'string.min': 'Invalid refresh token',
        'any.required': 'Refresh token is required',
      }),
  }),

  // User profile update
  userProfileUpdate: Joi.object({
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name must be no more than 50 characters',
      }),
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name must be no more than 50 characters',
      }),
    bio: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Bio must be no more than 500 characters',
      }),
    dateOfBirth: Joi.date()
      .max('now')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be in the future',
      }),
    country: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Country must be no more than 100 characters',
      }),
    timezone: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Timezone must be no more than 50 characters',
      }),
    language: Joi.string()
      .max(10)
      .optional()
      .messages({
        'string.max': 'Language code must be no more than 10 characters',
      }),
    learningGoals: Joi.array()
      .items(Joi.string().max(100))
      .max(10)
      .optional()
      .messages({
        'array.max': 'You can have at most 10 learning goals',
        'string.max': 'Each learning goal must be no more than 100 characters',
      }),
    difficultyLevel: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .optional()
      .messages({
        'any.only': 'Difficulty level must be one of: beginner, intermediate, advanced',
      }),
    studyTime: Joi.number()
      .integer()
      .min(0)
      .max(1440)
      .optional()
      .messages({
        'number.min': 'Study time cannot be negative',
        'number.max': 'Study time cannot exceed 1440 minutes (24 hours)',
        'number.integer': 'Study time must be a whole number',
      }),
    interests: Joi.array()
      .items(Joi.string().max(50))
      .max(20)
      .optional()
      .messages({
        'array.max': 'You can have at most 20 interests',
        'string.max': 'Each interest must be no more than 50 characters',
      }),
  }),

  // User settings update
  userSettingsUpdate: Joi.object({
    emailNotifications: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Email notifications must be a boolean value',
      }),
    pushNotifications: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Push notifications must be a boolean value',
      }),
    dailyReminders: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Daily reminders must be a boolean value',
      }),
    weeklyReports: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Weekly reports must be a boolean value',
      }),
    achievementAlerts: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Achievement alerts must be a boolean value',
      }),
    profileVisibility: Joi.string()
      .valid('public', 'friends', 'private')
      .optional()
      .messages({
        'any.only': 'Profile visibility must be one of: public, friends, private',
      }),
    showProgress: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Show progress must be a boolean value',
      }),
    showAchievements: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Show achievements must be a boolean value',
      }),
    autoAdvance: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Auto advance must be a boolean value',
      }),
    showHints: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Show hints must be a boolean value',
      }),
    soundEnabled: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Sound enabled must be a boolean value',
      }),
    vibrationEnabled: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Vibration enabled must be a boolean value',
      }),
    theme: Joi.string()
      .valid('light', 'dark', 'auto')
      .optional()
      .messages({
        'any.only': 'Theme must be one of: light, dark, auto',
      }),
    fontSize: Joi.string()
      .valid('small', 'medium', 'large')
      .optional()
      .messages({
        'any.only': 'Font size must be one of: small, medium, large',
      }),
    animations: Joi.boolean()
      .optional()
      .messages({
        'boolean.base': 'Animations must be a boolean value',
      }),
  }),

  // Pagination query
  paginationQuery: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional()
      .messages({
        'number.min': 'Page must be at least 1',
        'number.integer': 'Page must be a whole number',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional()
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
        'number.integer': 'Limit must be a whole number',
      }),
    sortBy: Joi.string()
      .optional()
      .messages({
        'string.base': 'Sort by must be a string',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional()
      .messages({
        'any.only': 'Sort order must be either asc or desc',
      }),
  }),

  // User ID parameter
  userIdParam: Joi.object({
    userId: Joi.string()
      .required()
      .messages({
        'any.required': 'User ID is required',
      }),
  }),

  // Search query
  searchQuery: Joi.object({
    q: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Search query must be at least 1 character',
        'string.max': 'Search query must be no more than 100 characters',
        'any.required': 'Search query is required',
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .optional(),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .optional(),
  }),
};

// Custom validation functions
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    errors.push('Password must be no more than 128 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateUsername = (username: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (username.length > 30) {
    errors.push('Username must be no more than 30 characters long');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

export const sanitizeUsername = (username: string): string => {
  return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '');
};

// Export validation schemas
export default validationSchemas;
