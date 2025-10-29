"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterController = exports.CharacterController = void 0;
const character_service_1 = require("../services/character.service");
const logger_1 = require("../config/logger");
class CharacterController {
    async getCharacters(req, res) {
        try {
            const { page, limit, sortBy, sortOrder, type, jlptLevel, difficultyLevel } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'learningOrder',
                sortOrder: sortOrder || 'asc',
            };
            const filters = {
                type: type,
                jlptLevel: jlptLevel,
                difficultyLevel: difficultyLevel,
            };
            const result = await character_service_1.characterService.getCharacters(pagination, filters);
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
            logger_1.logger.error('Get characters controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getCharacterById(req, res) {
        try {
            const { characterId } = req.params;
            if (!characterId) {
                res.status(400).json({
                    success: false,
                    message: 'Character ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await character_service_1.characterService.getCharacterById(characterId);
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
            logger_1.logger.error('Get character by ID controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getHiraganaCharacters(req, res) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'learningOrder',
                sortOrder: sortOrder || 'asc',
            };
            const result = await character_service_1.characterService.getHiraganaCharacters(pagination);
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
            logger_1.logger.error('Get Hiragana characters controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getKatakanaCharacters(req, res) {
        try {
            const { page, limit, sortBy, sortOrder } = req.query;
            const pagination = {
                page: page ? parseInt(page, 10) : 1,
                limit: limit ? parseInt(limit, 10) : 20,
                sortBy: sortBy || 'learningOrder',
                sortOrder: sortOrder || 'asc',
            };
            const result = await character_service_1.characterService.getKatakanaCharacters(pagination);
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
            logger_1.logger.error('Get Katakana characters controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getKanjiCharacters(req, res) {
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
                sortBy: sortBy || 'learningOrder',
                sortOrder: sortOrder || 'asc',
            };
            const result = await character_service_1.characterService.getKanjiCharacters(level, pagination);
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
            logger_1.logger.error('Get Kanji characters controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getCharacterStrokeOrder(req, res) {
        try {
            const { characterId } = req.params;
            if (!characterId) {
                res.status(400).json({
                    success: false,
                    message: 'Character ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await character_service_1.characterService.getCharacterStrokeOrder(characterId);
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
            logger_1.logger.error('Get character stroke order controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async searchCharacters(req, res) {
        try {
            const { q: query, type, jlptLevel, difficultyLevel, page, limit } = req.query;
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
                type: type,
                jlptLevel: jlptLevel,
                difficultyLevel: difficultyLevel,
            };
            const result = await character_service_1.characterService.searchCharacters(query, filters, pagination);
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
            logger_1.logger.error('Search characters controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getCharacterStatistics(req, res) {
        try {
            const result = await character_service_1.characterService.getCharacterStatistics();
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
            logger_1.logger.error('Get character statistics controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async getCharacterRelationships(req, res) {
        try {
            const { characterId } = req.params;
            if (!characterId) {
                res.status(400).json({
                    success: false,
                    message: 'Character ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await character_service_1.characterService.getCharacterRelationships(characterId);
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
            logger_1.logger.error('Get character relationships controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async createCharacter(req, res) {
        try {
            const result = await character_service_1.characterService.createCharacter(req.body);
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
            logger_1.logger.error('Create character controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async updateCharacter(req, res) {
        try {
            const { characterId } = req.params;
            if (!characterId) {
                res.status(400).json({
                    success: false,
                    message: 'Character ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await character_service_1.characterService.updateCharacter(characterId, req.body);
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
            logger_1.logger.error('Update character controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
    async deleteCharacter(req, res) {
        try {
            const { characterId } = req.params;
            if (!characterId) {
                res.status(400).json({
                    success: false,
                    message: 'Character ID is required',
                    error: 'VALIDATION_ERROR',
                    timestamp: new Date().toISOString(),
                });
                return;
            }
            const result = await character_service_1.characterService.deleteCharacter(characterId);
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
            logger_1.logger.error('Delete character controller error', { error: error.message });
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: 'INTERNAL_ERROR',
                timestamp: new Date().toISOString(),
            });
        }
    }
}
exports.CharacterController = CharacterController;
exports.characterController = new CharacterController();
exports.default = exports.characterController;
//# sourceMappingURL=character.controller.js.map