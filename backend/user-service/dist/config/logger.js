"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupLogger = exports.healthCheckLogger = exports.rateLimitLogger = exports.fileUploadLogger = exports.oauthLogger = exports.emailLogger = exports.userActionLogger = exports.authLogger = exports.cacheLogger = exports.databaseLogger = exports.performanceLogger = exports.securityLogger = exports.errorLogger = exports.requestLogger = exports.morganStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
const fileFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const transports = [
    new winston_1.default.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
        format: format,
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }),
    new winston_1.default.transports.File({
        filename: path_1.default.join(process.cwd(), 'logs', 'combined.log'),
        format: fileFormat,
        maxsize: 5242880,
        maxFiles: 5,
    }),
];
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: fileFormat,
    transports,
    exitOnError: false,
});
exports.morganStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
const requestLogger = (req, res, next) => {
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
            exports.logger.warn('HTTP Request', logData);
        }
        else {
            exports.logger.info('HTTP Request', logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
const errorLogger = (error, req) => {
    const logData = {
        message: error.message,
        stack: error.stack,
        url: req?.url,
        method: req?.method,
        ip: req?.ip,
        userAgent: req?.get('User-Agent'),
        userId: req?.user?.id,
    };
    exports.logger.error('Application Error', logData);
};
exports.errorLogger = errorLogger;
const securityLogger = (event, details) => {
    exports.logger.warn('Security Event', {
        event,
        ...details,
        timestamp: new Date().toISOString(),
    });
};
exports.securityLogger = securityLogger;
const performanceLogger = (operation, duration, details) => {
    exports.logger.info('Performance Metric', {
        operation,
        duration: `${duration}ms`,
        ...details,
    });
};
exports.performanceLogger = performanceLogger;
const databaseLogger = (operation, duration, details) => {
    exports.logger.debug('Database Operation', {
        operation,
        duration: `${duration}ms`,
        ...details,
    });
};
exports.databaseLogger = databaseLogger;
const cacheLogger = (operation, key, hit, duration) => {
    exports.logger.debug('Cache Operation', {
        operation,
        key,
        hit,
        duration: duration ? `${duration}ms` : undefined,
    });
};
exports.cacheLogger = cacheLogger;
const authLogger = (event, userId, details) => {
    exports.logger.info('Authentication Event', {
        event,
        userId,
        ...details,
    });
};
exports.authLogger = authLogger;
const userActionLogger = (action, userId, details) => {
    exports.logger.info('User Action', {
        action,
        userId,
        ...details,
    });
};
exports.userActionLogger = userActionLogger;
const emailLogger = (event, recipient, details) => {
    exports.logger.info('Email Event', {
        event,
        recipient,
        ...details,
    });
};
exports.emailLogger = emailLogger;
const oauthLogger = (provider, event, details) => {
    exports.logger.info('OAuth Event', {
        provider,
        event,
        ...details,
    });
};
exports.oauthLogger = oauthLogger;
const fileUploadLogger = (event, userId, details) => {
    exports.logger.info('File Upload Event', {
        event,
        userId,
        ...details,
    });
};
exports.fileUploadLogger = fileUploadLogger;
const rateLimitLogger = (ip, endpoint, limit) => {
    exports.logger.warn('Rate Limit Exceeded', {
        ip,
        endpoint,
        limit,
    });
};
exports.rateLimitLogger = rateLimitLogger;
const healthCheckLogger = (service, status, duration) => {
    exports.logger.info('Health Check', {
        service,
        status,
        duration: duration ? `${duration}ms` : undefined,
    });
};
exports.healthCheckLogger = healthCheckLogger;
const cleanupLogger = (operation, count, details) => {
    exports.logger.info('Cleanup Operation', {
        operation,
        count,
        ...details,
    });
};
exports.cleanupLogger = cleanupLogger;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map