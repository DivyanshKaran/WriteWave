"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUsername = exports.sanitizeEmail = exports.sanitizeString = exports.validateUsername = exports.validatePassword = exports.validateEmail = exports.validationSchemas = exports.validateParams = exports.validateQuery = exports.validate = exports.ValidationError = void 0;
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
    userRegistration: joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .max(254)
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'string.max': 'Email must be no more than 254 characters',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string()
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
        firstName: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'First name must be no more than 50 characters',
        }),
        lastName: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'Last name must be no more than 50 characters',
        }),
        username: joi_1.default.string()
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
    userLogin: joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
        password: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Password is required',
        }),
    }),
    passwordResetRequest: joi_1.default.object({
        email: joi_1.default.string()
            .email()
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required',
        }),
    }),
    passwordResetConfirm: joi_1.default.object({
        token: joi_1.default.string()
            .min(32)
            .required()
            .messages({
            'string.min': 'Invalid reset token',
            'any.required': 'Reset token is required',
        }),
        newPassword: joi_1.default.string()
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
    emailVerification: joi_1.default.object({
        token: joi_1.default.string()
            .min(32)
            .required()
            .messages({
            'string.min': 'Invalid verification token',
            'any.required': 'Verification token is required',
        }),
    }),
    refreshToken: joi_1.default.object({
        refreshToken: joi_1.default.string()
            .min(32)
            .required()
            .messages({
            'string.min': 'Invalid refresh token',
            'any.required': 'Refresh token is required',
        }),
    }),
    userProfileUpdate: joi_1.default.object({
        firstName: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'First name must be no more than 50 characters',
        }),
        lastName: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'Last name must be no more than 50 characters',
        }),
        bio: joi_1.default.string()
            .max(500)
            .optional()
            .messages({
            'string.max': 'Bio must be no more than 500 characters',
        }),
        dateOfBirth: joi_1.default.date()
            .max('now')
            .optional()
            .messages({
            'date.max': 'Date of birth cannot be in the future',
        }),
        country: joi_1.default.string()
            .max(100)
            .optional()
            .messages({
            'string.max': 'Country must be no more than 100 characters',
        }),
        timezone: joi_1.default.string()
            .max(50)
            .optional()
            .messages({
            'string.max': 'Timezone must be no more than 50 characters',
        }),
        language: joi_1.default.string()
            .max(10)
            .optional()
            .messages({
            'string.max': 'Language code must be no more than 10 characters',
        }),
        learningGoals: joi_1.default.array()
            .items(joi_1.default.string().max(100))
            .max(10)
            .optional()
            .messages({
            'array.max': 'You can have at most 10 learning goals',
            'string.max': 'Each learning goal must be no more than 100 characters',
        }),
        difficultyLevel: joi_1.default.string()
            .valid('beginner', 'intermediate', 'advanced')
            .optional()
            .messages({
            'any.only': 'Difficulty level must be one of: beginner, intermediate, advanced',
        }),
        studyTime: joi_1.default.number()
            .integer()
            .min(0)
            .max(1440)
            .optional()
            .messages({
            'number.min': 'Study time cannot be negative',
            'number.max': 'Study time cannot exceed 1440 minutes (24 hours)',
            'number.integer': 'Study time must be a whole number',
        }),
        interests: joi_1.default.array()
            .items(joi_1.default.string().max(50))
            .max(20)
            .optional()
            .messages({
            'array.max': 'You can have at most 20 interests',
            'string.max': 'Each interest must be no more than 50 characters',
        }),
    }),
    userSettingsUpdate: joi_1.default.object({
        emailNotifications: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Email notifications must be a boolean value',
        }),
        pushNotifications: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Push notifications must be a boolean value',
        }),
        dailyReminders: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Daily reminders must be a boolean value',
        }),
        weeklyReports: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Weekly reports must be a boolean value',
        }),
        achievementAlerts: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Achievement alerts must be a boolean value',
        }),
        profileVisibility: joi_1.default.string()
            .valid('public', 'friends', 'private')
            .optional()
            .messages({
            'any.only': 'Profile visibility must be one of: public, friends, private',
        }),
        showProgress: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Show progress must be a boolean value',
        }),
        showAchievements: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Show achievements must be a boolean value',
        }),
        autoAdvance: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Auto advance must be a boolean value',
        }),
        showHints: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Show hints must be a boolean value',
        }),
        soundEnabled: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Sound enabled must be a boolean value',
        }),
        vibrationEnabled: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Vibration enabled must be a boolean value',
        }),
        theme: joi_1.default.string()
            .valid('light', 'dark', 'auto')
            .optional()
            .messages({
            'any.only': 'Theme must be one of: light, dark, auto',
        }),
        fontSize: joi_1.default.string()
            .valid('small', 'medium', 'large')
            .optional()
            .messages({
            'any.only': 'Font size must be one of: small, medium, large',
        }),
        animations: joi_1.default.boolean()
            .optional()
            .messages({
            'boolean.base': 'Animations must be a boolean value',
        }),
    }),
    paginationQuery: joi_1.default.object({
        page: joi_1.default.number()
            .integer()
            .min(1)
            .default(1)
            .optional()
            .messages({
            'number.min': 'Page must be at least 1',
            'number.integer': 'Page must be a whole number',
        }),
        limit: joi_1.default.number()
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
        sortBy: joi_1.default.string()
            .optional()
            .messages({
            'string.base': 'Sort by must be a string',
        }),
        sortOrder: joi_1.default.string()
            .valid('asc', 'desc')
            .default('desc')
            .optional()
            .messages({
            'any.only': 'Sort order must be either asc or desc',
        }),
    }),
    userIdParam: joi_1.default.object({
        userId: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'User ID is required',
        }),
    }),
    searchQuery: joi_1.default.object({
        q: joi_1.default.string()
            .min(1)
            .max(100)
            .required()
            .messages({
            'string.min': 'Search query must be at least 1 character',
            'string.max': 'Search query must be no more than 100 characters',
            'any.required': 'Search query is required',
        }),
        page: joi_1.default.number()
            .integer()
            .min(1)
            .default(1)
            .optional(),
        limit: joi_1.default.number()
            .integer()
            .min(1)
            .max(100)
            .default(10)
            .optional(),
    }),
};
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePassword = (password) => {
    const errors = [];
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
exports.validatePassword = validatePassword;
const validateUsername = (username) => {
    const errors = [];
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
exports.validateUsername = validateUsername;
const sanitizeString = (str) => {
    return str.trim().replace(/[<>]/g, '');
};
exports.sanitizeString = sanitizeString;
const sanitizeEmail = (email) => {
    return email.toLowerCase().trim();
};
exports.sanitizeEmail = sanitizeEmail;
const sanitizeUsername = (username) => {
    return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '');
};
exports.sanitizeUsername = sanitizeUsername;
exports.default = exports.validationSchemas;
//# sourceMappingURL=validation.js.map