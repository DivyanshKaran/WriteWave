"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpubController = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const epub_extractor_service_1 = require("../services/epub-extractor.service");
const logger_1 = require("../config/logger");
class EpubController {
    constructor() {
        this.uploadAndExtractKanji = async (req, res) => {
            try {
                if (!req.file) {
                    res.status(400).json({
                        success: false,
                        message: 'No EPUB file uploaded'
                    });
                    return;
                }
                logger_1.logger.info(`Processing EPUB upload: ${req.file.originalname}`);
                const result = await this.epubExtractor.processEpubFile(req.file.path);
                fs_1.default.unlinkSync(req.file.path);
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
            }
            catch (error) {
                logger_1.logger.error('Error processing EPUB upload:', error);
                if (req.file && fs_1.default.existsSync(req.file.path)) {
                    fs_1.default.unlinkSync(req.file.path);
                }
                res.status(500).json({
                    success: false,
                    message: 'Error processing EPUB file',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.extractKanjiFromFile = async (req, res) => {
            try {
                const { filePath } = req.body;
                if (!filePath || !fs_1.default.existsSync(filePath)) {
                    res.status(400).json({
                        success: false,
                        message: 'Invalid file path or file does not exist'
                    });
                    return;
                }
                logger_1.logger.info(`Extracting kanji from existing file: ${filePath}`);
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
            }
            catch (error) {
                logger_1.logger.error('Error extracting kanji from file:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error extracting kanji from file',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getKanjiPageData = async (req, res) => {
            try {
                const { character } = req.params;
                if (!character) {
                    res.status(400).json({
                        success: false,
                        message: 'Character parameter is required'
                    });
                    return;
                }
                const decodedCharacter = decodeURIComponent(character);
                const characterData = await this.epubExtractor.characterService.getCharacterByCharacter(decodedCharacter);
                if (!characterData) {
                    res.status(404).json({
                        success: false,
                        message: 'Character not found'
                    });
                    return;
                }
                const kanjiPageData = this.epubExtractor.generateKanjiPagesData([characterData])[0];
                res.status(200).json({
                    success: true,
                    data: kanjiPageData
                });
            }
            catch (error) {
                logger_1.logger.error('Error getting kanji page data:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving kanji page data',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getAllExtractedKanji = async (req, res) => {
            try {
                const { page = 1, limit = 50, sortBy = 'frequency', sortOrder = 'desc' } = req.query;
                const pageNum = parseInt(page);
                const limitNum = parseInt(limit);
                const offset = (pageNum - 1) * limitNum;
                const charactersResponse = await this.epubExtractor.characterService.getCharacters({
                    page: pageNum,
                    limit: limitNum,
                    sortBy: sortBy,
                    sortOrder: sortOrder
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
            }
            catch (error) {
                logger_1.logger.error('Error getting all extracted kanji:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving kanji data',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.searchKanji = async (req, res) => {
            try {
                const { query, type = 'all' } = req.query;
                if (!query) {
                    res.status(400).json({
                        success: false,
                        message: 'Search query is required'
                    });
                    return;
                }
                const charactersResponse = await this.epubExtractor.characterService.searchCharacters(query, { type: type });
                if (!charactersResponse.success || !charactersResponse.data) {
                    res.status(500).json({
                        success: false,
                        message: 'Error searching characters'
                    });
                    return;
                }
                const characters = charactersResponse.data.data;
                const kanjiCharacters = characters.filter(char => char.type === 'KANJI');
                const kanjiPagesData = this.epubExtractor.generateKanjiPagesData(kanjiCharacters);
                res.status(200).json({
                    success: true,
                    data: {
                        kanji: kanjiPagesData,
                        count: kanjiPagesData.length
                    }
                });
            }
            catch (error) {
                logger_1.logger.error('Error searching kanji:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error searching kanji',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.getExtractionStats = async (req, res) => {
            try {
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
            }
            catch (error) {
                logger_1.logger.error('Error getting extraction stats:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error retrieving extraction statistics',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.epubExtractor = new epub_extractor_service_1.EpubExtractorService();
        const storage = multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'epub');
                if (!fs_1.default.existsSync(uploadDir)) {
                    fs_1.default.mkdirSync(uploadDir, { recursive: true });
                }
                cb(null, uploadDir);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                cb(null, `epub-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
            }
        });
        this.upload = (0, multer_1.default)({
            storage,
            limits: {
                fileSize: 50 * 1024 * 1024,
            },
            fileFilter: (req, file, cb) => {
                if (file.mimetype === 'application/epub+zip' ||
                    file.originalname.toLowerCase().endsWith('.epub')) {
                    cb(null, true);
                }
                else {
                    cb(new Error('Only EPUB files are allowed'));
                }
            }
        });
    }
    getUploadMiddleware() {
        return this.upload.single('epub');
    }
}
exports.EpubController = EpubController;
//# sourceMappingURL=epub.controller.js.map