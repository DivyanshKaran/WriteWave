import { Request } from 'express';
import { User, UserProfile, UserSettings, Session } from '@prisma/client';

// Extended Request interface with user data
export interface AuthenticatedRequest extends Request {
  user?: User & {
    profile?: UserProfile;
    settings?: UserSettings;
  };
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Refresh Token Payload interface
export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
}

// User Registration interface
export interface UserRegistrationData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

// User Login interface
export interface UserLoginData {
  email: string;
  password: string;
}

// OAuth User Data interface
export interface OAuthUserData {
  email: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  provider: 'google' | 'apple';
  providerId: string;
}

// User Profile Update interface
export interface UserProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: Date;
  country?: string;
  timezone?: string;
  language?: string;
  learningGoals?: string[];
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  studyTime?: number;
  interests?: string[];
}

// User Settings Update interface
export interface UserSettingsUpdateData {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  dailyReminders?: boolean;
  weeklyReports?: boolean;
  achievementAlerts?: boolean;
  profileVisibility?: 'public' | 'friends' | 'private';
  showProgress?: boolean;
  showAchievements?: boolean;
  autoAdvance?: boolean;
  showHints?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  fontSize?: 'small' | 'medium' | 'large';
  animations?: boolean;
}

// Password Reset interface
export interface PasswordResetData {
  email: string;
}

// Password Reset Confirm interface
export interface PasswordResetConfirmData {
  token: string;
  newPassword: string;
}

// Email Verification interface
export interface EmailVerificationData {
  token: string;
}

// Refresh Token interface
export interface RefreshTokenData {
  refreshToken: string;
}

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

// Pagination interface
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated Response interface
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error Response interface
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

// Device Info interface
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  userAgent: string;
}

// Session Data interface
export interface SessionData {
  userId: string;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
  userAgent?: string;
}

// Email Template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// File Upload interface
export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// Image Processing Options interface
export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

// Rate Limit interface
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Health Check interface
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  database: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  redis: {
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

// Validation Error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Service Response interface
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Cache Key interface
export interface CacheKey {
  prefix: string;
  identifier: string;
  ttl?: number;
}

// Log Entry interface
export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

// Configuration interface
export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiVersion: string;
  database: {
    url: string;
  };
  redis: {
    url: string;
    password?: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    fromName: string;
  };
  oauth: {
    google: {
      clientId: string;
      clientSecret: string;
      callbackUrl: string;
    };
    apple: {
      clientId: string;
      teamId: string;
      keyId: string;
      privateKey: string;
      callbackUrl: string;
    };
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
    allowedImageTypes: string[];
  };
  security: {
    bcryptRounds: number;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  logging: {
    level: string;
    file: string;
  };
  session: {
    secret: string;
    maxAge: number;
  };
  frontend: {
    url: string;
    verifyEmailUrl: string;
    resetPasswordUrl: string;
  };
}
