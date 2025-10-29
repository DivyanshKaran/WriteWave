import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { EpubExtractorService } from '../services/epub-extractor.service';
import { logger } from '../config/logger';
import { validationSchemas } from '../middleware/validation';

export class EpubController {
  private epubExtractor: EpubExtractorService;
  private upload: multer.Multer;

  constructor() {
    this.epubExtractor = new EpubExtractorService();
    
    // Configure multer for EPUB file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'epub');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `epub-${uniqueSuffix}${path.extname(file.originalname)}`);
      }
    });

    this.upload = multer({
      storage,
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/epub+zip' || 
            file.originalname.toLowerCase().endsWith('.epub')) {
          cb(null, true);
        } else {
          cb(new Error('Only EPUB files are allowed'));
        }
      }
    });
  }

  /**
   * Get multer middleware for file upload
   */
  getUploadMiddleware() {
    return this.upload.single('epub');
  }

  /**
   * Upload EPUB file and extract kanji characters
   */
  uploadAndExtractKanji = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No EPUB file uploaded'
        });
        return;
      }

      logger.info(`Processing EPUB upload: ${req.file.originalname}`);

      // Process the EPUB file
      const result = await this.epubExtractor.processEpubFile(req.file.path);

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      res.status(200).json({
        success: true,
        message: 'EPUB processed successfully',
        data: {
          extraction: {
            title: result.extractionResult.title,
            author: result.extractionResult.author,
            totalKanji: result.extractionResult.totalKanji,
            uniqueKanjiCount: result.extractionResult.uniqueKanji.length,
            extractionDate: result.extractionResult.extractionDate
          },
          kanjiPages: result.kanjiPagesData,
          savedCount: result.savedKanji.length
        }
      });

    } catch (error) {
      logger.error('Error processing EPUB upload:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: 'Error processing EPUB file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Extract kanji from existing EPUB file
   */
  extractKanjiFromFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const { filePath } = req.body;

      if (!filePath || !fs.existsSync(filePath)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file path or file does not exist'
        });
        return;
      }

      logger.info(`Extracting kanji from existing file: ${filePath}`);

      const result = await this.epubExtractor.processEpubFile(filePath);

      res.status(200).json({
        success: true,
        message: 'Kanji extraction completed successfully',
        data: {
          extraction: {
            title: result.extractionResult.title,
            author: result.extractionResult.author,
            totalKanji: result.extractionResult.totalKanji,
            uniqueKanjiCount: result.extractionResult.uniqueKanji.length,
            extractionDate: result.extractionResult.extractionDate
          },
          kanjiPages: result.kanjiPagesData,
          savedCount: result.savedKanji.length
        }
      });

    } catch (error) {
      logger.error('Error extracting kanji from file:', error);
      res.status(500).json({
        success: false,
        message: 'Error extracting kanji from file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get kanji pages data for a specific character
   */
  getKanjiPageData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { character } = req.params;

      if (!character) {
        res.status(400).json({
          success: false,
          message: 'Character parameter is required'
        });
        return;
      }

      // Decode the character if it's URL encoded
      const decodedCharacter = decodeURIComponent(character);

      // Get character data from database
      const characterData = await this.epubExtractor.characterService.getCharacterByCharacter(decodedCharacter);

      if (!characterData) {
        res.status(404).json({
          success: false,
          message: 'Character not found'
        });
        return;
      }

      // Generate kanji page data
      const kanjiPageData = this.epubExtractor.generateKanjiPagesData([characterData])[0];

      res.status(200).json({
        success: true,
        data: kanjiPageData
      });

    } catch (error) {
      logger.error('Error getting kanji page data:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving kanji page data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all kanji extracted from EPUBs
   */
  getAllExtractedKanji = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 50, sortBy = 'frequency', sortOrder = 'desc' } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Get kanji characters from database
      const charactersResponse = await this.epubExtractor.characterService.getCharacters({
        page: pageNum,
        limit: limitNum,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      }, {
        type: 'KANJI'
      });

      if (!charactersResponse.success || !charactersResponse.data) {
        res.status(500).json({
          success: false,
          message: 'Error retrieving kanji data'
        });
        return;
      }

      const characters = charactersResponse.data.data;

      // Generate kanji pages data
      const kanjiPagesData = this.epubExtractor.generateKanjiPagesData(characters);

      res.status(200).json({
        success: true,
        data: {
          kanji: kanjiPagesData,
          pagination: {
            page: charactersResponse.data.page,
            limit: charactersResponse.data.limit,
            total: charactersResponse.data.total,
            totalPages: charactersResponse.data.totalPages,
            hasNext: charactersResponse.data.hasNext,
            hasPrev: charactersResponse.data.hasPrev
          }
        }
      });

    } catch (error) {
      logger.error('Error getting all extracted kanji:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving kanji data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Search kanji by character or meaning
   */
  searchKanji = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query, type = 'all' } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
        return;
      }

      // Search characters in database
      const charactersResponse = await this.epubExtractor.characterService.searchCharacters(
        query as string,
        { type: type as any }
      );

      if (!charactersResponse.success || !charactersResponse.data) {
        res.status(500).json({
          success: false,
          message: 'Error searching characters'
        });
        return;
      }

      const characters = charactersResponse.data.data;

      // Filter for kanji only
      const kanjiCharacters = characters.filter(char => char.type === 'KANJI');

      // Generate kanji pages data
      const kanjiPagesData = this.epubExtractor.generateKanjiPagesData(kanjiCharacters);

      res.status(200).json({
        success: true,
        data: {
          kanji: kanjiPagesData,
          count: kanjiPagesData.length
        }
      });

    } catch (error) {
      logger.error('Error searching kanji:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching kanji',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get extraction statistics
   */
  getExtractionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      // Get statistics from database
      const stats = await this.epubExtractor.characterService.getCharacterStats();

      res.status(200).json({
        success: true,
        data: {
          totalKanji: stats.totalKanji || 0,
          totalCharacters: stats.totalCharacters || 0,
          kanjiByLevel: stats.kanjiByLevel || {},
          recentExtractions: stats.recentExtractions || []
        }
      });

    } catch (error) {
      logger.error('Error getting extraction stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving extraction statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
