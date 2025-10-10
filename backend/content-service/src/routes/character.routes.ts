import { Router } from 'express';
import { characterController } from '@/controllers/character.controller';
import { validate } from '@/middleware/validation';
import { authenticateJWT } from '@/middleware/auth';

const router = Router();

// Character routes
// GET /characters/hiragana - Get all Hiragana characters
router.get('/hiragana', characterController.getHiragana);

// GET /characters/katakana - Get all Katakana characters
router.get('/katakana', characterController.getKatakana);

// GET /characters/kanji/:level - Get Kanji characters by JLPT level
router.get('/kanji/:level', characterController.getKanjiByLevel);

// GET /characters/:id - Get character by ID
router.get('/:id', characterController.getCharacterById);

// GET /characters/:id/stroke-order - Get character stroke order
router.get('/:id/stroke-order', characterController.getCharacterStrokeOrder);

// GET /characters/:id/pronunciation - Get character pronunciation
router.get('/:id/pronunciation', characterController.getCharacterPronunciation);

// GET /characters/:id/examples - Get character examples
router.get('/:id/examples', characterController.getCharacterExamples);

// GET /characters/:id/radicals - Get character radicals (for Kanji)
router.get('/:id/radicals', characterController.getCharacterRadicals);

// GET /characters/:id/compounds - Get character compounds (for Kanji)
router.get('/:id/compounds', characterController.getCharacterCompounds);

// GET /characters/search - Search characters
router.get('/search', characterController.searchCharacters);

// GET /characters/statistics - Get character statistics
router.get('/statistics', characterController.getCharacterStatistics);

// GET /characters/random - Get random characters
router.get('/random', characterController.getRandomCharacters);

// POST /characters - Create character (admin only)
router.post('/', authenticateJWT, validate('character'), characterController.createCharacter);

// PUT /characters/:id - Update character (admin only)
router.put('/:id', authenticateJWT, validate('character'), characterController.updateCharacter);

// DELETE /characters/:id - Delete character (admin only)
router.delete('/:id', authenticateJWT, characterController.deleteCharacter);

export { router as characterRoutes };
