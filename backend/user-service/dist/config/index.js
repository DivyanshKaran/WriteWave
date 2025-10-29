"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.securityConfig = exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("./logger");
dotenv_1.default.config();
const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'REDIS_URL',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
exports.config = {
    port: parseInt(process.env.PORT || '8001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    email: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
        from: process.env.FROM_EMAIL || 'noreply@writewave.app',
        fromName: process.env.FROM_NAME || 'WriteWave',
    },
    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8001/auth/google/callback',
        },
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10),
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
    },
    security: {
        bcryptRounds: (() => {
            const parsed = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
            if (Number.isNaN(parsed) || parsed < 10 || parsed > 14) {
                logger_1.logger.warn('BCRYPT_ROUNDS out of range [10..14], defaulting to 12', { value: process.env.BCRYPT_ROUNDS });
                return 12;
            }
            return parsed;
        })(),
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/user-service.log',
    },
    session: {
        secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
        maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10),
    },
    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        verifyEmailUrl: process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email',
        resetPasswordUrl: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
    },
};
exports.isDevelopment = exports.config.nodeEnv === 'development';
exports.isProduction = exports.config.nodeEnv === 'production';
exports.isTest = exports.config.nodeEnv === 'test';
exports.securityConfig = {
    password: {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
    },
    username: {
        minLength: 3,
        maxLength: 30,
        allowedChars: /^[a-zA-Z0-9_-]+$/,
    },
    email: {
        maxLength: 254,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    rateLimit: {
        windowMs: exports.config.security.rateLimitWindowMs,
        maxRequests: exports.config.security.rateLimitMaxRequests,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
    },
    session: {
        secure: exports.isProduction,
        httpOnly: true,
        sameSite: 'strict',
        maxAge: exports.config.session.maxAge,
    },
    cors: {
        origin: exports.config.cors.origin,
        credentials: exports.config.cors.credentials,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key',
        ],
    },
    jwt: {
        algorithm: 'HS256',
        issuer: 'writewave',
        audience: 'writewave-users',
    },
    oauth: {
        stateLength: 32,
        codeVerifierLength: 128,
        codeChallengeMethod: 'S256',
    },
    fileUpload: {
        maxSize: exports.config.upload.maxFileSize,
        allowedTypes: exports.config.upload.allowedImageTypes,
        scanForMalware: exports.isProduction,
    },
    database: {
        connectionLimit: 10,
        acquireTimeoutMillis: 30000,
        timeout: 20000,
        ssl: exports.isProduction,
    },
    redis: {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
    },
};
exports.validationSchemas = {
    userRegistration: {
        email: {
            required: true,
            type: 'string',
            pattern: exports.securityConfig.email.pattern,
            maxLength: exports.securityConfig.email.maxLength,
        },
        password: {
            required: true,
            type: 'string',
            minLength: exports.securityConfig.password.minLength,
            maxLength: exports.securityConfig.password.maxLength,
        },
        firstName: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        lastName: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        username: {
            required: false,
            type: 'string',
            minLength: exports.securityConfig.username.minLength,
            maxLength: exports.securityConfig.username.maxLength,
            pattern: exports.securityConfig.username.allowedChars,
        },
    },
    userLogin: {
        email: {
            required: true,
            type: 'string',
            pattern: exports.securityConfig.email.pattern,
        },
        password: {
            required: true,
            type: 'string',
        },
    },
    passwordReset: {
        email: {
            required: true,
            type: 'string',
            pattern: exports.securityConfig.email.pattern,
        },
    },
    passwordResetConfirm: {
        token: {
            required: true,
            type: 'string',
            minLength: 32,
        },
        newPassword: {
            required: true,
            type: 'string',
            minLength: exports.securityConfig.password.minLength,
            maxLength: exports.securityConfig.password.maxLength,
        },
    },
    emailVerification: {
        token: {
            required: true,
            type: 'string',
            minLength: 32,
        },
    },
    refreshToken: {
        refreshToken: {
            required: true,
            type: 'string',
            minLength: 32,
        },
    },
    userProfileUpdate: {
        firstName: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        lastName: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        bio: {
            required: false,
            type: 'string',
            maxLength: 500,
        },
        dateOfBirth: {
            required: false,
            type: 'date',
        },
        country: {
            required: false,
            type: 'string',
            maxLength: 100,
        },
        timezone: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        language: {
            required: false,
            type: 'string',
            maxLength: 10,
        },
        learningGoals: {
            required: false,
            type: 'array',
            items: {
                type: 'string',
                maxLength: 100,
            },
        },
        difficultyLevel: {
            required: false,
            type: 'string',
            enum: ['beginner', 'intermediate', 'advanced'],
        },
        studyTime: {
            required: false,
            type: 'number',
            min: 0,
            max: 1440,
        },
        interests: {
            required: false,
            type: 'array',
            items: {
                type: 'string',
                maxLength: 50,
            },
        },
    },
    userSettingsUpdate: {
        emailNotifications: {
            required: false,
            type: 'boolean',
        },
        pushNotifications: {
            required: false,
            type: 'boolean',
        },
        dailyReminders: {
            required: false,
            type: 'boolean',
        },
        weeklyReports: {
            required: false,
            type: 'boolean',
        },
        achievementAlerts: {
            required: false,
            type: 'boolean',
        },
        profileVisibility: {
            required: false,
            type: 'string',
            enum: ['public', 'friends', 'private'],
        },
        showProgress: {
            required: false,
            type: 'boolean',
        },
        showAchievements: {
            required: false,
            type: 'boolean',
        },
        autoAdvance: {
            required: false,
            type: 'boolean',
        },
        showHints: {
            required: false,
            type: 'boolean',
        },
        soundEnabled: {
            required: false,
            type: 'boolean',
        },
        vibrationEnabled: {
            required: false,
            type: 'boolean',
        },
        theme: {
            required: false,
            type: 'string',
            enum: ['light', 'dark', 'auto'],
        },
        fontSize: {
            required: false,
            type: 'string',
            enum: ['small', 'medium', 'large'],
        },
        animations: {
            required: false,
            type: 'boolean',
        },
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map