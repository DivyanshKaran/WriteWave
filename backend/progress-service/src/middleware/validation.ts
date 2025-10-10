import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '@/config/logger';

// Validation middleware
export const validate = (schema: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationSchema = getValidationSchema(schema);
    
    if (!validationSchema) {
      logger.error('Validation schema not found', { schema });
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found',
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const { error, value } = validationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation failed', { 
        schema, 
        errors: errorDetails,
        body: req.body 
      });

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'VALIDATION_ERROR',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

// Get validation schema by name
const getValidationSchema = (schemaName: string): Joi.ObjectSchema | null => {
  const schemas: Record<string, Joi.ObjectSchema> = {
    // User Progress schemas
    userProgress: Joi.object({
      userId: Joi.string().required(),
      currentLevel: Joi.number().integer().min(1).optional(),
      totalXp: Joi.number().integer().min(0).optional(),
      currentXp: Joi.number().integer().min(0).optional(),
      xpToNextLevel: Joi.number().integer().min(0).optional(),
      levelName: Joi.string().optional(),
      streakCount: Joi.number().integer().min(0).optional(),
      longestStreak: Joi.number().integer().min(0).optional(),
      lastActivityDate: Joi.date().optional(),
      totalStudyTime: Joi.number().integer().min(0).optional(),
      charactersLearned: Joi.number().integer().min(0).optional(),
      charactersMastered: Joi.number().integer().min(0).optional(),
      perfectScores: Joi.number().integer().min(0).optional(),
      achievementsCount: Joi.number().integer().min(0).optional()
    }),

    // XP Transaction schemas
    xpTransaction: Joi.object({
      userId: Joi.string().required(),
      amount: Joi.number().integer().min(1).required(),
      source: Joi.string().valid(
        'CHARACTER_PRACTICE',
        'PERFECT_STROKE',
        'DAILY_STREAK',
        'ACHIEVEMENT_UNLOCK',
        'LESSON_COMPLETION',
        'VOCABULARY_LEARNED',
        'STREAK_MILESTONE',
        'PERFECT_SCORE',
        'DAILY_LOGIN',
        'WEEKLY_CHALLENGE',
        'MONTHLY_CHALLENGE',
        'SOCIAL_SHARE',
        'REVIEW_SESSION',
        'MISTAKE_CORRECTION',
        'SPEED_CHALLENGE'
      ).required(),
      description: Joi.string().max(500).required(),
      metadata: Joi.object().optional()
    }),

    // Character Mastery schemas
    characterMastery: Joi.object({
      userId: Joi.string().required(),
      characterId: Joi.string().required(),
      characterType: Joi.string().valid('HIRAGANA', 'KATAKANA', 'KANJI').required(),
      masteryLevel: Joi.string().valid('LEARNING', 'PRACTICING', 'MASTERED', 'EXPERT').optional(),
      accuracyScore: Joi.number().min(0).max(100).optional(),
      practiceCount: Joi.number().integer().min(0).optional(),
      correctCount: Joi.number().integer().min(0).optional(),
      totalTimeSpent: Joi.number().integer().min(0).optional(),
      lastPracticed: Joi.date().optional(),
      nextReviewDate: Joi.date().optional(),
      streakCount: Joi.number().integer().min(0).optional(),
      difficultyRating: Joi.number().min(0).max(10).optional(),
      strokeOrderScore: Joi.number().min(0).max(100).optional(),
      recognitionScore: Joi.number().min(0).max(100).optional()
    }),

    // Practice Session schemas
    practiceSession: Joi.object({
      characterMasteryId: Joi.string().required(),
      userId: Joi.string().required(),
      characterId: Joi.string().required(),
      startTime: Joi.date().required(),
      endTime: Joi.date().optional(),
      duration: Joi.number().integer().min(0).optional(),
      accuracy: Joi.number().min(0).max(100).optional(),
      strokesCorrect: Joi.number().integer().min(0).optional(),
      strokesTotal: Joi.number().integer().min(1).optional(),
      xpEarned: Joi.number().integer().min(0).optional(),
      isPerfect: Joi.boolean().optional(),
      notes: Joi.string().max(1000).optional()
    }),

    // Achievement schemas
    achievement: Joi.object({
      name: Joi.string().max(100).required(),
      description: Joi.string().max(500).required(),
      category: Joi.string().valid(
        'LEARNING',
        'PRACTICE',
        'STREAK',
        'MASTERY',
        'SOCIAL',
        'SPECIAL',
        'MILESTONE',
        'CHALLENGE'
      ).required(),
      rarity: Joi.string().valid('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY').required(),
      icon: Joi.string().max(200).optional(),
      xpReward: Joi.number().integer().min(0).optional(),
      badgeReward: Joi.string().max(100).optional(),
      unlockCondition: Joi.object().required(),
      isActive: Joi.boolean().optional()
    }),

    // User Achievement schemas
    userAchievement: Joi.object({
      userId: Joi.string().required(),
      achievementId: Joi.string().required(),
      progress: Joi.object().optional(),
      isUnlocked: Joi.boolean().optional(),
      unlockedAt: Joi.date().optional()
    }),

    // Streak schemas
    streak: Joi.object({
      userId: Joi.string().required(),
      type: Joi.string().valid(
        'DAILY_LOGIN',
        'DAILY_PRACTICE',
        'PERFECT_SCORE',
        'WEEKLY_STUDY',
        'MONTHLY_GOAL'
      ).required(),
      currentCount: Joi.number().integer().min(0).optional(),
      longestCount: Joi.number().integer().min(0).optional(),
      lastActivity: Joi.date().optional(),
      freezeCount: Joi.number().integer().min(0).optional(),
      isActive: Joi.boolean().optional()
    }),

    // User Analytics schemas
    userAnalytics: Joi.object({
      userId: Joi.string().required(),
      date: Joi.date().optional(),
      studyTimeMinutes: Joi.number().integer().min(0).optional(),
      charactersPracticed: Joi.number().integer().min(0).optional(),
      accuracyAverage: Joi.number().min(0).max(100).optional(),
      xpEarned: Joi.number().integer().min(0).optional(),
      achievementsUnlocked: Joi.number().integer().min(0).optional(),
      streakMaintained: Joi.boolean().optional(),
      weakAreas: Joi.object().optional(),
      improvementTrends: Joi.object().optional(),
      predictions: Joi.object().optional()
    }),

    // Leaderboard schemas
    leaderboard: Joi.object({
      userId: Joi.string().required(),
      period: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME').required(),
      rank: Joi.number().integer().min(1).required(),
      score: Joi.number().integer().min(0).required(),
      metadata: Joi.object().optional()
    }),

    // Character Practice schemas
    characterPractice: Joi.object({
      userId: Joi.string().required(),
      characterId: Joi.string().required(),
      characterType: Joi.string().valid('HIRAGANA', 'KATAKANA', 'KANJI').required(),
      accuracy: Joi.number().min(0).max(100).required(),
      timeSpent: Joi.number().integer().min(0).required(),
      isPerfect: Joi.boolean().required(),
      strokesCorrect: Joi.number().integer().min(0).required(),
      strokesTotal: Joi.number().integer().min(1).required()
    }),

    // Pagination schemas
    pagination: Joi.object({
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional(),
      sortBy: Joi.string().optional(),
      sortOrder: Joi.string().valid('asc', 'desc').optional()
    }),

    // Search schemas
    search: Joi.object({
      q: Joi.string().min(1).max(100).required(),
      category: Joi.string().optional(),
      type: Joi.string().optional(),
      level: Joi.string().optional(),
      difficulty: Joi.string().optional(),
      page: Joi.number().integer().min(1).optional(),
      limit: Joi.number().integer().min(1).max(100).optional()
    }),

    // Analytics schemas
    analytics: Joi.object({
      userId: Joi.string().required(),
      period: Joi.string().valid('7d', '30d', '90d', '1y').optional(),
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional()
    }),

    // Leaderboard query schemas
    leaderboardQuery: Joi.object({
      period: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME').required(),
      limit: Joi.number().integer().min(1).max(1000).optional(),
      offset: Joi.number().integer().min(0).optional()
    })
  };

  return schemas[schemaName] || null;
};

