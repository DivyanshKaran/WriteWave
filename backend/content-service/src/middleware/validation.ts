import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../config/logger';

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
  // Character validation
  character: Joi.object({
    character: Joi.string()
      .max(10)
      .required()
      .messages({
        'string.max': 'Character must be no more than 10 characters',
        'any.required': 'Character is required',
      }),
    type: Joi.string()
      .valid('HIRAGANA', 'KATAKANA', 'KANJI')
      .required()
      .messages({
        'any.only': 'Type must be one of: HIRAGANA, KATAKANA, KANJI',
        'any.required': 'Type is required',
      }),
    jlptLevel: Joi.string()
      .valid('N5', 'N4', 'N3', 'N2', 'N1')
      .optional()
      .messages({
        'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
      }),
    difficultyLevel: Joi.string()
      .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
      .optional()
      .messages({
        'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
      }),
    meaning: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Meaning must be no more than 500 characters',
      }),
    pronunciation: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Pronunciation must be no more than 100 characters',
      }),
    romanization: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Romanization must be no more than 100 characters',
      }),
    strokeCount: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'number.min': 'Stroke count must be at least 1',
        'number.max': 'Stroke count must be no more than 50',
        'number.integer': 'Stroke count must be a whole number',
      }),
    strokeOrder: Joi.any()
      .optional(),
    strokePatterns: Joi.any()
      .optional(),
    kunyomi: Joi.array()
      .items(Joi.string().max(50))
      .optional()
      .messages({
        'string.max': 'Each kunyomi reading must be no more than 50 characters',
      }),
    onyomi: Joi.array()
      .items(Joi.string().max(50))
      .optional()
      .messages({
        'string.max': 'Each onyomi reading must be no more than 50 characters',
      }),
    radical: Joi.string()
      .max(10)
      .optional()
      .messages({
        'string.max': 'Radical must be no more than 10 characters',
      }),
    radicalMeaning: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Radical meaning must be no more than 200 characters',
      }),
    examples: Joi.any()
      .optional(),
    usageNotes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Usage notes must be no more than 1000 characters',
      }),
    learningOrder: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.min': 'Learning order must be at least 1',
        'number.max': 'Learning order must be no more than 1000',
        'number.integer': 'Learning order must be a whole number',
      }),
  }),

  // Vocabulary validation
  vocabulary: Joi.object({
    japanese: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'Japanese text must be no more than 100 characters',
        'any.required': 'Japanese text is required',
      }),
    english: Joi.string()
      .max(500)
      .required()
      .messages({
        'string.max': 'English translation must be no more than 500 characters',
        'any.required': 'English translation is required',
      }),
    romanization: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Romanization must be no more than 100 characters',
      }),
    category: Joi.string()
      .valid('FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS', 'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER')
      .optional()
      .messages({
        'any.only': 'Category must be one of the valid vocabulary categories',
      }),
    jlptLevel: Joi.string()
      .valid('N5', 'N4', 'N3', 'N2', 'N1')
      .optional()
      .messages({
        'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
      }),
    difficultyLevel: Joi.string()
      .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
      .optional()
      .messages({
        'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
      }),
    partOfSpeech: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Part of speech must be no more than 50 characters',
      }),
    pronunciation: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Pronunciation must be no more than 100 characters',
      }),
    audioUrl: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Audio URL must be a valid URI',
      }),
    exampleSentences: Joi.any()
      .optional(),
    usageNotes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Usage notes must be no more than 1000 characters',
      }),
    culturalNotes: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Cultural notes must be no more than 1000 characters',
      }),
    frequency: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .optional()
      .messages({
        'number.min': 'Frequency must be at least 1',
        'number.max': 'Frequency must be no more than 10000',
        'number.integer': 'Frequency must be a whole number',
      }),
  }),

  // Lesson validation
  lesson: Joi.object({
    title: Joi.string()
      .max(200)
      .required()
      .messages({
        'string.max': 'Title must be no more than 200 characters',
        'any.required': 'Title is required',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Description must be no more than 1000 characters',
      }),
    type: Joi.string()
      .valid('CHARACTER_LEARNING', 'VOCABULARY_LEARNING', 'GRAMMAR_LEARNING', 'READING_PRACTICE', 'LISTENING_PRACTICE', 'WRITING_PRACTICE')
      .required()
      .messages({
        'any.only': 'Type must be one of the valid lesson types',
        'any.required': 'Type is required',
      }),
    jlptLevel: Joi.string()
      .valid('N5', 'N4', 'N3', 'N2', 'N1')
      .optional()
      .messages({
        'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
      }),
    difficultyLevel: Joi.string()
      .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
      .optional()
      .messages({
        'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
      }),
    content: Joi.any()
      .optional(),
    objectives: Joi.array()
      .items(Joi.string().max(200))
      .optional()
      .messages({
        'string.max': 'Each objective must be no more than 200 characters',
      }),
    prerequisites: Joi.array()
      .items(Joi.string().max(100))
      .optional()
      .messages({
        'string.max': 'Each prerequisite must be no more than 100 characters',
      }),
    estimatedTime: Joi.number()
      .integer()
      .min(1)
      .max(300)
      .optional()
      .messages({
        'number.min': 'Estimated time must be at least 1 minute',
        'number.max': 'Estimated time must be no more than 300 minutes',
        'number.integer': 'Estimated time must be a whole number',
      }),
    learningOrder: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.min': 'Learning order must be at least 1',
        'number.max': 'Learning order must be no more than 1000',
        'number.integer': 'Learning order must be a whole number',
      }),
  }),

  // Media validation
  media: Joi.object({
    filename: Joi.string()
      .max(255)
      .required()
      .messages({
        'string.max': 'Filename must be no more than 255 characters',
        'any.required': 'Filename is required',
      }),
    originalName: Joi.string()
      .max(255)
      .required()
      .messages({
        'string.max': 'Original name must be no more than 255 characters',
        'any.required': 'Original name is required',
      }),
    mimeType: Joi.string()
      .max(100)
      .required()
      .messages({
        'string.max': 'MIME type must be no more than 100 characters',
        'any.required': 'MIME type is required',
      }),
    size: Joi.number()
      .integer()
      .min(1)
      .max(10485760) // 10MB
      .required()
      .messages({
        'number.min': 'File size must be at least 1 byte',
        'number.max': 'File size must be no more than 10MB',
        'number.integer': 'File size must be a whole number',
        'any.required': 'File size is required',
      }),
    type: Joi.string()
      .valid('IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION')
      .required()
      .messages({
        'any.only': 'Type must be one of: IMAGE, AUDIO, VIDEO, ANIMATION',
        'any.required': 'Type is required',
      }),
    url: Joi.string()
      .uri()
      .required()
      .messages({
        'string.uri': 'URL must be a valid URI',
        'any.required': 'URL is required',
      }),
    thumbnailUrl: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Thumbnail URL must be a valid URI',
      }),
    altText: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Alt text must be no more than 500 characters',
      }),
    description: Joi.string()
      .max(1000)
      .optional()
      .messages({
        'string.max': 'Description must be no more than 1000 characters',
      }),
    width: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .optional()
      .messages({
        'number.min': 'Width must be at least 1 pixel',
        'number.max': 'Width must be no more than 10000 pixels',
        'number.integer': 'Width must be a whole number',
      }),
    height: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .optional()
      .messages({
        'number.min': 'Height must be at least 1 pixel',
        'number.max': 'Height must be no more than 10000 pixels',
        'number.integer': 'Height must be a whole number',
      }),
    duration: Joi.number()
      .integer()
      .min(1)
      .max(3600)
      .optional()
      .messages({
        'number.min': 'Duration must be at least 1 second',
        'number.max': 'Duration must be no more than 3600 seconds',
        'number.integer': 'Duration must be a whole number',
      }),
    characterId: Joi.string()
      .optional(),
    vocabularyWordId: Joi.string()
      .optional(),
    lessonId: Joi.string()
      .optional(),
  }),

  // Search validation
  search: Joi.object({
    query: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Search query must be no more than 100 characters',
      }),
    type: Joi.string()
      .valid('HIRAGANA', 'KATAKANA', 'KANJI')
      .optional()
      .messages({
        'any.only': 'Type must be one of: HIRAGANA, KATAKANA, KANJI',
      }),
    jlptLevel: Joi.string()
      .valid('N5', 'N4', 'N3', 'N2', 'N1')
      .optional()
      .messages({
        'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
      }),
    difficultyLevel: Joi.string()
      .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
      .optional()
      .messages({
        'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
      }),
    category: Joi.string()
      .valid('FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS', 'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER')
      .optional()
      .messages({
        'any.only': 'Category must be one of the valid vocabulary categories',
      }),
    page: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .optional()
      .messages({
        'number.min': 'Page must be at least 1',
        'number.max': 'Page must be no more than 1000',
        'number.integer': 'Page must be a whole number',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit must be no more than 100',
        'number.integer': 'Limit must be a whole number',
      }),
  }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .max(1000)
      .default(1)
      .optional()
      .messages({
        'number.min': 'Page must be at least 1',
        'number.max': 'Page must be no more than 1000',
        'number.integer': 'Page must be a whole number',
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(20)
      .optional()
      .messages({
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit must be no more than 100',
        'number.integer': 'Limit must be a whole number',
      }),
    sortBy: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Sort by field must be no more than 50 characters',
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .optional()
      .messages({
        'any.only': 'Sort order must be either asc or desc',
      }),
  }),

  // ID parameter validation
  idParam: Joi.object({
    id: Joi.string()
      .required()
      .messages({
        'any.required': 'ID is required',
      }),
  }),

  // Character ID parameter validation
  characterIdParam: Joi.object({
    characterId: Joi.string()
      .required()
      .messages({
        'any.required': 'Character ID is required',
      }),
  }),

  // Vocabulary ID parameter validation
  vocabularyIdParam: Joi.object({
    vocabularyId: Joi.string()
      .required()
      .messages({
        'any.required': 'Vocabulary ID is required',
      }),
  }),

  // Lesson ID parameter validation
  lessonIdParam: Joi.object({
    lessonId: Joi.string()
      .required()
      .messages({
        'any.required': 'Lesson ID is required',
      }),
  }),

  // Media ID parameter validation
  mediaIdParam: Joi.object({
    mediaId: Joi.string()
      .required()
      .messages({
        'any.required': 'Media ID is required',
      }),
  }),
};

// Custom validation functions
export const validateCharacterType = (type: string): boolean => {
  return ['HIRAGANA', 'KATAKANA', 'KANJI'].includes(type);
};

export const validateJLPTLevel = (level: string): boolean => {
  return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(level);
};

export const validateDifficultyLevel = (level: string): boolean => {
  return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(level);
};

export const validateMediaType = (type: string): boolean => {
  return ['IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION'].includes(type);
};

export const validateVocabularyCategory = (category: string): boolean => {
  const validCategories = [
    'FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS',
    'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS',
    'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER'
  ];
  return validCategories.includes(category);
};

export const validateLessonType = (type: string): boolean => {
  const validTypes = [
    'CHARACTER_LEARNING', 'VOCABULARY_LEARNING', 'GRAMMAR_LEARNING',
    'READING_PRACTICE', 'LISTENING_PRACTICE', 'WRITING_PRACTICE'
  ];
  return validTypes.includes(type);
};

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[<>]/g, '').substring(0, 100);
};

// Export validation schemas
export default validationSchemas;

// Export validateRequest as an alias for validate
export const validateRequest = validate;
