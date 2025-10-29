import { Router } from 'express';
import Joi from 'joi';
import { EpubController } from '../controllers/epub.controller';
import { validateRequest, validationSchemas } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const epubController = new EpubController();

/**
 * @route POST /api/v1/epub/upload
 * @desc Upload EPUB file and extract kanji characters
 * @access Private
 */
router.post(
  '/upload',
  authMiddleware,
  epubController.getUploadMiddleware(),
  epubController.uploadAndExtractKanji
);

/**
 * @route POST /api/v1/epub/extract
 * @desc Extract kanji from existing EPUB file
 * @access Private
 */
router.post(
  '/extract',
  authMiddleware,
  validateRequest(Joi.object({
    filePath: Joi.string().required()
  })),
  epubController.extractKanjiFromFile
);

/**
 * @route GET /api/v1/epub/kanji/:character
 * @desc Get kanji page data for specific character
 * @access Public
 */
router.get(
  '/kanji/:character',
  epubController.getKanjiPageData
);

/**
 * @route GET /api/v1/epub/kanji
 * @desc Get all extracted kanji with pagination
 * @access Public
 */
router.get(
  '/kanji',
  epubController.getAllExtractedKanji
);

/**
 * @route GET /api/v1/epub/search
 * @desc Search kanji by character or meaning
 * @access Public
 */
router.get(
  '/search',
  epubController.searchKanji
);

/**
 * @route GET /api/v1/epub/stats
 * @desc Get extraction statistics
 * @access Public
 */
router.get(
  '/stats',
  epubController.getExtractionStats
);

export default router;
