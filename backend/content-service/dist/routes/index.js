"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const character_routes_1 = require("./character.routes");
const vocabulary_routes_1 = require("./vocabulary.routes");
const lesson_routes_1 = require("./lesson.routes");
const media_routes_1 = require("./media.routes");
const redis_1 = require("../config/redis");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const router = (0, express_1.Router)();
exports.apiRoutes = router;
router.get('/health', async (_req, res) => {
    const start = Date.now();
    const checks = {
        service: 'healthy',
        database: 'unknown',
        redis: 'unknown',
    };
    try {
        const dbHealth = await (0, database_1.checkDatabaseHealth)();
        checks.database = dbHealth.status === 'connected' ? 'healthy' : 'unhealthy';
    }
    catch (error) {
        checks.database = 'unhealthy';
        logger_1.logger.error('Database health check failed', { error: error.message });
    }
    try {
        const redisHealth = await (0, redis_1.checkRedisHealth)();
        checks.redis = redisHealth.status === 'connected' ? 'healthy' : 'unhealthy';
    }
    catch (error) {
        checks.redis = 'unhealthy';
        logger_1.logger.error('Redis health check failed', { error: error.message });
    }
    checks.latencyMs = Date.now() - start;
    const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json({
        success: isHealthy,
        status: isHealthy ? 'healthy' : 'degraded',
        checks,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
router.use('/characters', character_routes_1.characterRoutes);
router.use('/vocabulary', vocabulary_routes_1.vocabularyRoutes);
router.use('/lessons', lesson_routes_1.lessonRoutes);
router.use('/media', media_routes_1.mediaRoutes);
//# sourceMappingURL=index.js.map