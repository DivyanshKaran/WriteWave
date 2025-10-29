import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError, ValidationErrorDetail } from './errors';
import { logger } from './logger';

/**
 * Validation options interface
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  convert?: boolean;
  allowUnknown?: boolean;
  skipFunctions?: boolean;
  dateFormat?: string;
  presence?: 'optional' | 'required' | 'forbidden';
}

/**
 * Validation result interface
 */
export interface ValidationResult<T = any> {
  value: T;
  error?: ValidationError;
}

/**
 * Custom validation messages
 */
export const validationMessages = {
  required: 'This field is required',
  email: 'Please provide a valid email address',
  min: 'Value must be at least {#limit} characters',
  max: 'Value must not exceed {#limit} characters',
  pattern: 'Value does not match the required pattern',
  unique: 'This value is already taken',
  password: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  username: 'Username must be 3-30 characters long and contain only letters, numbers, underscores, and hyphens',
  url: 'Please provide a valid URL',
  date: 'Please provide a valid date',
  number: 'Please provide a valid number',
  integer: 'Please provide a valid integer',
  boolean: 'Please provide a valid boolean value',
  array: 'Please provide a valid array',
  object: 'Please provide a valid object'
};

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // ID validation
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Please provide a valid ID',
    'any.required': validationMessages.required
  }),

  // Email validation
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(254)
    .lowercase()
    .trim()
    .required()
    .messages({
      'string.email': validationMessages.email,
      'string.max': 'Email must not exceed 254 characters',
      'any.required': validationMessages.required
    }),

  // Password validation
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': validationMessages.min,
      'string.max': validationMessages.max,
      'string.pattern.base': validationMessages.password,
      'any.required': validationMessages.required
    }),

  // Username validation
  username: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^[a-zA-Z0-9_-]+$/)
    .required()
    .messages({
      'string.min': validationMessages.min,
      'string.max': validationMessages.max,
      'string.pattern.base': validationMessages.username,
      'any.required': validationMessages.required
    }),

  // Name validation
  name: Joi.string()
    .min(1)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': validationMessages.min,
      'string.max': validationMessages.max,
      'any.required': validationMessages.required
    }),

  // URL validation
  url: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .max(2048)
    .messages({
      'string.uri': validationMessages.url,
      'string.max': 'URL must not exceed 2048 characters'
    }),

  // Date validation
  date: Joi.date()
    .iso()
    .messages({
      'date.format': validationMessages.date
    }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sortBy: Joi.string().max(50).default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Search validation
  search: Joi.object({
    query: Joi.string().min(1).max(100).trim().required(),
    filters: Joi.object().default({}),
    ...commonSchemas.pagination.describe().keys
  }),

  // File upload validation
  fileUpload: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().max(10 * 1024 * 1024), // 10MB max
    buffer: Joi.binary().required()
  }),

  // JWT token validation
  jwtToken: Joi.string()
    .pattern(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid JWT token',
      'any.required': validationMessages.required
    })
};

/**
 * User-specific validation schemas
 */
export const userSchemas = {
  // User registration
  registration: Joi.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    username: commonSchemas.username,
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    acceptTerms: Joi.boolean().valid(true).required().messages({
      'any.only': 'You must accept the terms and conditions'
    })
  }),

  // User login
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required().messages({
      'any.required': validationMessages.required
    }),
    rememberMe: Joi.boolean().default(false)
  }),

  // Profile update
  profileUpdate: Joi.object({
    firstName: commonSchemas.name.optional(),
    lastName: commonSchemas.name.optional(),
    bio: Joi.string().max(500).trim().allow(''),
    website: commonSchemas.url.optional(),
    location: Joi.string().max(100).trim().allow(''),
    dateOfBirth: commonSchemas.date.optional(),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional()
  }),

  // Password change
  passwordChange: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': validationMessages.required
    }),
    newPassword: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': validationMessages.required
    })
  }),

  // Password reset
  passwordReset: Joi.object({
    token: Joi.string().required().messages({
      'any.required': validationMessages.required
    }),
    password: commonSchemas.password,
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
      'any.required': validationMessages.required
    })
  })
};

/**
 * Content-specific validation schemas
 */
export const contentSchemas = {
  // Character creation
  character: Joi.object({
    character: Joi.string().length(1).required().messages({
      'string.length': 'Character must be exactly 1 character',
      'any.required': validationMessages.required
    }),
    type: Joi.string().valid('HIRAGANA', 'KATAKANA', 'KANJI').required(),
    pronunciation: Joi.string().max(50).trim().required(),
    meaning: Joi.string().max(200).trim().required(),
    strokeOrder: Joi.array().items(Joi.string()).optional(),
    examples: Joi.array().items(Joi.string().max(100)).max(10).optional(),
    jlptLevel: Joi.number().integer().min(1).max(5).optional(),
    difficulty: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').optional()
  }),

  // Vocabulary creation
  vocabulary: Joi.object({
    word: Joi.string().min(1).max(50).trim().required(),
    reading: Joi.string().max(100).trim().required(),
    meaning: Joi.string().max(500).trim().required(),
    partOfSpeech: Joi.string().max(50).trim().required(),
    category: Joi.string().max(50).trim().optional(),
    jlptLevel: Joi.number().integer().min(1).max(5).optional(),
    examples: Joi.array().items(Joi.string().max(200)).max(5).optional()
  }),

  // Lesson creation
  lesson: Joi.object({
    title: Joi.string().min(1).max(200).trim().required(),
    description: Joi.string().max(1000).trim().required(),
    content: Joi.string().min(1).required(),
    type: Joi.string().valid('CHARACTER', 'VOCABULARY', 'GRAMMAR', 'CULTURE').required(),
    level: Joi.string().valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED').required(),
    estimatedDuration: Joi.number().integer().min(1).max(300).optional(), // minutes
    prerequisites: Joi.array().items(commonSchemas.id).optional(),
    tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
  })
};

