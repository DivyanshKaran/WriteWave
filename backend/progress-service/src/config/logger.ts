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

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Transports
const transports: winston.transport[] = [
  // Console transport
  new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
    format: process.env.NODE_ENV === 'production' ? jsonFormat : consoleFormat,
  }),
];

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      format: jsonFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export logger
export { logger };
export default logger;
