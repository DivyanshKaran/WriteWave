"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contentCacheService = exports.cacheService = exports.ContentCacheService = exports.CacheService = exports.checkRedisHealth = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("./logger");
let redisClient = null;
const redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || undefined,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger_1.logger.error('Redis connection failed after 10 retries');
                return new Error('Redis connection failed');
            }
            return Math.min(retries * 100, 3000);
        },
    },
};
const connectRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            return redisClient;
        }
        redisClient = (0, redis_1.createClient)(redisConfig);
        redisClient.on('error', (error) => {
            logger_1.logger.error('Redis client error', { error: error.message });
        });
        redisClient.on('connect', () => {
            logger_1.logger.info('Redis client connected');
        });
        redisClient.on('ready', () => {
            logger_1.logger.info('Redis client ready');
        });
        redisClient.on('end', () => {
            logger_1.logger.info('Redis client disconnected');
        });
        await redisClient.connect();
        return redisClient;
    }
    catch (error) {
        if (process.env.OPTIONAL_REDIS === 'true') {
            logger_1.logger.warn('Redis optional: proceeding without Redis', { error: error?.message });
            if (!redisClient) {
                redisClient = (0, redis_1.createClient)(redisConfig);
            }
            return redisClient;
        }
        logger_1.logger.error('Redis connection failed', { error });
        throw error;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    if (!redisClient) {
        redisClient = (0, redis_1.createClient)(redisConfig);
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const disconnectRedis = async () => {
    try {
        if (redisClient && redisClient.isOpen) {
            await redisClient.quit();
            redisClient = null;
            logger_1.logger.info('Redis disconnected successfully');
        }
    }
    catch (error) {
        logger_1.logger.error('Redis disconnection failed', { error });
        throw error;
    }
};
exports.disconnectRedis = disconnectRedis;
const checkRedisHealth = async () => {
    const startTime = Date.now();
    try {
        const client = (0, exports.getRedisClient)();
        await client.ping();
        const responseTime = Date.now() - startTime;
        return {
            status: 'connected',
            responseTime,
        };
    }
    catch (error) {
        logger_1.logger.error('Redis health check failed', { error });
        return {
            status: 'disconnected',
        };
    }
};
exports.checkRedisHealth = checkRedisHealth;
class CacheService {
    constructor() {
        this.client = (0, exports.getRedisClient)();
        this.prefix = process.env.CACHE_PREFIX || 'writewave:content:';
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    async set(key, value, ttlSeconds = 3600) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(this.getKey(key), ttlSeconds, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache set failed', { key, error });
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(this.getKey(key));
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Cache get failed', { key, error });
            return null;
        }
    }
    async del(key) {
        try {
            await this.client.del(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache delete failed', { key, error });
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(this.getKey(key));
            return result === 1;
        }
        catch (error) {
            logger_1.logger.error('Cache exists check failed', { key, error });
            return false;
        }
    }
    async setEx(key, value, ttlSeconds) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(this.getKey(key), ttlSeconds, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache setEx failed', { key, error });
            throw error;
        }
    }
    async ttl(key) {
        try {
            return await this.client.ttl(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache TTL check failed', { key, error });
            return -1;
        }
    }
    async incr(key) {
        try {
            return await this.client.incr(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache increment failed', { key, error });
            throw error;
        }
    }
    async decr(key) {
        try {
            return await this.client.decr(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache decrement failed', { key, error });
            throw error;
        }
    }
    async hSet(key, field, value) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.hSet(this.getKey(key), field, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache hSet failed', { key, field, error });
            throw error;
        }
    }
    async hGet(key, field) {
        try {
            const value = await this.client.hGet(this.getKey(key), field);
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Cache hGet failed', { key, field, error });
            return null;
        }
    }
    async hGetAll(key) {
        try {
            const hash = await this.client.hGetAll(this.getKey(key));
            const result = {};
            for (const [field, value] of Object.entries(hash)) {
                result[field] = JSON.parse(value);
            }
            return result;
        }
        catch (error) {
            logger_1.logger.error('Cache hGetAll failed', { key, error });
            return {};
        }
    }
    async hDel(key, field) {
        try {
            await this.client.hDel(this.getKey(key), field);
        }
        catch (error) {
            logger_1.logger.error('Cache hDel failed', { key, field, error });
            throw error;
        }
    }
    async sAdd(key, ...members) {
        try {
            await this.client.sAdd(this.getKey(key), members);
        }
        catch (error) {
            logger_1.logger.error('Cache sAdd failed', { key, error });
            throw error;
        }
    }
    async sMembers(key) {
        try {
            return await this.client.sMembers(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache sMembers failed', { key, error });
            return [];
        }
    }
    async sRem(key, ...members) {
        try {
            await this.client.sRem(this.getKey(key), members);
        }
        catch (error) {
            logger_1.logger.error('Cache sRem failed', { key, error });
            throw error;
        }
    }
    async sIsMember(key, member) {
        try {
            const result = await this.client.sIsMember(this.getKey(key), member);
            return Boolean(result);
        }
        catch (error) {
            logger_1.logger.error('Cache sIsMember failed', { key, member, error });
            return false;
        }
    }
    async lPush(key, ...values) {
        try {
            const serializedValues = values.map(v => JSON.stringify(v));
            await this.client.lPush(this.getKey(key), serializedValues);
        }
        catch (error) {
            logger_1.logger.error('Cache lPush failed', { key, error });
            throw error;
        }
    }
    async rPop(key) {
        try {
            const value = await this.client.rPop(this.getKey(key));
            if (!value)
                return null;
            return JSON.parse(value);
        }
        catch (error) {
            logger_1.logger.error('Cache rPop failed', { key, error });
            return null;
        }
    }
    async lLen(key) {
        try {
            return await this.client.lLen(this.getKey(key));
        }
        catch (error) {
            logger_1.logger.error('Cache lLen failed', { key, error });
            return 0;
        }
    }
    async lRange(key, start, stop) {
        try {
            const values = await this.client.lRange(this.getKey(key), start, stop);
            return values.map(v => JSON.parse(v));
        }
        catch (error) {
            logger_1.logger.error('Cache lRange failed', { key, error });
            return [];
        }
    }
    async flushAll() {
        try {
            await this.client.flushAll();
        }
        catch (error) {
            logger_1.logger.error('Cache flushAll failed', { error });
            throw error;
        }
    }
    async clearByPattern(pattern) {
        try {
            const keys = await this.client.keys(this.getKey(pattern));
            if (keys.length > 0) {
                await this.client.del(keys);
            }
        }
        catch (error) {
            logger_1.logger.error('Cache clearByPattern failed', { pattern, error });
            throw error;
        }
    }
    async info() {
        try {
            return await this.client.info();
        }
        catch (error) {
            logger_1.logger.error('Cache info failed', { error });
            return '';
        }
    }
}
exports.CacheService = CacheService;
class ContentCacheService extends CacheService {
    async cacheCharacter(characterId, character, ttl = 3600) {
        await this.set(`character:${characterId}`, character, ttl);
    }
    async getCachedCharacter(characterId) {
        return await this.get(`character:${characterId}`);
    }
    async cacheCharactersByType(type, characters, ttl = 1800) {
        await this.set(`characters:type:${type}`, characters, ttl);
    }
    async getCachedCharactersByType(type) {
        return await this.get(`characters:type:${type}`);
    }
    async cacheCharactersByJLPT(level, characters, ttl = 1800) {
        await this.set(`characters:jlpt:${level}`, characters, ttl);
    }
    async getCachedCharactersByJLPT(level) {
        return await this.get(`characters:jlpt:${level}`);
    }
    async cacheVocabulary(vocabularyId, vocabulary, ttl = 3600) {
        await this.set(`vocabulary:${vocabularyId}`, vocabulary, ttl);
    }
    async getCachedVocabulary(vocabularyId) {
        return await this.get(`vocabulary:${vocabularyId}`);
    }
    async cacheVocabularyByCategory(category, vocabulary, ttl = 1800) {
        await this.set(`vocabulary:category:${category}`, vocabulary, ttl);
    }
    async getCachedVocabularyByCategory(category) {
        return await this.get(`vocabulary:category:${category}`);
    }
    async cacheLesson(lessonId, lesson, ttl = 3600) {
        await this.set(`lesson:${lessonId}`, lesson, ttl);
    }
    async getCachedLesson(lessonId) {
        return await this.get(`lesson:${lessonId}`);
    }
    async cacheLessonsByType(type, lessons, ttl = 1800) {
        await this.set(`lessons:type:${type}`, lessons, ttl);
    }
    async getCachedLessonsByType(type) {
        return await this.get(`lessons:type:${type}`);
    }
    async cacheSearchResults(query, results, ttl = 1800) {
        const searchKey = `search:${Buffer.from(query).toString('base64')}`;
        await this.set(searchKey, results, ttl);
    }
    async getCachedSearchResults(query) {
        const searchKey = `search:${Buffer.from(query).toString('base64')}`;
        return await this.get(searchKey);
    }
    async cacheStatistics(stats, ttl = 3600) {
        await this.set('statistics', stats, ttl);
    }
    async getCachedStatistics() {
        return await this.get('statistics');
    }
    async clearCharacterCache(characterId) {
        if (characterId) {
            await this.del(`character:${characterId}`);
        }
        else {
            await this.clearByPattern('character:*');
            await this.clearByPattern('characters:*');
        }
    }
    async clearVocabularyCache(vocabularyId) {
        if (vocabularyId) {
            await this.del(`vocabulary:${vocabularyId}`);
        }
        else {
            await this.clearByPattern('vocabulary:*');
        }
    }
    async clearLessonCache(lessonId) {
        if (lessonId) {
            await this.del(`lesson:${lessonId}`);
        }
        else {
            await this.clearByPattern('lesson:*');
            await this.clearByPattern('lessons:*');
        }
    }
    async clearSearchCache() {
        await this.clearByPattern('search:*');
    }
    async clearAllContentCache() {
        await this.clearByPattern('character:*');
        await this.clearByPattern('characters:*');
        await this.clearByPattern('vocabulary:*');
        await this.clearByPattern('lesson:*');
        await this.clearByPattern('lessons:*');
        await this.clearByPattern('search:*');
        await this.del('statistics');
    }
}
exports.ContentCacheService = ContentCacheService;
exports.cacheService = new CacheService();
exports.contentCacheService = new ContentCacheService();
//# sourceMappingURL=redis.js.map