import dotenv from 'dotenv';
import { AppConfig } from '../types';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Application configuration
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '8002', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD,
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
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
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
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
    cacheTtl: parseInt(process.env.SEARCH_CACHE_TTL || '3600', 10), // 1 hour
  },
  
  content: {
    defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '20', 10),
    maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    prefix: process.env.CACHE_PREFIX || 'writewave:content:',
  },
  
  performance: {
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30000', 10), // 30 seconds
    maxConcurrentUploads: parseInt(process.env.MAX_CONCURRENT_UPLOADS || '5', 10),
  },
};

// Environment-specific configurations
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

// Content-specific configurations
export const contentConfig = {
  // Character counts
  characterCounts: {
    hiragana: parseInt(process.env.HIRAGANA_COUNT || '46', 10),
    katakana: parseInt(process.env.KATAKANA_COUNT || '46', 10),
  },
  
  // JLPT levels
  jlptLevels: (process.env.KANJI_LEVELS || 'N5,N4,N3,N2,N1').split(','),
  
  // Vocabulary categories
  vocabularyCategories: (process.env.VOCABULARY_CATEGORIES || 'food,travel,family,work,education,health,sports,entertainment,technology,nature,clothing,colors,numbers,time,weather,emotions,actions,adjectives,verbs,nouns,other').split(','),
  
  // Lesson types
  lessonTypes: (process.env.LESSON_TYPES || 'character_learning,vocabulary_learning,grammar_learning,reading_practice,listening_practice,writing_practice').split(','),
  
  // Difficulty levels
  difficultyLevels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT'],
  
  // Media types
  mediaTypes: ['IMAGE', 'AUDIO', 'VIDEO', 'ANIMATION'],
};

// Security configurations
export const securityConfig = {
  // File upload security
  fileUpload: {
    maxSize: config.upload.maxFileSize,
    allowedTypes: {
      images: config.upload.allowedImageTypes,
      audio: config.upload.allowedAudioTypes,
      video: config.upload.allowedVideoTypes,
    },
    scanForMalware: isProduction,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: config.security.rateLimitWindowMs,
    maxRequests: config.security.rateLimitMaxRequests,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // CORS security
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
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
  
  // Database security
  database: {
    connectionLimit: 10,
    acquireTimeoutMillis: 30000,
    timeout: 20000,
    ssl: isProduction,
  },
  
  // Redis security
  redis: {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
  },
};

// Validation schemas
export const validationSchemas = {
  // Character validation
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
  
  // Vocabulary validation
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
      enum: contentConfig.vocabularyCategories,
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
  
  // Lesson validation
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
      enum: contentConfig.lessonTypes,
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
  
  // Media validation
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
      max: config.upload.maxFileSize,
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
  
  // Search validation
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
      enum: contentConfig.vocabularyCategories,
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
      max: config.content.maxPageSize,
    },
  },
  
  // Pagination validation
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
      max: config.content.maxPageSize,
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

// Export configuration
export default config;
