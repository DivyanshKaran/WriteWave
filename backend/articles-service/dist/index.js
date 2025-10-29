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
const morgan_1 = __importDefault(require("morgan"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const compression_1 = __importDefault(require("compression"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
const logger_1 = require("./utils/logger");
const uploads_1 = require("./middleware/uploads");
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, uploads_1.ensureUploadDir)();
const PORT = process.env['PORT'] || 8007;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: (process.env['CORS_ORIGIN'] || process.env['FRONTEND_URL'] || 'http://localhost:3000').split(','),
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use((0, compression_1.default)());
const logsDir = path_1.default.resolve(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
if (process.env['NODE_ENV'] === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
else {
    app.use((0, morgan_1.default)('combined'));
}
app.use(logger_1.requestLogger);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', routes_1.apiRoutes);
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'WriteWave Articles Service',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.use('*', (_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Endpoint not found',
            code: 'NOT_FOUND'
        }
    });
});
app.use((error, _req, res, _next) => {
    console.error('Global Error Handler:', error);
    const isDevelopment = process.env['NODE_ENV'] === 'development';
    res.status(error.status || 500).json({
        success: false,
        error: {
            message: isDevelopment ? error.message : 'Internal server error',
            code: error.code || 'INTERNAL_ERROR',
            ...(isDevelopment && { stack: error.stack })
        }
    });
});
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
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
const initializeKafka = async () => {
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
};
app.listen(PORT, async () => {
    logger_1.logger.info(`Articles Service running on port ${PORT}`, {
        port: PORT,
        environment: process.env['NODE_ENV'] || 'development',
    });
    await initializeKafka();
});
exports.default = app;
//# sourceMappingURL=index.js.map