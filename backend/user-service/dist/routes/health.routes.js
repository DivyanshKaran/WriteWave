"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const router = (0, express_1.Router)();
router.get('/', async (_req, res) => {
    const start = Date.now();
    try {
        await database_1.prisma.$queryRawUnsafe('SELECT 1');
        await (0, redis_1.getCacheService)().set('health:ping', 'pong', 10);
        const pong = await (0, redis_1.getCacheService)().get('health:ping');
        res.json({ success: true, status: 'healthy', db: 'ok', redis: pong === 'pong' ? 'ok' : 'fail', latencyMs: Date.now() - start });
    }
    catch (e) {
        res.status(503).json({ success: false, status: 'unhealthy', error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map