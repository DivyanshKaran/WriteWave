"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationSchemas = exports.securityConfig = exports.contentConfig = exports.isTest = exports.isProduction = exports.isDevelopment = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'DATABASE_URL',
    'REDIS_URL',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
exports.config = {
    port: parseInt(process.env.PORT || '8002', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    database: {
        url: process.env.DATABASE_URL,
    },
    redis: {
        url: process.env.REDIS_URL,
        password: process.env.REDIS_PASSWORD,
    },
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
        uploadPath: process.env.UPLOAD_PATH || './uploads',
        allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp,image/gif').split(','),
        allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES || 'audio/mpeg,audio/wav,audio/ogg,audio/mp4').split(','),
        allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES || 'video/mp4,video/webm,video/ogg').split(','),
    },
    media: {
        baseUrl: process.env.MEDIA_BASE_URL || 'http://localhost:8002/media',
        thumbnailSize: parseInt(process.env.THUMBNAIL_SIZE || '300', 10),
        imageQuality: parseInt(process.env.IMAGE_QUALITY || '85', 10),
    },
    security: {
        rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
        rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    },
    cors: {
        origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
        credentials: process.env.CORS_CREDENTIALS === 'true',
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/content-service.log',
    },
    search: {
        resultsLimit: parseInt(process.env.SEARCH_RESULTS_LIMIT || '50', 10),
        cacheTtl: parseInt(process.env.SEARCH_CACHE_TTL || '3600', 10),
    },
    content: {
        defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
        maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
    },
    cache: {
        ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
        prefix: process.env.CACHE_PREFIX || 'writewave:content:',
    },
    performance: {
        queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30000', 10),
        maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS || '5', 10),
    },
};
exports.isDevelopment = exports.config.nodeEnv === 'development';
exports.isProduction = exports.config.nodeEnv === 'production';
exports.isTest = exports.config.nodeEnv === 'test';
exports.contentConfig = {
    characterCounts: {
        hiragana: parseInt(process.env.HIRAGANA_COUNT || '46', 10),
        katakana: parseInt(process.env.KATAKANA_COUNT || '46', 10),
    },
    jlptLevels: (process.env.KANJI_LEVELS || 'N5,N4,N3,N2,N1').split(','),
    vocabularyCategories: (process.env.VOCABULARY_CATEGORIES || 'food,travel,family,work,education,health,sports,entertainment,technology,nature,clothing,colors,numbers,time,weather,emotions,actions,adjectives,verbs,nouns,other').split(','),
    lessonTypes: (process.env.LESSON_TYPES || 'character_learning,vocabulary_learning,grammar_learning,reading_practice,listening_practice,writing_practice').split(','),
    difficultyLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
    mediaTypes: ['IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION'],
};
exports.securityConfig = {
    fileUpload: {
        maxSize: exports.config.upload.maxFileSize,
        allowedTypes: {
            images: exports.config.upload.allowedImageTypes,
            audio: exports.config.upload.allowedAudioTypes,
            video: exports.config.upload.allowedVideoTypes,
        },
        scanForMalware: exports.isProduction,
    },
    rateLimit: {
        windowMs: exports.config.security.rateLimitWindowMs,
        maxRequests: exports.config.security.rateLimitMaxRequests,
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
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
    character: {
        character: {
            required: true,
            type: 'string',
            maxLength: 10,
        },
        type: {
            required: true,
            type: 'string',
            enum: ['HIRAGANA', 'KATAKANA', 'KANJI'],
        },
        jlptLevel: {
            required: false,
            type: 'string',
            enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
        },
        difficultyLevel: {
            required: false,
            type: 'string',
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        meaning: {
            required: false,
            type: 'string',
            maxLength: 500,
        },
        pronunciation: {
            required: false,
            type: 'string',
            maxLength: 100,
        },
        romanization: {
            required: false,
            type: 'string',
            maxLength: 100,
        },
        strokeCount: {
            required: false,
            type: 'number',
            min: 1,
            max: 50,
        },
    },
    vocabulary: {
        japanese: {
            required: true,
            type: 'string',
            maxLength: 100,
        },
        english: {
            required: true,
            type: 'string',
            maxLength: 500,
        },
        category: {
            required: false,
            type: 'string',
            enum: exports.contentConfig.vocabularyCategories,
        },
        jlptLevel: {
            required: false,
            type: 'string',
            enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
        },
        difficultyLevel: {
            required: false,
            type: 'string',
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        partOfSpeech: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        pronunciation: {
            required: false,
            type: 'string',
            maxLength: 100,
        },
        frequency: {
            required: false,
            type: 'number',
            min: 1,
            max: 10000,
        },
    },
    lesson: {
        title: {
            required: true,
            type: 'string',
            maxLength: 200,
        },
        description: {
            required: false,
            type: 'string',
            maxLength: 1000,
        },
        type: {
            required: true,
            type: 'string',
            enum: exports.contentConfig.lessonTypes,
        },
        jlptLevel: {
            required: false,
            type: 'string',
            enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
        },
        difficultyLevel: {
            required: false,
            type: 'string',
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        estimatedTime: {
            required: false,
            type: 'number',
            min: 1,
            max: 300,
        },
        learningOrder: {
            required: false,
            type: 'number',
            min: 1,
            max: 1000,
        },
    },
    media: {
        filename: {
            required: true,
            type: 'string',
            maxLength: 255,
        },
        originalName: {
            required: true,
            type: 'string',
            maxLength: 255,
        },
        mimeType: {
            required: true,
            type: 'string',
            maxLength: 100,
        },
        size: {
            required: true,
            type: 'number',
            min: 1,
            max: exports.config.upload.maxFileSize,
        },
        type: {
            required: true,
            type: 'string',
            enum: ['IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION'],
        },
        altText: {
            required: false,
            type: 'string',
            maxLength: 500,
        },
        description: {
            required: false,
            type: 'string',
            maxLength: 1000,
        },
    },
    search: {
        query: {
            required: false,
            type: 'string',
            maxLength: 100,
        },
        type: {
            required: false,
            type: 'string',
            enum: ['HIRAGANA', 'KATAKANA', 'KANJI'],
        },
        jlptLevel: {
            required: false,
            type: 'string',
            enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
        },
        difficultyLevel: {
            required: false,
            type: 'string',
            enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
        },
        category: {
            required: false,
            type: 'string',
            enum: exports.contentConfig.vocabularyCategories,
        },
        page: {
            required: false,
            type: 'number',
            min: 1,
            max: 1000,
        },
        limit: {
            required: false,
            type: 'number',
            min: 1,
            max: exports.config.content.maxPageSize,
        },
    },
    pagination: {
        page: {
            required: false,
            type: 'number',
            min: 1,
            max: 1000,
        },
        limit: {
            required: false,
            type: 'number',
            min: 1,
            max: exports.config.content.maxPageSize,
        },
        sortBy: {
            required: false,
            type: 'string',
            maxLength: 50,
        },
        sortOrder: {
            required: false,
            type: 'string',
            enum: ['asc', 'desc'],
        },
    },
};
exports.default = exports.config;
//# sourceMappingURL=index.js.map