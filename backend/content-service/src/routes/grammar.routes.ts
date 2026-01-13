import { Router } from 'express';
import { grammarController } from '../controllers/grammar.controller';

const router = Router();

// GET /grammar - list grammar patterns (placeholder, returns empty for now)
router.get('/', grammarController.listGrammar);

export const grammarRoutes = router;


