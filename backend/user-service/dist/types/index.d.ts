import { Request } from 'express';
import { User, UserProfile, UserSettings } from '@prisma/client';
export interface AuthenticatedRequest extends Request {
    user?: User & {
        profile?: UserProfile;
        settings?: UserSettings;
    };
}
export interface JWTPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}
export interface UserRegistrationData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    username?: string;
}
export interface UserLoginData {
    email: string;
    password: string;
}
export interface OAuthUserData {
    email: string;
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
    provider: 'google' | 'apple';
    providerId: string;
}
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
export interface PasswordResetData {
    email: string;
}
export interface PasswordResetConfirmData {
    token: string;
    newPassword: string;
}
export interface EmailVerificationData {
    token: string;
}
export interface RefreshTokenData {
    refreshToken: string;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    timestamp: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
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
export interface ErrorResponse {
    success: false;
    message: string;
    error: string;
    timestamp: string;
    path?: string;
    statusCode?: number;
}
export interface DeviceInfo {
    deviceType: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    userAgent: string;
}
export interface SessionData {
    userId: string;
    deviceInfo?: DeviceInfo;
    ipAddress?: string;
    userAgent?: string;
}
export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}
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
export interface ImageProcessingOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}
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
export interface ValidationError {
    field: string;
    message: string;
    value?: any;
}
export interface ServiceResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface CacheKey {
    prefix: string;
    identifier: string;
    ttl?: number;
}
export interface LogEntry {
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    timestamp: string;
    userId?: string;
    requestId?: string;
    metadata?: Record<string, any>;
}
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
//# sourceMappingURL=index.d.ts.map