/**
 * Community-specific validation schemas
 */
export const communitySchemas = {
  // Post creation
  post: Joi.object({
    title: Joi.string().min(1).max(200).trim().required(),
    content: Joi.string().min(1).max(10000).trim().required(),
    categoryId: commonSchemas.id,
    tags: Joi.array().items(Joi.string().max(50)).max(5).optional(),
    isPrivate: Joi.boolean().default(false)
  }),

  // Comment creation
  comment: Joi.object({
    content: Joi.string().min(1).max(2000).trim().required(),
    parentId: commonSchemas.id.optional()
  }),

  // Study group creation
  studyGroup: Joi.object({
    name: Joi.string().min(1).max(100).trim().required(),
    description: Joi.string().max(1000).trim().required(),
    isPrivate: Joi.boolean().default(false),
    maxMembers: Joi.number().integer().min(2).max(100).default(50),
    tags: Joi.array().items(Joi.string().max(50)).max(5).optional()
  }),

  // Friend request
  friendRequest: Joi.object({
    receiverId: commonSchemas.id,
    message: Joi.string().max(200).trim().optional()
  })
};

/**
 * Progress-specific validation schemas
 */
export const progressSchemas = {
  // Character practice
  characterPractice: Joi.object({
    characterId: commonSchemas.id,
    accuracy: Joi.number().min(0).max(100).required(),
    timeSpent: Joi.number().integer().min(1).required(), // seconds
    attempts: Joi.number().integer().min(1).required()
  }),

  // XP transaction
  xpTransaction: Joi.object({
    amount: Joi.number().integer().min(1).max(1000).required(),
    source: Joi.string().max(50).required(),
    description: Joi.string().max(200).optional()
  }),

  // Achievement check
  achievementCheck: Joi.object({
    userId: commonSchemas.id,
    achievementType: Joi.string().max(50).required(),
    metadata: Joi.object().optional()
  })
};

/**
 * Validation middleware factory
 */
export const validate = (
  schema: Joi.ObjectSchema,
  options: ValidationOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  const defaultOptions: ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    allowUnknown: false,
    skipFunctions: false,
    presence: 'optional'
  };

  const validationOptions = { ...defaultOptions, ...options };

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { error, value } = schema.validate(req.body, validationOptions);

      if (error) {
        const errors: ValidationErrorDetail[] = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
          code: detail.type
        }));

        logger.warn('Validation failed', {
          errors,
          url: req.url,
          method: req.method,
          ip: req.ip,
          requestId: (req as any).id
        });

        throw new ValidationError('Validation failed', errors);
      }

      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Query validation middleware
 */
export const validateQuery = (
  schema: Joi.ObjectSchema,
  options: ValidationOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return validate(schema, { ...options, presence: 'optional' });
};

/**
 * Params validation middleware
 */
export const validateParams = (
  schema: Joi.ObjectSchema,
  options: ValidationOptions = {}
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return validate(schema, { ...options, presence: 'required' });
};

/**
 * Validate data without middleware
 */
export const validateData = <T>(
  data: any,
  schema: Joi.ObjectSchema,
  options: ValidationOptions = {}
): ValidationResult<T> => {
  const defaultOptions: ValidationOptions = {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
    allowUnknown: false,
    skipFunctions: false,
    presence: 'optional'
  };

  const validationOptions = { ...defaultOptions, ...options };
  const { error, value } = schema.validate(data, validationOptions);

  if (error) {
    const errors: ValidationErrorDetail[] = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
      code: detail.type
    }));

    return {
      value: data,
      error: new ValidationError('Validation failed', errors)
    };
  }

  return { value };
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (data: any): any => {
  if (typeof data === 'string') {
    return data.trim();
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeInput);
  }
  
  if (data && typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

/**
 * Validate file upload
 */
export const validateFile = (
  file: Express.Multer.File,
  allowedTypes: string[],
  maxSize: number = 10 * 1024 * 1024 // 10MB
): ValidationResult<Express.Multer.File> => {
  const errors: ValidationErrorDetail[] = [];

  if (!file) {
    errors.push({
      field: 'file',
      message: 'File is required',
      code: 'any.required'
    });
  } else {
    if (!allowedTypes.includes(file.mimetype)) {
      errors.push({
        field: 'file',
        message: `File type ${file.mimetype} is not allowed`,
        code: 'string.pattern'
      });
    }

    if (file.size > maxSize) {
      errors.push({
        field: 'file',
        message: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
        code: 'number.max'
      });
    }
  }

  if (errors.length > 0) {
    return {
      value: file,
      error: new ValidationError('File validation failed', errors)
    };
  }

  return { value: file };
};

/**
 * Export all schemas
 */
export const schemas = {
  common: commonSchemas,
  user: userSchemas,
  content: contentSchemas,
  community: communitySchemas,
  progress: progressSchemas
};
