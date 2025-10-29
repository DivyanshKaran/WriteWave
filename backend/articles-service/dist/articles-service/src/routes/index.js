"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = void 0;
const express_1 = require("express");
const articles_routes_1 = require("./articles.routes");
const models_1 = require("../models");
const logger_1 = require("../utils/logger");
const redis_1 = require("redis");
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
        await models_1.prisma.$queryRawUnsafe('SELECT 1');
        checks.database = 'healthy';
    }
    catch (error) {
        checks.database = 'unhealthy';
        logger_1.logger.error('Database health check failed', { error: error.message });
    }
    try {
        if (process.env.REDIS_URL) {
            const redisClient = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
            await redisClient.connect();
            await redisClient.ping();
            await redisClient.disconnect();
            checks.redis = 'healthy';
        }
        else {
            checks.redis = 'not_configured';
        }
    }
    catch (error) {
        checks.redis = 'unhealthy';
        logger_1.logger.error('Redis health check failed', { error: error.message });
    }
    checks.latencyMs = Date.now() - start;
    const isHealthy = checks.database === 'healthy' &&
        (checks.redis === 'healthy' || checks.redis === 'not_configured');
    const statusCode = isHealthy ? 200 : 503;
    res.status(statusCode).json({
        success: isHealthy,
        status: isHealthy ? 'healthy' : 'degraded',
        checks,
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
    });
});
router.get('/docs', (_req, res) => {
    res.json({
        success: true,
        message: 'Articles Service API Documentation',
        endpoints: {
            health: 'GET /health',
            articles: {
                create: 'POST /articles',
                list: 'GET /articles',
                get: 'GET /articles/:id',
                update: 'PUT /articles/:id',
                delete: 'DELETE /articles/:id',
                like: 'POST /articles/:id/like',
                bookmark: 'POST /articles/:id/bookmark',
                trending: 'GET /articles/trending',
                featured: 'GET /articles/featured',
                user: 'GET /articles/user/:userId',
                stats: 'GET /articles/stats',
                userStats: 'GET /articles/user/:userId/stats'
            },
            comments: {
                add: 'POST /articles/:id/comments',
                get: 'GET /articles/:id/comments'
            },
            tags: {
                popular: 'GET /articles/tags/popular'
            }
        }
    });
});
router.use('/articles', articles_routes_1.articlesRoutes);
//# sourceMappingURL=index.js.map