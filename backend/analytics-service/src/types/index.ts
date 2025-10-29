// Core Types and Interfaces for Analytics Service

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

// Event Tracking Types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId?: string;
  eventType: EventType;
  eventName: string;
  properties: Record<string, any>;
  timestamp: Date;
  source: EventSource;
  version: string;
  platform: Platform;
  userAgent?: string;
  ipAddress?: string;
  location?: GeoLocation;
  metadata?: Record<string, any>;
}

export interface CreateEventRequest {
  userId?: string;
  sessionId?: string;
  eventType: EventType;
  eventName: string;
  properties: Record<string, any>;
  timestamp?: Date;
  source?: EventSource;
  version?: string;
  platform?: Platform;
  userAgent?: string;
  ipAddress?: string;
  location?: GeoLocation;
  metadata?: Record<string, any>;
}

export enum EventType {
  USER_INTERACTION = 'USER_INTERACTION',
  LEARNING_EVENT = 'LEARNING_EVENT',
  PERFORMANCE_EVENT = 'PERFORMANCE_EVENT',
  BUSINESS_EVENT = 'BUSINESS_EVENT',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  ERROR_EVENT = 'ERROR_EVENT'
}

export enum EventSource {
  WEB_APP = 'WEB_APP',
  MOBILE_APP = 'MOBILE_APP',
  API = 'API',
  BACKGROUND_JOB = 'BACKGROUND_JOB',
  SYSTEM = 'SYSTEM'
}

export enum Platform {
  WEB = 'WEB',
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  DESKTOP = 'DESKTOP',
  SERVER = 'SERVER'
}