// Query parameter validation middleware
export const validateQuery = (schema: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationSchema = getValidationSchema(schema);
    
    if (!validationSchema) {
      logger.error('Validation schema not found', { schema });
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found',
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const { error, value } = validationSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Query validation failed', { 
        schema, 
        errors: errorDetails,
        query: req.query 
      });

      return res.status(400).json({
        success: false,
        message: 'Query validation failed',
        error: 'VALIDATION_ERROR',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Replace req.query with validated and sanitized data
    req.query = value;
    next();
  };
};

// Parameter validation middleware
export const validateParams = (schema: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationSchema = getValidationSchema(schema);
    
    if (!validationSchema) {
      logger.error('Validation schema not found', { schema });
      return res.status(500).json({
        success: false,
        message: 'Validation schema not found',
        error: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    const { error, value } = validationSchema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Parameter validation failed', { 
        schema, 
        errors: errorDetails,
        params: req.params 
      });

      return res.status(400).json({
        success: false,
        message: 'Parameter validation failed',
        error: 'VALIDATION_ERROR',
        details: errorDetails,
        timestamp: new Date().toISOString()
      });
    }

    // Replace req.params with validated and sanitized data
    req.params = value;
    next();
  };
};

// Custom validation for specific fields
export const validateUserId = (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required',
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

export const validateCharacterId = (req: Request, res: Response, next: NextFunction) => {
  const { characterId } = req.params;
  
  if (!characterId || typeof characterId !== 'string' || characterId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid character ID is required',
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

export const validateAchievementId = (req: Request, res: Response, next: NextFunction) => {
  const { achievementId } = req.params;
  
  if (!achievementId || typeof achievementId !== 'string' || achievementId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid achievement ID is required',
      error: 'VALIDATION_ERROR',
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Export validation schemas for use in other modules
export { getValidationSchema };
