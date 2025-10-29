import winston from 'winston';
import path from 'path';
import { TransformableInfo } from 'logform';

/**
 * Log levels configuration
 */
export const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Custom log format for structured logging
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, service, requestId, userId, ...meta } = info;
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: service || 'unknown',
      requestId,
      userId,
      ...meta
    });
  })
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf((info: TransformableInfo) => {
    const { timestamp, level, message, service, requestId, userId, ...meta } = info;
    const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
    
    return `${timestamp} [${service || 'unknown'}] ${level}: ${message}${metaStr}`;
  })
);

/**
 * Create logger instance
 */
export const createLogger = (serviceName: string): winston.Logger => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  const transports: winston.transport[] = [
    // Console transport
    new winston.transports.Console({
      level: isDevelopment ? 'debug' : 'info',
      format: isDevelopment ? consoleFormat : customFormat
    })
  ];

  // File transports for production
  if (isProduction) {
    // Error log file
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
      })
    );

    // Combined log file
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'combined.log'),
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
      })
    );

    // Access log file
    transports.push(
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'access.log'),
        level: 'http',
        format: customFormat,
        maxsize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        tailable: true
      })
    );
  }

  return winston.createLogger({
    level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
    levels: LOG_LEVELS,
    format: customFormat,
    transports,
    defaultMeta: { service: serviceName },
    exitOnError: false
  });
};

/**
 * Request logging middleware
 */
/**
 * Request logging middleware with structured logging fields
 * Includes: traceId, userId, service, route, status
 */
export const requestLogger = (logger: winston.Logger, serviceName?: string) => {
  return (req: any, res: any, next: any): void => {
    const start = Date.now();
    const requestId = req.id || req.headers['x-request-id'] || 'unknown';
    const traceId = req.headers['x-trace-id'] || req.headers['x-request-id'] || requestId;
    const userId = req.user?.id || req.headers['x-user-id'];
    const route = req.route?.path || req.path || req.url;
    const service = serviceName || process.env.SERVICE_NAME || 'unknown';
    
    // Log request
    logger.http('Request received', {
      traceId,
      requestId,
      service,
      method: req.method,
      route,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk: any, encoding?: any): any {
      const duration = Date.now() - start;
      const status = res.statusCode;
      
      logger.http('Response sent', {
        traceId,
        requestId,
        service,
        method: req.method,
        route,
        url: req.url,
        status,
        statusCode: status,
        duration: `${duration}ms`,
        userId
      });

      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

/**
 * Error logging middleware
 */
export const errorLogger = (logger: winston.Logger) => {
  return (error: Error, req: any, res: any, next: any): void => {
    const requestId = req.id || 'unknown';
    
    logger.error('Request error', {
      requestId,
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.user?.id
    });

    next(error);
  };
};

/**
 * Performance monitoring logger
 */
export class PerformanceLogger {
  private logger: winston.Logger;
  private metrics: Map<string, number[]> = new Map();

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Start timing an operation
   */
  startTimer(operation: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(operation, duration);
      
      this.logger.debug('Operation completed', {
        operation,
        duration: `${duration}ms`
      });
    };
  }

  /**
   * Record a metric
   */
  recordMetric(operation: string, value: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const values = this.metrics.get(operation)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  /**
   * Get performance statistics
   */
  getStats(operation: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    p95: number;
    p99: number;
  } | null {
    const values = this.metrics.get(operation);
    if (!values || values.length === 0) {
      return null;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = sorted.length;
    const avg = sorted.reduce((sum, val) => sum + val, 0) / count;
    const min = sorted[0];
    const max = sorted[count - 1];
    const p95 = sorted[Math.floor(count * 0.95)];
    const p99 = sorted[Math.floor(count * 0.99)];

    return { count, avg, min, max, p95, p99 };
  }

  /**
   * Log performance summary
   */
  logPerformanceSummary(): void {
    const summary: Record<string, any> = {};
    
    for (const [operation, values] of this.metrics.entries()) {
      const stats = this.getStats(operation);
      if (stats) {
        summary[operation] = stats;
      }
    }

    this.logger.info('Performance summary', { summary });
  }
}

/**
 * Database query logger
 */
export class DatabaseLogger {
  private logger: winston.Logger;
  private slowQueryThreshold: number;

  constructor(logger: winston.Logger, slowQueryThreshold: number = 1000) {
    this.logger = logger;
    this.slowQueryThreshold = slowQueryThreshold;
  }

  /**
   * Log database query
   */
  logQuery(query: string, duration: number, params?: any[]): void {
    const isSlow = duration > this.slowQueryThreshold;
    const level = isSlow ? 'warn' : 'debug';
    
    this.logger.log(level, 'Database query executed', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      duration: `${duration}ms`,
      params: params?.length ? params.length : 0,
      isSlow
    });
  }

  /**
   * Log database error
   */
  logError(query: string, error: Error, params?: any[]): void {
    this.logger.error('Database query error', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      error: error.message,
      params: params?.length ? params.length : 0
    });
  }
}

/**
 * Security event logger
 */
export class SecurityLogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Log authentication events
   */
  logAuth(event: string, userId?: string, ip?: string, userAgent?: string): void {
    this.logger.info('Authentication event', {
      event,
      userId,
      ip,
      userAgent
    });
  }

  /**
   * Log authorization events
   */
  logAuthz(event: string, userId?: string, resource?: string, action?: string): void {
    this.logger.info('Authorization event', {
      event,
      userId,
      resource,
      action
    });
  }

  /**
   * Log security violations
   */
  logViolation(event: string, details: Record<string, any>): void {
    this.logger.warn('Security violation', {
      event,
      ...details
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspicious(event: string, details: Record<string, any>): void {
    this.logger.warn('Suspicious activity', {
      event,
      ...details
    });
  }
}

/**
 * Business event logger
 */
export class BusinessLogger {
  private logger: winston.Logger;

  constructor(logger: winston.Logger) {
    this.logger = logger;
  }

  /**
   * Log user actions
   */
  logUserAction(action: string, userId: string, details?: Record<string, any>): void {
    this.logger.info('User action', {
      action,
      userId,
      ...details
    });
  }

  /**
   * Log business metrics
   */
  logMetric(metric: string, value: number, tags?: Record<string, string>): void {
    this.logger.info('Business metric', {
      metric,
      value,
      tags
    });
  }

  /**
   * Log feature usage
   */
  logFeatureUsage(feature: string, userId: string, details?: Record<string, any>): void {
    this.logger.info('Feature usage', {
      feature,
      userId,
      ...details
    });
  }
}

/**
 * Default logger instance
 */
export const logger = createLogger('writewave');

/**
 * Default performance logger
 */
export const performanceLogger = new PerformanceLogger(logger);

/**
 * Default database logger
 */
export const databaseLogger = new DatabaseLogger(logger);

/**
 * Default security logger
 */
export const securityLogger = new SecurityLogger(logger);

/**
 * Default business logger
 */
export const businessLogger = new BusinessLogger(logger);

/**
 * Morgan stream for HTTP logging
 */
export const morganStream = {
  write: (message: string): void => {
    logger.http(message.trim());
  }
};