export interface GeoLocation {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

// Learning Analytics Types
export interface LearningMetrics {
  userId: string;
  characterId?: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  charactersPracticed: number;
  charactersCorrect: number;
  charactersIncorrect: number;
  accuracy: number;
  xpGained: number;
  streakUpdated: boolean;
  difficulty: DifficultyLevel;
  method: LearningMethod;
  device: string;
  platform: Platform;
}

export enum DifficultyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum LearningMethod {
  FLASHCARDS = 'FLASHCARDS',
  WRITING_PRACTICE = 'WRITING_PRACTICE',
  PRONUNCIATION = 'PRONUNCIATION',
  RECOGNITION = 'RECOGNITION',
  GAMES = 'GAMES',
  QUIZZES = 'QUIZZES'
}

// Performance Monitoring Types
export interface PerformanceMetric {
  id: string;
  service: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  errorMessage?: string;
  requestSize?: number;
  responseSize?: number;
  databaseQueries?: number;
  databaseTime?: number;
  cacheHits?: number;
  cacheMisses?: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface SystemMetric {
  id: string;
  service: string;
  metricType: SystemMetricType;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export enum SystemMetricType {
  CPU_USAGE = 'CPU_USAGE',
  MEMORY_USAGE = 'MEMORY_USAGE',
  DISK_USAGE = 'DISK_USAGE',
  NETWORK_TRAFFIC = 'NETWORK_TRAFFIC',
  ACTIVE_CONNECTIONS = 'ACTIVE_CONNECTIONS',
  QUEUE_SIZE = 'QUEUE_SIZE',
  ERROR_RATE = 'ERROR_RATE',
  THROUGHPUT = 'THROUGHPUT'
}

// A/B Testing Types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: ABTestStatus;
  startDate: Date;
  endDate?: Date;
  trafficSplit: number; // 0-100 percentage
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  targetAudience?: TargetAudience;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  isControl: boolean;
  trafficPercentage: number;
}

export interface ABTestMetric {
  name: string;
  type: ABTestMetricType;
  goal: ABTestGoal;
  weight: number;
}

export enum ABTestMetricType {
  CONVERSION = 'CONVERSION',
  ENGAGEMENT = 'ENGAGEMENT',
  RETENTION = 'RETENTION',
  REVENUE = 'REVENUE',
  PERFORMANCE = 'PERFORMANCE'
}

export enum ABTestGoal {
  MAXIMIZE = 'MAXIMIZE',
  MINIMIZE = 'MINIMIZE'
}

export enum ABTestStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface TargetAudience {
  userSegments?: string[];
  countries?: string[];
  platforms?: Platform[];
  userTypes?: string[];
  customFilters?: Record<string, any>;
}

export interface ABTestResult {
  id?: string;
  testId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
  converted: boolean;
  conversionValue?: number;
  events: ABTestEvent[];
}

export interface ABTestEvent {
  eventName: string;
  timestamp: Date;
  properties: Record<string, any>;
}

// Dashboard and Visualization Types
export interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: DashboardType;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number;
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum DashboardType {
  REAL_TIME = 'REAL_TIME',
  BUSINESS = 'BUSINESS',
  TECHNICAL = 'TECHNICAL',
  LEARNING = 'LEARNING',
  CUSTOM = 'CUSTOM'
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  query: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

export enum WidgetType {
  LINE_CHART = 'LINE_CHART',
  BAR_CHART = 'BAR_CHART',
  PIE_CHART = 'PIE_CHART',
  METRIC_CARD = 'METRIC_CARD',
  TABLE = 'TABLE',
  HEATMAP = 'HEATMAP',
  FUNNEL = 'FUNNEL',
  COHORT = 'COHORT'
}

export interface WidgetConfig {
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  filters?: Record<string, any>;
  aggregation?: AggregationType;
  timeRange?: TimeRange;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
}

export enum AggregationType {
  COUNT = 'COUNT',
  SUM = 'SUM',
  AVG = 'AVG',
  MIN = 'MIN',
  MAX = 'MAX',
  MEDIAN = 'MEDIAN',
  PERCENTILE = 'PERCENTILE'
}

export interface TimeRange {
  start: Date;
  end: Date;
  granularity: TimeGranularity;
}

export enum TimeGranularity {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR'
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardFilter {
  name: string;
  type: FilterType;
  field: string;
  operator: FilterOperator;
  value: any;
  options?: any[];
}

export enum FilterType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  BOOLEAN = 'BOOLEAN'
}

export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
  BETWEEN = 'BETWEEN',
  IS_NULL = 'IS_NULL',
  IS_NOT_NULL = 'IS_NOT_NULL'
}

// Reporting Types
export interface Report {
  id: string;
  name: string;
  type: ReportType;
  description: string;
  query: string;
  schedule?: ReportSchedule;
  format: ReportFormat;
  recipients: string[];
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export interface ReportSchedule {
  frequency: ScheduleFrequency;
  dayOfWeek?: number;
  dayOfMonth?: number;
  hour?: number;
  minute?: number;
  timezone: string;
}

export enum ScheduleFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
  HTML = 'HTML'
}

// Query Types
export interface AnalyticsQuery {
  select: string[];
  from: string;
  where?: QueryCondition[];
  groupBy?: string[];
  orderBy?: QueryOrder[];
  limit?: number;
  offset?: number;
  timeRange?: TimeRange;
  aggregations?: QueryAggregation[];
}

export interface QueryCondition {
  field: string;
  operator: FilterOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR'
}

export interface QueryOrder {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface QueryAggregation {
  field: string;
  function: AggregationType;
  alias?: string;
}

// Alert Types
export interface Alert {
  id: string;
  name: string;
  description: string;
  query: string;
  condition: AlertCondition;
  threshold: number;
  isActive: boolean;
  lastTriggered?: Date;
  recipients: string[];
  cooldownPeriod: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: AlertOperator;
  threshold: number;
  timeWindow: number; // minutes
  aggregation: AggregationType;
}

export enum AlertOperator {
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  GREATER_THAN_OR_EQUAL = 'GREATER_THAN_OR_EQUAL',
  LESS_THAN_OR_EQUAL = 'LESS_THAN_OR_EQUAL'
}

// User Analytics Types
export interface UserInsights {
  id?: string;
  userId: string;
  totalSessions: number;
  totalTimeSpent: number;
  averageSessionDuration: number;
  charactersLearned: number;
  currentStreak: number;
  longestStreak: number;
  accuracy: number;
  favoriteMethod: LearningMethod;
  progressRate: number;
  engagementScore: number;
  churnRisk: ChurnRisk;
  recommendations: string[];
  lastActive: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum ChurnRisk {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Cohort Analysis Types
export interface CohortAnalysis {
  cohortDate: Date;
  cohortSize: number;
  retention: CohortRetention[];
  revenue?: CohortRevenue[];
}

export interface CohortRetention {
  period: number;
  periodType: TimeGranularity;
  retainedUsers: number;
  retentionRate: number;
}

export interface CohortRevenue {
  period: number;
  periodType: TimeGranularity;
  revenue: number;
  averageRevenuePerUser: number;
}

// Funnel Analysis Types
export interface FunnelAnalysis {
  name: string;
  steps: FunnelStep[];
  conversionRates: number[];
  dropOffRates: number[];
  timeToConvert: number[];
}

export interface FunnelStep {
  name: string;
  eventName: string;
  users: number;
  conversionRate: number;
}

// Error Types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
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
  roles: string[];
  iat?: number;
  exp?: number;
}

// Configuration Types
export interface AnalyticsConfig {
  retentionDays: number;
  batchSize: number;
  flushInterval: number;
  maxEventsPerRequest: number;
  realtimeEnabled: boolean;
  performanceMonitoring: boolean;
  alertingEnabled: boolean;
  abTestingEnabled: boolean;
  chartGeneration: boolean;
  reportGeneration: boolean;
}

// Data Export Types
export interface DataExport {
  id: string;
  type: ExportType;
  format: ExportFormat;
  query: string;
  filters: Record<string, any>;
  status: ExportStatus;
  filePath?: string;
  fileSize?: number;
  createdAt: Date;
  completedAt?: Date;
  expiresAt: Date;
}

export enum ExportType {
  EVENTS = 'EVENTS',
  METRICS = 'METRICS',
  USERS = 'USERS',
  REPORTS = 'REPORTS',
  CUSTOM = 'CUSTOM'
}

export enum ExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  PARQUET = 'PARQUET',
  EXCEL = 'EXCEL'
}

export enum ExportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}
