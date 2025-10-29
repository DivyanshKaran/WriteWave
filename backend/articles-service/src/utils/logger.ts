import winston from 'winston';

const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

const requestIdFormat = winston.format((info) => {
  const reqId = (global as any).requestId;
  if (reqId) {
    (info as any).requestId = reqId;
  }
  return info;
});

export const logger = winston.createLogger({
  level: logLevel,
  format: isDevelopment
    ? winston.format.combine(
        requestIdFormat(),
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const req = (meta as any).requestId ? ` [req:${(meta as any).requestId}]` : '';
          return `${timestamp} ${level}${req}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    : winston.format.combine(requestIdFormat(), winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

export const requestLogger = (req: any, _res: any, next: any) => {
  (global as any).requestId = req.id || req.headers['x-request-id'];
  next();
};


