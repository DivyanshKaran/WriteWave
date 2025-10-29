"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.characterService = exports.CharacterService = void 0;
const database_1 = require("../config/database");
const redis_1 = require("../config/redis");
const logger_1 = require("../config/logger");
class CharacterService {
    async getCharacters(pagination = {}, filters = {}) {
        try {
            const { page = 1, limit = 20, sortBy = 'learningOrder', sortOrder = 'asc' } = pagination;
            const skip = (page - 1) * limit;
            const where = {
                isActive: true,
            };
            if (filters.type) {
                where.type = filters.type;
            }
            if (filters.jlptLevel) {
                where.jlptLevel = filters.jlptLevel;
            }
            if (filters.difficultyLevel) {
                where.difficultyLevel = filters.difficultyLevel;
            }
            const [characters, total] = await Promise.all([
                database_1.prisma.character.findMany({
                    where,
                    include: {
                        mediaAssets: true,
                        characterRelations: {
                            include: {
                                relatedCharacter: true,
                            },
                        },
                    },
                    orderBy: { [sortBy]: sortOrder },
                    skip,
                    take: limit,
                }),
                database_1.prisma.character.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            (0, logger_1.characterLogger)('characters_retrieved', undefined, {
                count: characters.length,
                total,
                page,
                limit,
                filters,
            });
            return {
                success: true,
                data: {
                    data: characters,
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
                message: 'Characters retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get characters failed', { error: error.message, pagination, filters });
            return {
                success: false,
                error: 'Get characters failed',
                message: 'An error occurred while retrieving characters'
            };
        }
    }
    async getCharacterById(characterId) {
        try {
            const cachedCharacter = await redis_1.contentCacheService.getCachedCharacter(characterId);
            if (cachedCharacter) {
                return {
                    success: true,
                    data: cachedCharacter,
                    message: 'Character retrieved successfully'
                };
            }
            const character = await database_1.prisma.character.findUnique({
                where: { id: characterId },
                include: {
                    mediaAssets: true,
                    characterRelations: {
                        include: {
                            relatedCharacter: true,
                        },
                    },
                },
            });
            if (!character) {
                return {
                    success: false,
                    error: 'Character not found',
                    message: 'Character not found'
                };
            }
            await redis_1.contentCacheService.cacheCharacter(characterId, character);
            (0, logger_1.characterLogger)('character_retrieved', characterId, {
                character: character.character,
                type: character.type,
            });
            return {
                success: true,
                data: character,
                message: 'Character retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get character by ID failed', { error: error.message, characterId });
            return {
                success: false,
                error: 'Get character failed',
                message: 'An error occurred while retrieving character'
            };
        }
    }
    async getCharactersByType(type, pagination = {}) {
        try {
            const cacheKey = `${type}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedCharacters = await redis_1.contentCacheService.get(`characters:type:${cacheKey}`);
            if (cachedCharacters) {
                return {
                    success: true,
                    data: cachedCharacters,
                    message: 'Characters retrieved successfully'
                };
            }
            const result = await this.getCharacters(pagination, { type });
            if (result.success) {
                await redis_1.contentCacheService.set(`characters:type:${cacheKey}`, result.data, 1800);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get characters by type failed', { error: error.message, type, pagination });
            return {
                success: false,
                error: 'Get characters by type failed',
                message: 'An error occurred while retrieving characters by type'
            };
        }
    }
    async getCharactersByJLPTLevel(level, pagination = {}) {
        try {
            const cacheKey = `${level}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedCharacters = await redis_1.contentCacheService.get(`characters:jlpt:${cacheKey}`);
            if (cachedCharacters) {
                return {
                    success: true,
                    data: cachedCharacters,
                    message: 'Characters retrieved successfully'
                };
            }
            const result = await this.getCharacters(pagination, { jlptLevel: level });
            if (result.success) {
                await redis_1.contentCacheService.set(`characters:jlpt:${cacheKey}`, result.data, 1800);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get characters by JLPT level failed', { error: error.message, level, pagination });
            return {
                success: false,
                error: 'Get characters by JLPT level failed',
                message: 'An error occurred while retrieving characters by JLPT level'
            };
        }
    }
    async getHiraganaCharacters(pagination = {}) {
        return this.getCharactersByType('HIRAGANA', pagination);
    }
    async getKatakanaCharacters(pagination = {}) {
        return this.getCharactersByType('KATAKANA', pagination);
    }
    async getKanjiCharacters(level, pagination = {}) {
        return this.getCharactersByJLPTLevel(level, pagination);
    }
    async getCharacterStrokeOrder(characterId) {
        try {
            const character = await database_1.prisma.character.findUnique({
                where: { id: characterId },
                select: {
                    id: true,
                    character: true,
                    strokeOrder: true,
                    strokePatterns: true,
                    strokeCount: true,
                },
            });
            if (!character) {
                return {
                    success: false,
                    error: 'Character not found',
                    message: 'Character not found'
                };
            }
            const strokeOrderData = {
                strokes: character.strokeOrder || [],
                boundingBox: character.strokePatterns || undefined,
            };
            (0, logger_1.characterLogger)('stroke_order_retrieved', characterId, {
                character: character.character,
                strokeCount: character.strokeCount,
            });
            return {
                success: true,
                data: strokeOrderData,
                message: 'Stroke order retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get character stroke order failed', { error: error.message, characterId });
            return {
                success: false,
                error: 'Get stroke order failed',
                message: 'An error occurred while retrieving stroke order'
            };
        }
    }
    async createCharacter(data) {
        try {
            const existingCharacter = await database_1.prisma.character.findUnique({
                where: { character: data.character },
            });
            if (existingCharacter) {
                return {
                    success: false,
                    error: 'Character already exists',
                    message: 'Character with this text already exists'
                };
            }
            const character = await database_1.prisma.character.create({
                data: {
                    character: data.character,
                    type: data.type,
                    jlptLevel: data.jlptLevel,
                    difficultyLevel: data.difficultyLevel || 'BEGINNER',
                    meaning: data.meaning,
                    pronunciation: data.pronunciation,
                    romanization: data.romanization,
                    strokeCount: data.strokeCount,
                    strokeOrder: data.strokeOrder,
                    strokePatterns: data.strokePatterns,
                    kunyomi: data.kunyomi || [],
                    onyomi: data.onyomi || [],
                    radical: data.radical,
                    radicalMeaning: data.radicalMeaning,
                    examples: data.examples,
                    usageNotes: data.usageNotes,
                    learningOrder: data.learningOrder,
                },
                include: {
                    mediaAssets: true,
                    characterRelations: {
                        include: {
                            relatedCharacter: true,
                        },
                    },
                },
            });
            await redis_1.contentCacheService.clearCharacterCache();
            (0, logger_1.characterLogger)('character_created', character.id, {
                character: character.character,
                type: character.type,
            });
            return {
                success: true,
                data: character,
                message: 'Character created successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Create character failed', { error: error.message, data });
            return {
                success: false,
                error: 'Create character failed',
                message: 'An error occurred while creating character'
            };
        }
    }
    async updateCharacter(characterId, data) {
        try {
            const character = await database_1.prisma.character.update({
                where: { id: characterId },
                data: {
                    ...data,
                    updatedAt: new Date(),
                },
                include: {
                    mediaAssets: true,
                    characterRelations: {
                        include: {
                            relatedCharacter: true,
                        },
                    },
                },
            });
            await redis_1.contentCacheService.clearCharacterCache(characterId);
            (0, logger_1.characterLogger)('character_updated', characterId, {
                character: character.character,
                type: character.type,
            });
            return {
                success: true,
                data: character,
                message: 'Character updated successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Update character failed', { error: error.message, characterId, data });
            return {
                success: false,
                error: 'Update character failed',
                message: 'An error occurred while updating character'
            };
        }
    }
    async deleteCharacter(characterId) {
        try {
            await database_1.prisma.character.update({
                where: { id: characterId },
                data: { isActive: false },
            });
            await redis_1.contentCacheService.clearCharacterCache(characterId);
            (0, logger_1.characterLogger)('character_deleted', characterId);
            return {
                success: true,
                message: 'Character deleted successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Delete character failed', { error: error.message, characterId });
            return {
                success: false,
                error: 'Delete character failed',
                message: 'An error occurred while deleting character'
            };
        }
    }
    async searchCharacters(query, filters = {}, pagination = {}) {
        try {
            const cacheKey = `search_${Buffer.from(query).toString('base64')}_${JSON.stringify(filters)}_${pagination.page || 1}_${pagination.limit || 20}`;
            const cachedResults = await redis_1.contentCacheService.getCachedSearchResults(cacheKey);
            if (cachedResults) {
                const { page = 1, limit = 20 } = pagination;
                const total = cachedResults.length;
                const totalPages = Math.ceil(total / limit);
                return {
                    success: true,
                    data: {
                        data: cachedResults,
                        total,
                        page,
                        limit,
                        totalPages,
                        hasNext: page < totalPages,
                        hasPrev: page > 1,
                    },
                    message: 'Search results retrieved successfully'
                };
            }
            const { page = 1, limit = 20 } = pagination;
            const result = await database_1.prisma.$transaction(async (tx) => {
                return await tx.character.findMany({
                    where: {
                        isActive: true,
                        ...filters,
                        OR: [
                            { character: { contains: query, mode: 'insensitive' } },
                            { meaning: { contains: query, mode: 'insensitive' } },
                            { pronunciation: { contains: query, mode: 'insensitive' } },
                            { romanization: { contains: query, mode: 'insensitive' } },
                        ],
                    },
                    include: {
                        mediaAssets: true,
                        characterRelations: {
                            include: {
                                relatedCharacter: true,
                            },
                        },
                    },
                    orderBy: { learningOrder: 'asc' },
                    skip: (page - 1) * limit,
                    take: limit,
                });
            });
            const total = await database_1.prisma.character.count({
                where: {
                    isActive: true,
                    ...filters,
                    OR: [
                        { character: { contains: query, mode: 'insensitive' } },
                        { meaning: { contains: query, mode: 'insensitive' } },
                        { pronunciation: { contains: query, mode: 'insensitive' } },
                        { romanization: { contains: query, mode: 'insensitive' } },
                    ],
                },
            });
            const totalPages = Math.ceil(total / limit);
            const searchResults = {
                data: result,
                total,
                page,
                limit,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            };
            await redis_1.contentCacheService.cacheSearchResults(cacheKey, result);
            (0, logger_1.characterLogger)('characters_searched', undefined, {
                query,
                results: result.length,
                total,
                filters,
            });
            return {
                success: true,
                data: searchResults,
                message: 'Search results retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Search characters failed', { error: error.message, query, filters, pagination });
            return {
                success: false,
                error: 'Search characters failed',
                message: 'An error occurred while searching characters'
            };
        }
    }
    async getCharacterStatistics() {
        try {
            const stats = await database_1.prisma.character.groupBy({
                by: ['type', 'jlptLevel', 'difficultyLevel'],
                where: { isActive: true },
                _count: { id: true },
            });
            const total = await database_1.prisma.character.count({
                where: { isActive: true },
            });
            return {
                success: true,
                data: {
                    total,
                    byType: stats.reduce((acc, stat) => {
                        acc[stat.type] = (acc[stat.type] || 0) + stat._count.id;
                        return acc;
                    }, {}),
                    byJLPTLevel: stats.reduce((acc, stat) => {
                        if (stat.jlptLevel) {
                            acc[stat.jlptLevel] = (acc[stat.jlptLevel] || 0) + stat._count.id;
                        }
                        return acc;
                    }, {}),
                    byDifficulty: stats.reduce((acc, stat) => {
                        acc[stat.difficultyLevel] = (acc[stat.difficultyLevel] || 0) + stat._count.id;
                        return acc;
                    }, {}),
                },
                message: 'Character statistics retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get character statistics failed', { error: error.message });
            return {
                success: false,
                error: 'Get statistics failed',
                message: 'An error occurred while retrieving character statistics'
            };
        }
    }
    async getCharacterRelationships(characterId) {
        try {
            const relationships = await database_1.prisma.characterRelation.findMany({
                where: {
                    OR: [
                        { characterId },
                        { relatedCharacterId: characterId },
                    ],
                },
                include: {
                    character: true,
                    relatedCharacter: true,
                },
            });
            return {
                success: true,
                data: relationships,
                message: 'Character relationships retrieved successfully'
            };
        }
        catch (error) {
            logger_1.logger.error('Get character relationships failed', { error: error.message, characterId });
            return {
                success: false,
                error: 'Get relationships failed',
                message: 'An error occurred while retrieving character relationships'
            };
        }
    }
    async getCharacterByCharacter(character) {
        try {
            const result = await database_1.prisma.character.findUnique({
                where: { character },
                include: {
                    mediaAssets: true,
                    characterRelations: {
                        include: {
                            relatedCharacter: true,
                        },
                    },
                },
            });
            return result;
        }
        catch (error) {
            logger_1.logger.error('Get character by character failed', { error: error.message, character });
            return null;
        }
    }
    async getCharacterStats() {
        try {
            const stats = await database_1.prisma.$transaction(async (tx) => {
                const totalCharacters = await tx.character.count({
                    where: { isActive: true }
                });
                const totalKanji = await tx.character.count({
                    where: {
                        isActive: true,
                        type: 'KANJI'
                    }
                });
                const kanjiByLevel = await tx.character.groupBy({
                    by: ['jlptLevel'],
                    where: {
                        isActive: true,
                        type: 'KANJI',
                        jlptLevel: { not: null }
                    },
                    _count: {
                        id: true
                    }
                });
                const recentExtractions = await tx.character.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        character: true,
                        type: true,
                        createdAt: true
                    }
                });
                return {
                    totalCharacters,
                    totalKanji,
                    kanjiByLevel: kanjiByLevel.reduce((acc, item) => {
                        acc[item.jlptLevel || 'Unknown'] = item._count.id;
                        return acc;
                    }, {}),
                    recentExtractions
                };
            });
            return stats;
        }
        catch (error) {
            logger_1.logger.error('Get character stats failed', { error: error.message });
            return {
                totalCharacters: 0,
                totalKanji: 0,
                kanjiByLevel: {},
                recentExtractions: []
            };
        }
    }
}
exports.CharacterService = CharacterService;
exports.characterService = new CharacterService();
exports.default = exports.characterService;
//# sourceMappingURL=character.service.js.map