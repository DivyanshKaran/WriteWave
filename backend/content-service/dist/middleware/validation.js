"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.sanitizeSearchQuery = exports.sanitizeString = exports.validateLessonType = exports.validateVocabularyCategory = exports.validateMediaType = exports.validateDifficultyLevel = exports.validateJLPTLevel = exports.validateCharacterType = exports.validationSchemas = exports.validateParams = exports.validateQuery = exports.validate = exports.ValidationError = void 0;
const joi_1 = __importDefault(require("joi"));
const logger_1 = require("../config/logger");
class ValidationError extends Error {
    constructor(message, errors = []) {
        super(message);
        this.statusCode = 400;
        this.name = 'ValidationError';
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
const validate = (schema) => {
    return (req, res, next) => {
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
                logger_1.logger.warn('Validation failed', {
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
            req.body = value;
            next();
        }
        catch (error) {
            logger_1.logger.error('Validation middleware error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validate = validate;
const validateQuery = (schema) => {
    return (req, res, next) => {
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
                logger_1.logger.warn('Query validation failed', {
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
        }
        catch (error) {
            logger_1.logger.error('Query validation middleware error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
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
                logger_1.logger.warn('Params validation failed', {
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
        }
        catch (error) {
            logger_1.logger.error('Params validation middleware error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    };
};
exports.validateParams = validateParams;
exports.validationSchemas = {
    character: joi_1.default.object({
        character: joi_1.default.string()
            .max(10)
            .required()
            .messages({
            'string.max': 'Character must be no more than 10 characters',
            'any.required': 'Character is required',
        }),
        type: joi_1.default.string()
            .valid('HIRAGANA', 'KATAKANA', 'KANJI')
            .required()
            .messages({
            'any.only': 'Type must be one of: HIRAGANA, KATAKANA, KANJI',
            'any.required': 'Type is required',
        }),
        jlptLevel: joi_1.default.string()
            .valid('N5', 'N4', 'N3', 'N2', 'N1')
            .optional()
            .messages({
            'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
        }),
        difficultyLevel: joi_1.default.string()
            .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
            .optional()
            .messages({
            'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
        }),
        meaning: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': 'Meaning must be no more than 500 characters',
        }),
        pronunciation: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Pronunciation must be no more than 100 characters',
        }),
        romanization: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Romanization must be no more than 100 characters',
        }),
        strokeCount: joi_1.default.number()
            .integer()
            .min(1)
            .max(50)
            .optional()
            .messages({
            'number.min': 'Stroke count must be at least 1',
            'number.max': 'Stroke count must be no more than 50',
            'number.integer': 'Stroke count must be a whole number',
        }),
        strokeOrder: joi_1.default.any()
            .optional(),
        strokePatterns: joi_1.default.any()
            .optional(),
        kunyomi: joi_1.default.array()
            .items(joi_1.default.string().max(50))
            .optional()
            .messages({
            'string.max': 'Each kunyomi reading must be no more than 50 characters',
        }),
        onyomi: joi_1.default.array()
            .items(joi_1.default.string().max(50))
            .optional()
            .messages({
            'string.max': 'Each onyomi reading must be no more than 50 characters',
        }),
        radical: joi_1.default.string()
            .max(10)
            .optional()
            .messages({
            'string.max': 'Radical must be no more than 10 characters',
        }),
        radicalMeaning: joi_1.default.string()
            .max(200)
            .optional()
            .messages({
            'string.max': 'Radical meaning must be no more than 200 characters',
        }),
        examples: joi_1.default.any()
            .optional(),
        usageNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': 'Usage notes must be no more than 1000 characters',
        }),
        learningOrder: joi_1.default.number()
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
    vocabulary: joi_1.default.object({
        japanese: joi_1.default.string()
            .max(100)
            .required()
            .messages({
            'string.max': 'Japanese text must be no more than 100 characters',
            'any.required': 'Japanese text is required',
        }),
        english: joi_1.default.string()
            .max(500)
            .required()
            .messages({
            'string.max': 'English translation must be no more than 500 characters',
            'any.required': 'English translation is required',
        }),
        romanization: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Romanization must be no more than 100 characters',
        }),
        category: joi_1.default.string()
            .valid('FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS', 'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER')
            .optional()
            .messages({
            'any.only': 'Category must be one of the valid vocabulary categories',
        }),
        jlptLevel: joi_1.default.string()
            .valid('N5', 'N4', 'N3', 'N2', 'N1')
            .optional()
            .messages({
            'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
        }),
        difficultyLevel: joi_1.default.string()
            .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
            .optional()
            .messages({
            'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
        }),
        partOfSpeech: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'Part of speech must be no more than 50 characters',
        }),
        pronunciation: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Pronunciation must be no more than 100 characters',
        }),
        audioUrl: joi_1.default.string()
            .uri()
            .optional()
            .messages({
            'string.uri': 'Audio URL must be a valid URI',
        }),
        exampleSentences: joi_1.default.any()
            .optional(),
        usageNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': 'Usage notes must be no more than 1000 characters',
        }),
        culturalNotes: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': 'Cultural notes must be no more than 1000 characters',
        }),
        frequency: joi_1.default.number()
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
    lesson: joi_1.default.object({
        title: joi_1.default.string()
            .max(200)
            .required()
            .messages({
            'string.max': 'Title must be no more than 200 characters',
            'any.required': 'Title is required',
        }),
        description: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': 'Description must be no more than 1000 characters',
        }),
        type: joi_1.default.string()
            .valid('CHARACTER_LEARNING', 'VOCABULARY_LEARNING', 'GRAMMAR_LEARNING', 'READING_PRACTICE', 'LISTENING_PRACTICE', 'WRITING_PRACTICE')
            .required()
            .messages({
            'any.only': 'Type must be one of the valid lesson types',
            'any.required': 'Type is required',
        }),
        jlptLevel: joi_1.default.string()
            .valid('N5', 'N4', 'N3', 'N2', 'N1')
            .optional()
            .messages({
            'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
        }),
        difficultyLevel: joi_1.default.string()
            .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
            .optional()
            .messages({
            'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
        }),
        content: joi_1.default.any()
            .optional(),
        objectives: joi_1.default.array()
            .items(joi_1.default.string().max(200))
            .optional()
            .messages({
            'string.max': 'Each objective must be no more than 200 characters',
        }),
        prerequisites: joi_1.default.array()
            .items(joi_1.default.string().max(100))
            .optional()
            .messages({
            'string.max': 'Each prerequisite must be no more than 100 characters',
        }),
        estimatedTime: joi_1.default.number()
            .integer()
            .min(1)
            .max(300)
            .optional()
            .messages({
            'number.min': 'Estimated time must be at least 1 minute',
            'number.max': 'Estimated time must be no more than 300 minutes',
            'number.integer': 'Estimated time must be a whole number',
        }),
        learningOrder: joi_1.default.number()
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
    media: joi_1.default.object({
        filename: joi_1.default.string()
            .max(255)
            .required()
            .messages({
            'string.max': 'Filename must be no more than 255 characters',
            'any.required': 'Filename is required',
        }),
        originalName: joi_1.default.string()
            .max(255)
            .required()
            .messages({
            'string.max': 'Original name must be no more than 255 characters',
            'any.required': 'Original name is required',
        }),
        mimeType: joi_1.default.string()
            .max(100)
            .required()
            .messages({
            'string.max': 'MIME type must be no more than 100 characters',
            'any.required': 'MIME type is required',
        }),
        size: joi_1.default.number()
            .integer()
            .min(1)
            .max(10485760)
            .required()
            .messages({
            'number.min': 'File size must be at least 1 byte',
            'number.max': 'File size must be no more than 10MB',
            'number.integer': 'File size must be a whole number',
            'any.required': 'File size is required',
        }),
        type: joi_1.default.string()
            .valid('IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION')
            .required()
            .messages({
            'any.only': 'Type must be one of: IMAGE, AUDIO, VIDEO, ANIMATION',
            'any.required': 'Type is required',
        }),
        url: joi_1.default.string()
            .uri()
            .required()
            .messages({
            'string.uri': 'URL must be a valid URI',
            'any.required': 'URL is required',
        }),
        thumbnailUrl: joi_1.default.string()
            .uri()
            .optional()
            .messages({
            'string.uri': 'Thumbnail URL must be a valid URI',
        }),
        altText: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': 'Alt text must be no more than 500 characters',
        }),
        description: joi_1.default.string()
            .max(1000)
            .optional()
            .messages({
            'string.max': 'Description must be no more than 1000 characters',
        }),
        width: joi_1.default.number()
            .integer()
            .min(1)
            .max(10000)
            .optional()
            .messages({
            'number.min': 'Width must be at least 1 pixel',
            'number.max': 'Width must be no more than 10000 pixels',
            'number.integer': 'Width must be a whole number',
        }),
        height: joi_1.default.number()
            .integer()
            .min(1)
            .max(10000)
            .optional()
            .messages({
            'number.min': 'Height must be at least 1 pixel',
            'number.max': 'Height must be no more than 10000 pixels',
            'number.integer': 'Height must be a whole number',
        }),
        duration: joi_1.default.number()
            .integer()
            .min(1)
            .max(3600)
            .optional()
            .messages({
            'number.min': 'Duration must be at least 1 second',
            'number.max': 'Duration must be no more than 3600 seconds',
            'number.integer': 'Duration must be a whole number',
        }),
        characterId: joi_1.default.string()
            .optional(),
        vocabularyWordId: joi_1.default.string()
            .optional(),
        lessonId: joi_1.default.string()
            .optional(),
    }),
    search: joi_1.default.object({
        query: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Search query must be no more than 100 characters',
        }),
        type: joi_1.default.string()
            .valid('HIRAGANA', 'KATAKANA', 'KANJI')
            .optional()
            .messages({
            'any.only': 'Type must be one of: HIRAGANA, KATAKANA, KANJI',
        }),
        jlptLevel: joi_1.default.string()
            .valid('N5', 'N4', 'N3', 'N2', 'N1')
            .optional()
            .messages({
            'any.only': 'JLPT level must be one of: N5, N4, N3, N2, N1',
        }),
        difficultyLevel: joi_1.default.string()
            .valid('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT')
            .optional()
            .messages({
            'any.only': 'Difficulty level must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT',
        }),
        category: joi_1.default.string()
            .valid('FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS', 'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS', 'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER')
            .optional()
            .messages({
            'any.only': 'Category must be one of the valid vocabulary categories',
        }),
        page: joi_1.default.number()
            .integer()
            .min(1)
            .max(1000)
            .optional()
            .messages({
            'number.min': 'Page must be at least 1',
            'number.max': 'Page must be no more than 1000',
            'number.integer': 'Page must be a whole number',
        }),
        limit: joi_1.default.number()
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
    pagination: joi_1.default.object({
        page: joi_1.default.number()
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
        limit: joi_1.default.number()
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
        sortBy: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'Sort by field must be no more than 50 characters',
        }),
        sortOrder: joi_1.default.string()
            .valid('asc', 'desc')
            .default('desc')
            .optional()
            .messages({
            'any.only': 'Sort order must be either asc or desc',
        }),
    }),
    idParam: joi_1.default.object({
        id: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'ID is required',
        }),
    }),
    characterIdParam: joi_1.default.object({
        characterId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Character ID is required',
        }),
    }),
    vocabularyIdParam: joi_1.default.object({
        vocabularyId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Vocabulary ID is required',
        }),
    }),
    lessonIdParam: joi_1.default.object({
        lessonId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Lesson ID is required',
        }),
    }),
    mediaIdParam: joi_1.default.object({
        mediaId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Media ID is required',
        }),
    }),
};
const validateCharacterType = (type) => {
    return ['HIRAGANA', 'KATAKANA', 'KANJI'].includes(type);
};
exports.validateCharacterType = validateCharacterType;
const validateJLPTLevel = (level) => {
    return ['N5', 'N4', 'N3', 'N2', 'N1'].includes(level);
};
exports.validateJLPTLevel = validateJLPTLevel;
const validateDifficultyLevel = (level) => {
    return ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'].includes(level);
};
exports.validateDifficultyLevel = validateDifficultyLevel;
const validateMediaType = (type) => {
    return ['IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION'].includes(type);
};
exports.validateMediaType = validateMediaType;
const validateVocabularyCategory = (category) => {
    const validCategories = [
        'FOOD', 'TRAVEL', 'FAMILY', 'WORK', 'EDUCATION', 'HEALTH', 'SPORTS',
        'ENTERTAINMENT', 'TECHNOLOGY', 'NATURE', 'CLOTHING', 'COLORS', 'NUMBERS',
        'TIME', 'WEATHER', 'EMOTIONS', 'ACTIONS', 'ADJECTIVES', 'VERBS', 'NOUNS', 'OTHER'
    ];
    return validCategories.includes(category);
};
exports.validateVocabularyCategory = validateVocabularyCategory;
const validateLessonType = (type) => {
    const validTypes = [
        'CHARACTER_LEARNING', 'VOCABULARY_LEARNING', 'GRAMMAR_LEARNING',
        'READING_PRACTICE', 'LISTENING_PRACTICE', 'WRITING_PRACTICE'
    ];
    return validTypes.includes(type);
};
exports.validateLessonType = validateLessonType;
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
exports.sanitizeString = sanitizeString;
const sanitizeSearchQuery = (query) => {
    return query.trim().replace(/[<>]/g, '').substring(0, 100);
};
exports.sanitizeSearchQuery = sanitizeSearchQuery;
exports.default = exports.validationSchemas;
exports.validateRequest = exports.validate;
//# sourceMappingURL=validation.js.map