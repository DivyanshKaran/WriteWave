import winston from 'winston';
import path from 'path';

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// File format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: format,
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Error logger
export const errorLogger = (error: Error, req?: any) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    url: req?.url,
    method: req?.method,
    ip: req?.ip,
    userAgent: req?.get('User-Agent'),
    userId: req?.user?.id,
  };
  
  logger.error('Application Error', logData);
};

// Security logger
export const securityLogger = (event: string, details: any) => {
  logger.warn('Security Event', {
    event,
    ...details,
    timestamp: new Date().toISOString(),
  });
};

// Performance logger
export const performanceLogger = (operation: string, duration: number, details?: any) => {
  logger.info('Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details,
  });
};

// Database logger
export const databaseLogger = (operation: string, duration: number, details?: any) => {
  logger.debug('Database Operation', {
    operation,
    duration: `${duration}ms`,
    ...details,
  });
};

// Cache logger
export const cacheLogger = (operation: string, key: string, hit: boolean, duration?: number) => {
  logger.debug('Cache Operation', {
    operation,
    key,
    hit,
    duration: duration ? `${duration}ms` : undefined,
  });
};

// Authentication logger
export const authLogger = (event: string, userId?: string, details?: any) => {
  logger.info('Authentication Event', {
    event,
    userId,
    ...details,
  });
};

// User action logger
export const userActionLogger = (action: string, userId: string, details?: any) => {
  logger.info('User Action', {
    action,
    userId,
    ...details,
  });
};

// Email logger
export const emailLogger = (event: string, recipient: string, details?: any) => {
  logger.info('Email Event', {
    event,
    recipient,
    ...details,
  });
};

// OAuth logger
export const oauthLogger = (provider: string, event: string, details?: any) => {
  logger.info('OAuth Event', {
    provider,
    event,
    ...details,
  });
};

// File upload logger
export const fileUploadLogger = (event: string, userId: string, details?: any) => {
  logger.info('File Upload Event', {
    event,
    userId,
    ...details,
  });
};

// Rate limit logger
export const rateLimitLogger = (ip: string, endpoint: string, limit: number) => {
  logger.warn('Rate Limit Exceeded', {
    ip,
    endpoint,
    limit,
  });
};

// Health check logger
export const healthCheckLogger = (service: string, status: string, duration?: number) => {
  logger.info('Health Check', {
    service,
    status,
    duration: duration ? `${duration}ms` : undefined,
  });
};

// Cleanup logger
export const cleanupLogger = (operation: string, count: number, details?: any) => {
  logger.info('Cleanup Operation', {
    operation,
    count,
    ...details,
  });
};

// Export logger instance
export default logger;
