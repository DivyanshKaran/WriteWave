import { Router } from 'express';
import { characterController } from '../controllers/character.controller';
import { validate } from '../middleware/validation';

const router = Router();

// Character routes
// GET /characters/hiragana - Get all Hiragana characters
router.get('/hiragana', characterController.getHiraganaCharacters);

// GET /characters/katakana - Get all Katakana characters
router.get('/katakana', characterController.getKatakanaCharacters);

// GET /characters/kanji/:level - Get Kanji characters by JLPT level
router.get('/kanji/:level', characterController.getKanjiCharacters);

// GET /characters/:id - Get character by ID
router.get('/:id', characterController.getCharacterById);

// GET /characters/:id/stroke-order - Get character stroke order
router.get('/:id/stroke-order', characterController.getCharacterStrokeOrder);

// GET /characters/:id/pronunciation - Get character pronunciation
router.get('/:id/pronunciation', characterController.getCharacterStrokeOrder);

// GET /characters/:id/examples - Get character examples
router.get('/:id/examples', characterController.getCharacterRelationships);

// GET /characters/:id/radicals - Get character radicals (for Kanji)
router.get('/:id/radicals', characterController.getCharacterRelationships);

// GET /characters/:id/compounds - Get character compounds (for Kanji)
router.get('/:id/compounds', characterController.getCharacterRelationships);

// GET /characters/search - Search characters
router.get('/search', characterController.searchCharacters);

// GET /characters/statistics - Get character statistics
router.get('/statistics', characterController.getCharacterStatistics);

// GET /characters/random - Get random characters
router.get('/random', characterController.getCharacters);

// POST /characters - Create character (admin only)
router.post('/', characterController.createCharacter);

// PUT /characters/:id - Update character (admin only)
router.put('/:id', characterController.updateCharacter);

// DELETE /characters/:id - Delete character (admin only)
router.delete('/:id', characterController.deleteCharacter);

export { router as characterRoutes };
