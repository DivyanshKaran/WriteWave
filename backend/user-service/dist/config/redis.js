"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionService = exports.SessionService = exports.getCacheService = exports.CacheService = exports.checkRedisHealth = exports.disconnectRedis = exports.getRedisClient = exports.connectRedis = void 0;
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
    if (!redisClient || !redisClient.isOpen) {
        throw new Error('Redis client not connected');
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
    }
    async set(key, value, ttlSeconds = 3600) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.setEx(key, ttlSeconds, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache set failed', { key, error });
            throw error;
        }
    }
    async get(key) {
        try {
            const value = await this.client.get(key);
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
            await this.client.del(key);
        }
        catch (error) {
            logger_1.logger.error('Cache delete failed', { key, error });
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
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
            await this.client.setEx(key, ttlSeconds, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache setEx failed', { key, error });
            throw error;
        }
    }
    async ttl(key) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            logger_1.logger.error('Cache TTL check failed', { key, error });
            return -1;
        }
    }
    async incr(key) {
        try {
            return await this.client.incr(key);
        }
        catch (error) {
            logger_1.logger.error('Cache increment failed', { key, error });
            throw error;
        }
    }
    async decr(key) {
        try {
            return await this.client.decr(key);
        }
        catch (error) {
            logger_1.logger.error('Cache decrement failed', { key, error });
            throw error;
        }
    }
    async hSet(key, field, value) {
        try {
            const serializedValue = JSON.stringify(value);
            await this.client.hSet(key, field, serializedValue);
        }
        catch (error) {
            logger_1.logger.error('Cache hSet failed', { key, field, error });
            throw error;
        }
    }
    async hGet(key, field) {
        try {
            const value = await this.client.hGet(key, field);
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
            const hash = await this.client.hGetAll(key);
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
            await this.client.hDel(key, field);
        }
        catch (error) {
            logger_1.logger.error('Cache hDel failed', { key, field, error });
            throw error;
        }
    }
    async sAdd(key, ...members) {
        try {
            await this.client.sAdd(key, members);
        }
        catch (error) {
            logger_1.logger.error('Cache sAdd failed', { key, error });
            throw error;
        }
    }
    async sMembers(key) {
        try {
            return await this.client.sMembers(key);
        }
        catch (error) {
            logger_1.logger.error('Cache sMembers failed', { key, error });
            return [];
        }
    }
    async sRem(key, ...members) {
        try {
            await this.client.sRem(key, members);
        }
        catch (error) {
            logger_1.logger.error('Cache sRem failed', { key, error });
            throw error;
        }
    }
    async sIsMember(key, member) {
        try {
            const result = await this.client.sIsMember(key, member);
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
            await this.client.lPush(key, serializedValues);
        }
        catch (error) {
            logger_1.logger.error('Cache lPush failed', { key, error });
            throw error;
        }
    }
    async rPop(key) {
        try {
            const value = await this.client.rPop(key);
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
            return await this.client.lLen(key);
        }
        catch (error) {
            logger_1.logger.error('Cache lLen failed', { key, error });
            return 0;
        }
    }
    async lRange(key, start, stop) {
        try {
            const values = await this.client.lRange(key, start, stop);
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
let _cacheService = null;
const getCacheService = () => {
    if (!_cacheService) {
        _cacheService = new CacheService();
    }
    return _cacheService;
};
exports.getCacheService = getCacheService;
class SessionService {
    constructor() {
        this.client = (0, exports.getRedisClient)();
    }
    async createSession(userId, sessionData, ttlSeconds = 86400) {
        try {
            const sessionId = `session:${userId}:${Date.now()}`;
            await this.client.setEx(sessionId, ttlSeconds, JSON.stringify(sessionData));
            return sessionId;
        }
        catch (error) {
            logger_1.logger.error('Session creation failed', { userId, error });
            throw error;
        }
    }
    async getSession(sessionId) {
        try {
            const sessionData = await this.client.get(sessionId);
            if (!sessionData)
                return null;
            return JSON.parse(sessionData);
        }
        catch (error) {
            logger_1.logger.error('Session retrieval failed', { sessionId, error });
            return null;
        }
    }
    async updateSession(sessionId, sessionData, ttlSeconds) {
        try {
            if (ttlSeconds) {
                await this.client.setEx(sessionId, ttlSeconds, JSON.stringify(sessionData));
            }
            else {
                await this.client.set(sessionId, JSON.stringify(sessionData));
            }
        }
        catch (error) {
            logger_1.logger.error('Session update failed', { sessionId, error });
            throw error;
        }
    }
    async deleteSession(sessionId) {
        try {
            await this.client.del(sessionId);
        }
        catch (error) {
            logger_1.logger.error('Session deletion failed', { sessionId, error });
            throw error;
        }
    }
    async extendSession(sessionId, ttlSeconds) {
        try {
            await this.client.expire(sessionId, ttlSeconds);
        }
        catch (error) {
            logger_1.logger.error('Session extension failed', { sessionId, error });
            throw error;
        }
    }
    async getUserSessions(userId) {
        try {
            const pattern = `session:${userId}:*`;
            const keys = await this.client.keys(pattern);
            return keys;
        }
        catch (error) {
            logger_1.logger.error('Get user sessions failed', { userId, error });
            return [];
        }
    }
    async deleteUserSessions(userId) {
        try {
            const sessions = await this.getUserSessions(userId);
            if (sessions.length > 0) {
                await this.client.del(sessions);
            }
        }
        catch (error) {
            logger_1.logger.error('Delete user sessions failed', { userId, error });
            throw error;
        }
    }
}
exports.SessionService = SessionService;
let _sessionService = null;
const getSessionService = () => {
    if (!_sessionService) {
        _sessionService = new SessionService();
    }
    return _sessionService;
};
exports.getSessionService = getSessionService;
//# sourceMappingURL=redis.js.map