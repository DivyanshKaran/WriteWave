"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./config/logger");
const routes_1 = require("./routes");
const uploads_1 = require("./middleware/uploads");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const app = (0, express_1.default)();
(0, uploads_1.ensureUploadDir)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors?.origin || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((req, res, next) => {
    req.id = Math.random().toString(36).substr(2, 9);
    res.setHeader('X-Request-ID', req.id);
    next();
});
app.use((req, res, next) => {
    logger_1.logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    next();
});
app.use('/api/v1', routes_1.apiRoutes);
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Content Service API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/v1/health',
            characters: '/api/v1/characters',
            vocabulary: '/api/v1/vocabulary',
            lessons: '/api/v1/lessons',
            media: '/api/v1/media'
        }
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        error: 'NOT_FOUND',
        timestamp: new Date().toISOString()
    });
});
app.use((error, req, res, next) => {
    logger_1.logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        error: error.code || 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
    });
});
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`${signal} received, shutting down gracefully`);
    try {
        const { disconnectKafka } = await Promise.resolve().then(() => __importStar(require('../../shared/utils/kafka')));
        await disconnectKafka();
        logger_1.logger.info('Kafka connections closed');
    }
    catch (error) {
        logger_1.logger.warn('Error disconnecting Kafka (non-fatal)', { error: error.message });
    }
    process.exit(0);
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        logger_1.logger.info('Database connected successfully');
        await (0, redis_1.connectRedis)();
        logger_1.logger.info('Redis connected successfully');
        if (process.env.ENABLE_KAFKA === 'true') {
            try {
                const { getProducer } = await Promise.resolve().then(() => __importStar(require('../../shared/utils/kafka')));
                await getProducer();
                logger_1.logger.info('Kafka producer connected');
            }
            catch (error) {
                logger_1.logger.warn('Failed to connect Kafka producer (non-fatal)', { error: error.message });
            }
        }
        const PORT = config_1.config.port || 8002;
        app.listen(PORT, () => {
            logger_1.logger.info(`Content Service running on port ${PORT}`, {
                port: PORT,
                environment: config_1.config.nodeEnv,
                timestamp: new Date().toISOString()
            });
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', { error: error.message });
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map