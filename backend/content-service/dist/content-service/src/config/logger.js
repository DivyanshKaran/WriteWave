"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statisticsLogger = exports.healthCheckLogger = exports.rateLimitLogger = exports.databaseLogger = exports.performanceLogger = exports.fileUploadLogger = exports.cacheLogger = exports.searchLogger = exports.mediaLogger = exports.lessonLogger = exports.vocabularyLogger = exports.characterLogger = exports.contentLogger = exports.errorLogger = exports.requestLogger = exports.morganStream = exports.logger = void 0;
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
const contentLogger = (action, details) => {
    exports.logger.info('Content Action', {
        action,
        ...details,
        timestamp: new Date().toISOString(),
    });
};
exports.contentLogger = contentLogger;
const characterLogger = (action, characterId, details) => {
    exports.logger.info('Character Action', {
        action,
        characterId,
        ...details,
    });
};
exports.characterLogger = characterLogger;
const vocabularyLogger = (action, vocabularyId, details) => {
    exports.logger.info('Vocabulary Action', {
        action,
        vocabularyId,
        ...details,
    });
};
exports.vocabularyLogger = vocabularyLogger;
const lessonLogger = (action, lessonId, details) => {
    exports.logger.info('Lesson Action', {
        action,
        lessonId,
        ...details,
    });
};
exports.lessonLogger = lessonLogger;
const mediaLogger = (action, mediaId, details) => {
    exports.logger.info('Media Action', {
        action,
        mediaId,
        ...details,
    });
};
exports.mediaLogger = mediaLogger;
const searchLogger = (query, results, duration, details) => {
    exports.logger.info('Search Query', {
        query,
        results,
        duration: `${duration}ms`,
        ...details,
    });
};
exports.searchLogger = searchLogger;
const cacheLogger = (operation, key, hit, duration) => {
    exports.logger.debug('Cache Operation', {
        operation,
        key,
        hit,
        duration: duration ? `${duration}ms` : undefined,
    });
};
exports.cacheLogger = cacheLogger;
const fileUploadLogger = (action, filename, size, details) => {
    exports.logger.info('File Upload', {
        action,
        filename,
        size,
        ...details,
    });
};
exports.fileUploadLogger = fileUploadLogger;
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
const statisticsLogger = (type, count, details) => {
    exports.logger.info('Statistics Update', {
        type,
        count,
        ...details,
    });
};
exports.statisticsLogger = statisticsLogger;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map