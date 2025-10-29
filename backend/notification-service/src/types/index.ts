// Core Types and Interfaces for Notification Service

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  data?: any;
  templateId?: string;
  scheduledAt?: Date;
  sentAt?: Date;
  status: NotificationStatus;
  priority: NotificationPriority;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  data?: any;
  templateId?: string;
  scheduledAt?: Date;
  priority?: NotificationPriority;
  metadata?: any;
}

export interface UpdateNotificationRequest {
  status?: NotificationStatus;
  errorMessage?: string;
  sentAt?: Date;
}

export enum NotificationType {
  LEARNING_REMINDER = 'LEARNING_REMINDER',
  STREAK_WARNING = 'STREAK_WARNING',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  COMMENT_ADDED = 'COMMENT_ADDED',
  POST_LIKED = 'POST_LIKED',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  MAINTENANCE_NOTICE = 'MAINTENANCE_NOTICE',
  MARKETING_CAMPAIGN = 'MARKETING_CAMPAIGN',
  FEATURE_ANNOUNCEMENT = 'FEATURE_ANNOUNCEMENT',
  WEEKLY_SUMMARY = 'WEEKLY_SUMMARY',
  MONTHLY_ROUNDUP = 'MONTHLY_ROUNDUP',
  PASSWORD_RESET = 'PASSWORD_RESET',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  SECURITY_ALERT = 'SECURITY_ALERT'
}

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS',
  IN_APP = 'IN_APP'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

// Template Types
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  language: string;
  subject?: string;
  title: string;
  content: string;
  htmlContent?: string;
  variables: string[];
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateTemplateRequest {
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  language: string;
  subject?: string;
  title: string;
  content: string;
  htmlContent?: string;
  variables: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  title?: string;
  content?: string;
  htmlContent?: string;
  variables?: string[];
  isActive?: boolean;
}

// User Preferences Types
export interface NotificationPreferences {
  id: string;
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
  learningReminders: boolean;
  streakWarnings: boolean;
  achievements: boolean;
  socialNotifications: boolean;
  systemUpdates: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
  monthlyRoundup: boolean;
  preferredTime: string; // HH:MM format
  timezone: string;
  language: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdatePreferencesRequest {
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  inAppEnabled?: boolean;
  learningReminders?: boolean;
  streakWarnings?: boolean;
  achievements?: boolean;
  socialNotifications?: boolean;
  systemUpdates?: boolean;
  marketingEmails?: boolean;
  weeklyDigest?: boolean;
  monthlyRoundup?: boolean;
  preferredTime?: string;
  timezone?: string;
  language?: string;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

// Subscription Types
export interface PushSubscription {
  id: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionRequest {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}

// Delivery Tracking Types
export interface DeliveryTracking {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  providerId?: string;
  providerResponse?: any;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  errorMessage?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED'
}

// Scheduling Types
export interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  data?: any;
  scheduledAt: Date;
  timezone: string;
  isRecurring: boolean;
  recurrencePattern?: RecurrencePattern;
  status: ScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateScheduledNotificationRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  data?: any;
  scheduledAt: Date;
  timezone: string;
  isRecurring?: boolean;
  recurrencePattern?: RecurrencePattern;
}

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number;
  daysOfWeek?: number[];
  daysOfMonth?: number[];
  endDate?: Date;
}

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  PROCESSING = 'PROCESSING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

// Analytics Types
export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  failureRate: number;
  averageDeliveryTime: number;
  topChannels: ChannelStats[];
  topTypes: TypeStats[];
  timeSeriesData: TimeSeriesData[];
}

export interface ChannelStats {
  channel: NotificationChannel;
  count: number;
  percentage: number;
}

export interface TypeStats {
  type: NotificationType;
  count: number;
  percentage: number;
}

export interface TimeSeriesData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
}

// Queue Types
export interface QueueJob {
  id: string;
  name: string;
  data: any;
  opts: any;
  progress: number;
  delay: number;
  timestamp: number;
  attemptsMade: number;
  failedReason?: string;
  stacktrace?: string[];
  returnvalue?: any;
  processedOn?: number;
  finishedOn?: number;
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
}

// Email Types
export interface EmailData {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  variables?: any;
  attachments?: EmailAttachment[];
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  disposition?: string;
}

// Push Notification Types
export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: PushAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  renotify?: boolean;
  timestamp?: number;
  vibrate?: number[];
  url?: string;
}

export interface PushAction {
  action: string;
  title: string;
  icon?: string;
}

// SMS Types
export interface SMSData {
  to: string;
  message: string;
  from?: string;
  mediaUrl?: string[];
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  phoneNumber?: string;
  timezone: string;
  language: string;
  isActive: boolean;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Error Types
export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// JWT Types
export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}

// Configuration Types
export interface NotificationConfig {
  maxRetries: number;
  retryDelay: number;
  batchSize: number;
  concurrency: number;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  channels: {
    email: {
      enabled: boolean;
      provider: string;
      rateLimit: number;
    };
    push: {
      enabled: boolean;
      rateLimit: number;
    };
    sms: {
      enabled: boolean;
      provider: string;
      rateLimit: number;
    };
    inApp: {
      enabled: boolean;
      rateLimit: number;
    };
  };
}

// Webhook Types
export interface WebhookPayload {
  event: string;
  timestamp: Date;
  data: any;
  signature?: string;
}

// A/B Testing Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  templateId: string;
  variantTemplateId: string;
  trafficSplit: number; // 0-100 percentage
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  metrics: ABTestMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestMetrics {
  variantASent: number;
  variantBSent: number;
  variantADelivered: number;
  variantBDelivered: number;
  variantAOpened: number;
  variantBOpened: number;
  variantAClicked: number;
  variantBClicked: number;
  variantAConversion: number;
  variantBConversion: number;
}
