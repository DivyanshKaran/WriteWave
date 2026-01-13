import { Router } from 'express';
import { radicalController } from '../controllers/radical.controller';

const router = Router();

// GET /radicals - list radicals with optional filters
router.get('/', radicalController.listRadicals);

export const radicalRoutes = router;


