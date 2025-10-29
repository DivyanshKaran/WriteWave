"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vocabularyController = exports.VocabularyController = void 0;
const vocabulary_service_1 = require("../services/vocabulary.service");
const logger_1 = require("../config/logger");
class VocabularyController {
    async getVocabularyWords(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, category, jlptLevel, difficultyLevel } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'frequency',
                sortOrder: sortOrder || 'asc',
            };
            const filters = {
                category: category,
                jlptLevel: jlptLevel,
                difficultyLevel: difficultyLevel,
            };
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWords(pagination, filters);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyWordById(req, res) {
        try {
            const { vocabularyId } = req.params;
            if (!vocabularyId) {
                res.status(400).json({
                    success: false,
                    message: 'Vocabulary ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWordById(vocabularyId);
            if (!result.success) {
                res.status(404).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary word by ID controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyWordsByCategory(req, res) {
        try {
            const { category } = req.params;
            const { page, limit, sortBy, sortOrder } = req.query;
            if (!category) {
                res.status(400).json({
                    success: false,
                    message: 'Category is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'frequency',
                sortOrder: sortOrder || 'asc',
            };
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWordsByCategory(category, pagination);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by category controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyWordsByJLPTLevel(req, res) {
        try {
            const { level } = req.params;
            const { page, limit, sortBy, sortOrder } = req.query;
            if (!level || !['N5', 'N4', 'N3', 'N2', 'N1'].includes(level)) {
                res.status(400).json({
                    success: false,
                    message: 'Valid JLPT level is required (N5, N4, N3, N2, N1)',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'frequency',
                sortOrder: sortOrder || 'asc',
            };
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWordsByJLPTLevel(level, pagination);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by JLPT level controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async searchVocabularyWords(req, res) {
        try {
            const { q: query, category, jlptLevel, difficultyLevel, page, limit } = req.query;
            if (!query || typeof query !== 'string') {
                res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            };
            const filters = {
                category: category,
                jlptLevel: jlptLevel,
                difficultyLevel: difficultyLevel,
            };
            const result = await vocabulary_service_1.vocabularyService.searchVocabularyWords(query, filters, pagination);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Search vocabulary words controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyStatistics(req, res) {
        try {
            const result = await vocabulary_service_1.vocabularyService.getVocabularyStatistics();
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary statistics controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyWordsByFrequency(req, res) {
        try {
            const { minFrequency, maxFrequency, page, limit } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            };
            const minFreq = minFrequency ? parseInt(minFrequency, 10) : 1;
            const maxFreq = maxFrequency ? parseInt(maxFrequency, 10) : 10000;
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWordsByFrequency(minFreq, maxFreq, pagination);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by frequency controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getVocabularyWordsByPartOfSpeech(req, res) {
        try {
            const { partOfSpeech } = req.params;
            const { page, limit } = req.query;
            if (!partOfSpeech) {
                res.status(400).json({
                    success: false,
                    message: 'Part of speech is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
            };
            const result = await vocabulary_service_1.vocabularyService.getVocabularyWordsByPartOfSpeech(partOfSpeech, pagination);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get vocabulary words by part of speech controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getRandomVocabularyWords(req, res) {
        try {
            const { count, category, jlptLevel, difficultyLevel } = req.query;
            const countNum = count ? parseInt(count, 10) : 10;
            const filters = {
                category: category,
                jlptLevel: jlptLevel,
                difficultyLevel: difficultyLevel,
            };
            const result = await vocabulary_service_1.vocabularyService.getRandomVocabularyWords(countNum, filters);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Get random vocabulary words controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async createVocabularyWord(req, res) {
        try {
            const result = await vocabulary_service_1.vocabularyService.createVocabularyWord(req.body);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(201).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Create vocabulary word controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateVocabularyWord(req, res) {
        try {
            const { vocabularyId } = req.params;
            if (!vocabularyId) {
                res.status(400).json({
                    success: false,
                    message: 'Vocabulary ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await vocabulary_service_1.vocabularyService.updateVocabularyWord(vocabularyId, req.body);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Update vocabulary word controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteVocabularyWord(req, res) {
        try {
            const { vocabularyId } = req.params;
            if (!vocabularyId) {
                res.status(400).json({
                    success: false,
                    message: 'Vocabulary ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await vocabulary_service_1.vocabularyService.deleteVocabularyWord(vocabularyId);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: result.message,
                    error: result.error,
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: result.message,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            logger_1.logger.error('Delete vocabulary word controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.VocabularyController = VocabularyController;
exports.vocabularyController = new VocabularyController();
exports.default = exports.vocabularyController;
//# sourceMappingURL=vocabulary.controller.js.map