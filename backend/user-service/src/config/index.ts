import dotenv from 'dotenv';
import { AppConfig } from '@/types';

// Load environment variables
dotenv.config();

// Validate required environment variables
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

// Application configuration
export const config: AppConfig = {
  port: parseInt(process.env.PORT || '8001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  redis: {
    url: process.env.REDIS_URL!,
    password: process.env.REDIS_PASSWORD,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
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
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      teamId: process.env.APPLE_TEAM_ID || '',
      keyId: process.env.APPLE_KEY_ID || '',
      privateKey: process.env.APPLE_PRIVATE_KEY || '',
      callbackUrl: process.env.APPLE_CALLBACK_URL || 'http://localhost:8001/auth/apple/callback',
    },
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
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
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000', 10), // 24 hours
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
    verifyEmailUrl: process.env.VERIFY_EMAIL_URL || 'http://localhost:3000/verify-email',
    resetPasswordUrl: process.env.RESET_PASSWORD_URL || 'http://localhost:3000/reset-password',
  },
};

// Environment-specific configurations
export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';

// Security configurations
export const securityConfig = {
  // Password requirements
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  
  // Username requirements
  username: {
    minLength: 3,
    maxLength: 30,
    allowedChars: /^[a-zA-Z0-9_-]+$/,
  },
  
  // Email requirements
  email: {
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: config.security.rateLimitWindowMs,
    maxRequests: config.security.rateLimitMaxRequests,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  
  // Session security
  session: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'strict' as const,
    maxAge: config.session.maxAge,
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
  
  // JWT security
  jwt: {
    algorithm: 'HS256' as const,
    issuer: 'writewave',
    audience: 'writewave-users',
  },
  
  // OAuth security
  oauth: {
    stateLength: 32,
    codeVerifierLength: 128,
    codeChallengeMethod: 'S256' as const,
  },
  
  // File upload security
  fileUpload: {
    maxSize: config.upload.maxFileSize,
    allowedTypes: config.upload.allowedImageTypes,
    scanForMalware: isProduction,
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
  // User registration
  userRegistration: {
    email: {
      required: true,
      type: 'string',
      pattern: securityConfig.email.pattern,
      maxLength: securityConfig.email.maxLength,
    },
    password: {
      required: true,
      type: 'string',
      minLength: securityConfig.password.minLength,
      maxLength: securityConfig.password.maxLength,
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
      minLength: securityConfig.username.minLength,
      maxLength: securityConfig.username.maxLength,
      pattern: securityConfig.username.allowedChars,
    },
  },
  
  // User login
  userLogin: {
    email: {
      required: true,
      type: 'string',
      pattern: securityConfig.email.pattern,
    },
    password: {
      required: true,
      type: 'string',
    },
  },
  
  // Password reset
  passwordReset: {
    email: {
      required: true,
      type: 'string',
      pattern: securityConfig.email.pattern,
    },
  },
  
  // Password reset confirm
  passwordResetConfirm: {
    token: {
      required: true,
      type: 'string',
      minLength: 32,
    },
    newPassword: {
      required: true,
      type: 'string',
      minLength: securityConfig.password.minLength,
      maxLength: securityConfig.password.maxLength,
    },
  },
  
  // Email verification
  emailVerification: {
    token: {
      required: true,
      type: 'string',
      minLength: 32,
    },
  },
  
  // Refresh token
  refreshToken: {
    refreshToken: {
      required: true,
      type: 'string',
      minLength: 32,
    },
  },
  
  // User profile update
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
      max: 1440, // 24 hours in minutes
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
  
  // User settings update
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

// Export configuration
export default config;
