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
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
require("express-async-errors");
const config_1 = require("./config");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = require("./config/logger");
const auth_1 = require("./middleware/auth");
const passport_1 = __importDefault(require("./config/passport"));
const routes_1 = __importDefault(require("./routes"));
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
};
const requestId = (req, res, next) => {
    req.id = Math.random().toString(36).substr(2, 9);
    next();
};
const notFound = (req, res) => {
    res.status(404).json({ message: 'Route not found' });
};
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error:', err);
    res.status(500).json({ message: 'Internal server error' });
};
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use(securityHeaders);
app.use(auth_1.corsMiddleware);
app.use(requestId);
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport_1.default.initialize());
app.use((0, morgan_1.default)('combined', { stream: logger_1.morganStream }));
app.use(logger_1.requestLogger);
app.use((0, auth_1.rateLimit)(100, 900000));
app.use(`/api/${config_1.config.apiVersion}`, routes_1.default);
app.use(notFound);
app.use(errorHandler);
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Starting graceful shutdown...`);
    try {
        try {
            const { disconnectKafka } = await Promise.resolve().then(() => __importStar(require('./utils/events')));
            await disconnectKafka();
            logger_1.logger.info('Kafka connections closed');
        }
        catch (error) {
            logger_1.logger.warn('Error disconnecting Kafka (non-fatal)', { error: error.message });
        }
        await (0, database_1.disconnectDatabase)();
        await (0, redis_1.disconnectRedis)();
        logger_1.logger.info('Graceful shutdown completed');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during graceful shutdown', { error: error.message });
        process.exit(1);
    }
};
process.on('uncaughtException', (error) => {
    logger_1.logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger_1.logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const startServer = async () => {
    try {
        await (0, database_1.connectDatabase)();
        await (0, redis_1.connectRedis)();
        if (process.env.ENABLE_KAFKA === 'true') {
            try {
                const { getProducer } = await Promise.resolve().then(() => __importStar(require('./utils/events')));
                await getProducer();
                logger_1.logger.info('Kafka producer connected');
            }
            catch (error) {
                logger_1.logger.warn('Failed to connect Kafka producer (non-fatal)', { error: error.message });
            }
        }
        const server = app.listen(config_1.config.port, () => {
            logger_1.logger.info(`User Service started on port ${config_1.config.port}`, {
                port: config_1.config.port,
                environment: config_1.config.nodeEnv,
                version: process.env.npm_package_version || '1.0.0',
            });
        });
        server.on('error', (error) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
            const bind = typeof config_1.config.port === 'string' ? 'Pipe ' + config_1.config.port : 'Port ' + config_1.config.port;
            switch (error.code) {
                case 'EACCES':
                    logger_1.logger.error(`${bind} requires elevated privileges`);
                    process.exit(1);
                    break;
                case 'EADDRINUSE':
                    logger_1.logger.error(`${bind} is already in use`);
                    process.exit(1);
                    break;
                default:
                    throw error;
            }
        });
        return server;
    }
    catch (error) {
        logger_1.logger.error('Failed to start server', { error: error.message });
        process.exit(1);
    }
};
(async () => {
    const server = await startServer();
})();
exports.default = app;
//# sourceMappingURL=index.js.map