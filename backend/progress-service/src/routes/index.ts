import { Router } from 'express';
import { progressRoutes } from './progress.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/progress', progressRoutes);
router.use('/health', healthRoutes);

export default router;
