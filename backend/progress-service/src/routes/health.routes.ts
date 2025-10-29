import { Router } from 'express';
import prisma from '../config/database';
import { cacheSet, cacheGet } from '../config/redis';

const router = Router();

router.get('/', async (_req, res) => {
  const start = Date.now();
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    await cacheSet('health:ping', 'pong', 10);
    const pong = await cacheGet<string>('health:ping');
    res.json({ success: true, status: 'healthy', db: 'ok', redis: pong === 'pong' ? 'ok' : 'fail', latencyMs: Date.now() - start });
  } catch (e: any) {
    res.status(503).json({ success: false, status: 'unhealthy', error: e.message });
  }
});

export default router;
