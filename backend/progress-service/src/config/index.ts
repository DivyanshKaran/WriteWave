import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables', { missing: missingEnvVars });
  process.exit(1);
}

// Configuration object
export const config = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8003', 10),
  SERVICE_NAME: process.env.SERVICE_NAME || 'progress-service',
  SERVICE_VERSION: process.env.SERVICE_VERSION || '1.0.0',

  // Database
  DATABASE_URL: process.env.DATABASE_URL!,

  // Redis
  REDIS_URL: process.env.REDIS_URL!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),

  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!,
  ACCESS_TOKEN_EXPIRATION: process.env.ACCESS_TOKEN_EXPIRATION || '15m',
  REFRESH_TOKEN_EXPIRATION: process.env.REFRESH_TOKEN_EXPIRATION || '7d',

  // XP and Leveling
  XP_BASE_MULTIPLIER: parseFloat(process.env.XP_BASE_MULTIPLIER || '1.0'),
  XP_STREAK_MULTIPLIER: parseFloat(process.env.XP_STREAK_MULTIPLIER || '1.5'),
  XP_ACHIEVEMENT_MULTIPLIER: parseFloat(process.env.XP_ACHIEVEMENT_MULTIPLIER || '2.0'),
  LEVEL_UP_XP_BASE: parseInt(process.env.LEVEL_UP_XP_BASE || '100', 10),
  LEVEL_UP_XP_MULTIPLIER: parseFloat(process.env.LEVEL_UP_XP_MULTIPLIER || '1.2'),

  // Achievement
  ACHIEVEMENT_CHECK_INTERVAL: parseInt(process.env.ACHIEVEMENT_CHECK_INTERVAL || '300000', 10),
  ACHIEVEMENT_NOTIFICATION_ENABLED: process.env.ACHIEVEMENT_NOTIFICATION_ENABLED === 'true',

  // Streak
  STREAK_FREEZE_LIMIT: parseInt(process.env.STREAK_FREEZE_LIMIT || '3', 10),
  STREAK_MILESTONE_REWARDS: process.env.STREAK_MILESTONE_REWARDS === 'true',
  STREAK_RESET_HOUR: parseInt(process.env.STREAK_RESET_HOUR || '0', 10),

  // Analytics
  ANALYTICS_BATCH_SIZE: parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000', 10),
  ANALYTICS_PROCESSING_INTERVAL: parseInt(process.env.ANALYTICS_PROCESSING_INTERVAL || '3600000', 10),
  ANALYTICS_RETENTION_DAYS: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365', 10),

  // Leaderboard
  LEADERBOARD_UPDATE_INTERVAL: parseInt(process.env.LEADERBOARD_UPDATE_INTERVAL || '300000', 10),
  LEADERBOARD_CACHE_TTL: parseInt(process.env.LEADERBOARD_CACHE_TTL || '300', 10),
  LEADERBOARD_TOP_COUNT: parseInt(process.env.LEADERBOARD_TOP_COUNT || '100', 10),

  // Performance
  CACHE_TTL: parseInt(process.env.CACHE_TTL || '3600', 10),
  CACHE_MAX_SIZE: parseInt(process.env.CACHE_MAX_SIZE || '10000', 10),
  BATCH_SIZE: parseInt(process.env.BATCH_SIZE || '100', 10),
  CONCURRENT_LIMIT: parseInt(process.env.CONCURRENT_LIMIT || '10', 10),

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FORMAT: process.env.LOG_FORMAT || 'json',
  LOG_FILE: process.env.LOG_FILE || 'logs/progress-service.log',

  // Monitoring
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30000', 10),
  METRICS_ENABLED: process.env.METRICS_ENABLED === 'true',
  METRICS_PORT: parseInt(process.env.METRICS_PORT || '9090', 10),

  // External Services
  USER_SERVICE_URL: process.env.USER_SERVICE_URL || 'http://localhost:8001',
  CONTENT_SERVICE_URL: process.env.CONTENT_SERVICE_URL || 'http://localhost:8002',
  NOTIFICATION_SERVICE_URL: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8005',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  CORS_CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',

  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-here',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_PATH: process.env.UPLOAD_PATH || 'uploads/',

  // WebSocket
  WEBSOCKET_ENABLED: process.env.WEBSOCKET_ENABLED === 'true',
  WEBSOCKET_PORT: parseInt(process.env.WEBSOCKET_PORT || '8004', 10),

  // Background Jobs
  CRON_ENABLED: process.env.CRON_ENABLED === 'true',
  CRON_TIMEZONE: process.env.CRON_TIMEZONE || 'UTC',

  // Development
  DEBUG: process.env.DEBUG === 'true',
  VERBOSE_LOGGING: process.env.VERBOSE_LOGGING === 'true',
  HOT_RELOAD: process.env.HOT_RELOAD === 'true',
};

// Validate configuration
export const validateConfig = (): void => {
  const errors: string[] = [];

  // Validate numeric values
  if (config.PORT < 1 || config.PORT > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  if (config.XP_BASE_MULTIPLIER < 0) {
    errors.push('XP_BASE_MULTIPLIER must be positive');
  }

  if (config.LEVEL_UP_XP_BASE < 1) {
    errors.push('LEVEL_UP_XP_BASE must be at least 1');
  }

  if (config.STREAK_FREEZE_LIMIT < 0) {
    errors.push('STREAK_FREEZE_LIMIT must be non-negative');
  }

  if (config.ANALYTICS_RETENTION_DAYS < 1) {
    errors.push('ANALYTICS_RETENTION_DAYS must be at least 1');
  }

  if (config.BCRYPT_ROUNDS < 10 || config.BCRYPT_ROUNDS > 15) {
    errors.push('BCRYPT_ROUNDS must be between 10 and 15');
  }

  if (errors.length > 0) {
    logger.error('Configuration validation failed', { errors });
    process.exit(1);
  }
};

// Export default
export default config;
