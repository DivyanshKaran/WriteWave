import { Router } from 'express';
import { vocabularyController } from '../controllers/vocabulary.controller';
import { validate, validationSchemas } from '../middleware/validation';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Vocabulary routes
// GET /vocabulary - Get all vocabulary words
router.get('/', vocabularyController.getVocabularyWords);

// GET /vocabulary/search - Search vocabulary words
router.get('/search', vocabularyController.searchVocabularyWords);

// GET /vocabulary/statistics - Get vocabulary statistics
router.get('/statistics', vocabularyController.getVocabularyStatistics);

// GET /vocabulary/random - Get random vocabulary words
router.get('/random', vocabularyController.getRandomVocabularyWords);

// GET /vocabulary/frequency - Get vocabulary words by frequency
router.get('/frequency', vocabularyController.getVocabularyWordsByFrequency);

// GET /vocabulary/part-of-speech/:partOfSpeech - Get vocabulary words by part of speech
router.get('/part-of-speech/:partOfSpeech', vocabularyController.getVocabularyWordsByPartOfSpeech);

// GET /vocabulary/category/:category - Get vocabulary words by category
router.get('/category/:category', vocabularyController.getVocabularyWordsByCategory);

// GET /vocabulary/jlpt/:level - Get vocabulary words by JLPT level
router.get('/jlpt/:level', vocabularyController.getVocabularyWordsByJLPTLevel);

// GET /vocabulary/:vocabularyId - Get vocabulary word by ID
router.get('/:vocabularyId', vocabularyController.getVocabularyWordById);

// POST /vocabulary - Create vocabulary word (admin only)
router.post('/', authenticateJWT, validate(validationSchemas.vocabulary), vocabularyController.createVocabularyWord);

// PUT /vocabulary/:vocabularyId - Update vocabulary word (admin only)
router.put('/:vocabularyId', authenticateJWT, validate(validationSchemas.vocabulary), vocabularyController.updateVocabularyWord);

// DELETE /vocabulary/:vocabularyId - Delete vocabulary word (admin only)
router.delete('/:vocabularyId', authenticateJWT, vocabularyController.deleteVocabularyWord);

export { router as vocabularyRoutes };
