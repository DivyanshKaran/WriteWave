import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ValidationError } from '../types';

// Validation schemas
export const createPostSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).max(10000).required(),
  categoryId: Joi.string().required()
});

export const updatePostSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  content: Joi.string().min(1).max(10000),
  categoryId: Joi.string(),
  isPinned: Joi.boolean(),
  isLocked: Joi.boolean()
});

export const createCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
  postId: Joi.string().required(),
  parentId: Joi.string().optional()
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
});

export const voteSchema = Joi.object({
  voteType: Joi.string().valid('UPVOTE', 'DOWNVOTE').required()
});

export const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('posts', 'comments', 'users', 'groups').optional(),
  category: Joi.string().optional(),
  author: Joi.string().optional(),
  dateFrom: Joi.date().optional(),
  dateTo: Joi.date().optional(),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

export const createStudyGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  isPublic: Joi.boolean().required(),
  maxMembers: Joi.number().integer().min(2).max(1000).optional()
});

export const updateStudyGroupSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  isPublic: Joi.boolean(),
  maxMembers: Joi.number().integer().min(2).max(1000)
});

export const createChallengeSchema = Joi.object({
  title: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).required(),
  type: Joi.string().valid('DAILY_STREAK', 'WEEKLY_GOAL', 'MONTHLY_CHALLENGE', 'CUSTOM').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required()
});

export const createFriendRequestSchema = Joi.object({
  receiverId: Joi.string().required(),
  message: Joi.string().max(200).optional()
});

export const updateFriendRequestSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED').required()
});

export const createMentorshipRequestSchema = Joi.object({
  mentorId: Joi.string().required(),
  message: Joi.string().max(200).optional()
});

export const createReportSchema = Joi.object({
  reportedId: Joi.string().optional(),
  postId: Joi.string().optional(),
  commentId: Joi.string().optional(),
  reason: Joi.string().valid('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'HATE_SPEECH', 'COPYRIGHT_VIOLATION', 'OTHER').required(),
  description: Joi.string().max(500).optional()
}).custom((value, helpers) => {
  // At least one target must be specified
  if (!value.reportedId && !value.postId && !value.commentId) {
    return helpers.error('any.custom', { message: 'Must specify a user, post, or comment to report' });
  }
  return value;
});

export const updateReportSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED').required(),
  moderatorNotes: Joi.string().max(500).optional()
});

export const suspendUserSchema = Joi.object({
  reason: Joi.string().min(1).max(200).required(),
  duration: Joi.number().integer().min(0).max(365).required() // days
});

export const deleteContentSchema = Joi.object({
  reason: Joi.string().min(1).max(200).required()
});

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: validationErrors
      });
      return;
    }

    // Replace req.query with validated and sanitized data
    req.query = value;
    next();
  };
};

// Params validation middleware
export const validateParams = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      res.status(400).json({
        success: false,
        error: 'Parameter validation failed',
        details: validationErrors
      });
      return;
    }

    // Replace req.params with validated and sanitized data
    req.params = value;
    next();
  };
};

// Custom validation helpers
export const validateObjectId = (value: string, helpers: Joi.CustomHelpers): string | Joi.ErrorReport => {
  // Basic validation for MongoDB ObjectId format
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  if (!objectIdRegex.test(value)) {
    return helpers.error('any.invalid', { message: 'Invalid ID format' });
  }
  return value;
};

export const validateSlug = (value: string, helpers: Joi.CustomHelpers): string | Joi.ErrorReport => {
  // Validate slug format (lowercase, alphanumeric, hyphens, underscores)
  const slugRegex = /^[a-z0-9-_]+$/;
  if (!slugRegex.test(value)) {
    return helpers.error('any.invalid', { message: 'Invalid slug format' });
  }
  return value;
};

export const validateEmail = (value: string, helpers: Joi.CustomHelpers): string | Joi.ErrorReport => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return helpers.error('any.invalid', { message: 'Invalid email format' });
  }
  return value;
};

export const validateUsername = (value: string, helpers: Joi.CustomHelpers): string | Joi.ErrorReport => {
  // Username: 3-20 characters, alphanumeric, underscores, hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  if (!usernameRegex.test(value)) {
    return helpers.error('any.invalid', { message: 'Username must be 3-20 characters, alphanumeric with underscores and hyphens' });
  }
  return value;
};
