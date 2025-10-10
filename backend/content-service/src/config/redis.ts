import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

// Redis client instance
let redisClient: RedisClientType | null = null;

// Redis connection configuration
const redisConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined,
  socket: {
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        logger.error('Redis connection failed after 10 retries');
        return new Error('Redis connection failed');
      }
      return Math.min(retries * 100, 3000);
    },
  },
};

// Connect to Redis
export const connectRedis = async (): Promise<RedisClientType> => {
  try {
    if (redisClient && redisClient.isOpen) {
      return redisClient;
    }

    redisClient = createClient(redisConfig);

    redisClient.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed', { error });
    throw error;
  }
};

// Get Redis client
export const getRedisClient = (): RedisClientType => {
  if (!redisClient || !redisClient.isOpen) {
    throw new Error('Redis client not connected');
  }
  return redisClient;
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Redis disconnection failed', { error });
    throw error;
  }
};

// Redis health check
export const checkRedisHealth = async (): Promise<{
  status: 'connected' | 'disconnected';
  responseTime?: number;
}> => {
  const startTime = Date.now();
  
  try {
    const client = getRedisClient();
    await client.ping();
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'connected',
      responseTime,
    };
  } catch (error) {
    logger.error('Redis health check failed', { error });
    return {
      status: 'disconnected',
    };
  }
};

// Cache operations
export class CacheService {
  private client: RedisClientType;
  private prefix: string;

  constructor() {
    this.client = getRedisClient();
    this.prefix = process.env.CACHE_PREFIX || 'writewave:content:';
  }

  // Generate cache key
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // Set cache with TTL
  async set(
    key: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(this.getKey(key), ttlSeconds, serializedValue);
    } catch (error) {
      logger.error('Cache set failed', { key, error });
      throw error;
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(this.getKey(key));
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get failed', { key, error });
      return null;
    }
  }

  // Delete cache
  async del(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key));
    } catch (error) {
      logger.error('Cache delete failed', { key, error });
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(this.getKey(key));
      return result === 1;
    } catch (error) {
      logger.error('Cache exists check failed', { key, error });
      return false;
    }
  }

  // Set cache with expiration
  async setEx(
    key: string,
    value: any,
    ttlSeconds: number
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(this.getKey(key), ttlSeconds, serializedValue);
    } catch (error) {
      logger.error('Cache setEx failed', { key, error });
      throw error;
    }
  }

  // Get TTL
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(this.getKey(key));
    } catch (error) {
      logger.error('Cache TTL check failed', { key, error });
      return -1;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(this.getKey(key));
    } catch (error) {
      logger.error('Cache increment failed', { key, error });
      throw error;
    }
  }

  // Decrement counter
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(this.getKey(key));
    } catch (error) {
      logger.error('Cache decrement failed', { key, error });
      throw error;
    }
  }

  // Set hash field
  async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hSet(this.getKey(key), field, serializedValue);
    } catch (error) {
      logger.error('Cache hSet failed', { key, field, error });
      throw error;
    }
  }

  // Get hash field
  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(this.getKey(key), field);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache hGet failed', { key, field, error });
      return null;
    }
  }

  // Get all hash fields
  async hGetAll<T>(key: string): Promise<Record<string, T>> {
    try {
      const hash = await this.client.hGetAll(this.getKey(key));
      const result: Record<string, T> = {};
      
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value) as T;
      }
      
      return result;
    } catch (error) {
      logger.error('Cache hGetAll failed', { key, error });
      return {};
    }
  }

  // Delete hash field
  async hDel(key: string, field: string): Promise<void> {
    try {
      await this.client.hDel(this.getKey(key), field);
    } catch (error) {
      logger.error('Cache hDel failed', { key, field, error });
      throw error;
    }
  }

  // Add to set
  async sAdd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sAdd(this.getKey(key), members);
    } catch (error) {
      logger.error('Cache sAdd failed', { key, error });
      throw error;
    }
  }

  // Get set members
  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(this.getKey(key));
    } catch (error) {
      logger.error('Cache sMembers failed', { key, error });
      return [];
    }
  }

  // Remove from set
  async sRem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sRem(this.getKey(key), members);
    } catch (error) {
      logger.error('Cache sRem failed', { key, error });
      throw error;
    }
  }

  // Check if member exists in set
  async sIsMember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sIsMember(this.getKey(key), member);
      return result === 1;
    } catch (error) {
      logger.error('Cache sIsMember failed', { key, member, error });
      return false;
    }
  }

  // Push to list
  async lPush(key: string, ...values: any[]): Promise<void> {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      await this.client.lPush(this.getKey(key), serializedValues);
    } catch (error) {
      logger.error('Cache lPush failed', { key, error });
      throw error;
    }
  }

  // Pop from list
  async rPop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.rPop(this.getKey(key));
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache rPop failed', { key, error });
      return null;
    }
  }

  // Get list length
  async lLen(key: string): Promise<number> {
    try {
      return await this.client.lLen(this.getKey(key));
    } catch (error) {
      logger.error('Cache lLen failed', { key, error });
      return 0;
    }
  }

  // Get list range
  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.lRange(this.getKey(key), start, stop);
      return values.map(v => JSON.parse(v) as T);
    } catch (error) {
      logger.error('Cache lRange failed', { key, error });
      return [];
    }
  }

  // Clear all cache
  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Cache flushAll failed', { error });
      throw error;
    }
  }

  // Clear cache by pattern
  async clearByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.client.keys(this.getKey(pattern));
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      logger.error('Cache clearByPattern failed', { pattern, error });
      throw error;
    }
  }

  // Get cache info
  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Cache info failed', { error });
      return '';
    }
  }
}

// Content-specific cache operations
export class ContentCacheService extends CacheService {
  // Character cache operations
  async cacheCharacter(characterId: string, character: any, ttl: number = 3600): Promise<void> {
    await this.set(`character:${characterId}`, character, ttl);
  }

  async getCachedCharacter(characterId: string): Promise<any | null> {
    return await this.get(`character:${characterId}`);
  }

  async cacheCharactersByType(type: string, characters: any[], ttl: number = 1800): Promise<void> {
    await this.set(`characters:type:${type}`, characters, ttl);
  }

  async getCachedCharactersByType(type: string): Promise<any[] | null> {
    return await this.get(`characters:type:${type}`);
  }

  async cacheCharactersByJLPT(level: string, characters: any[], ttl: number = 1800): Promise<void> {
    await this.set(`characters:jlpt:${level}`, characters, ttl);
  }

  async getCachedCharactersByJLPT(level: string): Promise<any[] | null> {
    return await this.get(`characters:jlpt:${level}`);
  }

  // Vocabulary cache operations
  async cacheVocabulary(vocabularyId: string, vocabulary: any, ttl: number = 3600): Promise<void> {
    await this.set(`vocabulary:${vocabularyId}`, vocabulary, ttl);
  }

  async getCachedVocabulary(vocabularyId: string): Promise<any | null> {
    return await this.get(`vocabulary:${vocabularyId}`);
  }

  async cacheVocabularyByCategory(category: string, vocabulary: any[], ttl: number = 1800): Promise<void> {
    await this.set(`vocabulary:category:${category}`, vocabulary, ttl);
  }

  async getCachedVocabularyByCategory(category: string): Promise<any[] | null> {
    return await this.get(`vocabulary:category:${category}`);
  }

  // Lesson cache operations
  async cacheLesson(lessonId: string, lesson: any, ttl: number = 3600): Promise<void> {
    await this.set(`lesson:${lessonId}`, lesson, ttl);
  }

  async getCachedLesson(lessonId: string): Promise<any | null> {
    return await this.get(`lesson:${lessonId}`);
  }

  async cacheLessonsByType(type: string, lessons: any[], ttl: number = 1800): Promise<void> {
    await this.set(`lessons:type:${type}`, lessons, ttl);
  }

  async getCachedLessonsByType(type: string): Promise<any[] | null> {
    return await this.get(`lessons:type:${type}`);
  }

  // Search cache operations
  async cacheSearchResults(query: string, results: any[], ttl: number = 1800): Promise<void> {
    const searchKey = `search:${Buffer.from(query).toString('base64')}`;
    await this.set(searchKey, results, ttl);
  }

  async getCachedSearchResults(query: string): Promise<any[] | null> {
    const searchKey = `search:${Buffer.from(query).toString('base64')}`;
    return await this.get(searchKey);
  }

  // Statistics cache operations
  async cacheStatistics(stats: any, ttl: number = 3600): Promise<void> {
    await this.set('statistics', stats, ttl);
  }

  async getCachedStatistics(): Promise<any | null> {
    return await this.get('statistics');
  }

  // Clear content-specific cache
  async clearCharacterCache(characterId?: string): Promise<void> {
    if (characterId) {
      await this.del(`character:${characterId}`);
    } else {
      await this.clearByPattern('character:*');
      await this.clearByPattern('characters:*');
    }
  }

  async clearVocabularyCache(vocabularyId?: string): Promise<void> {
    if (vocabularyId) {
      await this.del(`vocabulary:${vocabularyId}`);
    } else {
      await this.clearByPattern('vocabulary:*');
    }
  }

  async clearLessonCache(lessonId?: string): Promise<void> {
    if (lessonId) {
      await this.del(`lesson:${lessonId}`);
    } else {
      await this.clearByPattern('lesson:*');
      await this.clearByPattern('lessons:*');
    }
  }

  async clearSearchCache(): Promise<void> {
    await this.clearByPattern('search:*');
  }

  async clearAllContentCache(): Promise<void> {
    await this.clearByPattern('character:*');
    await this.clearByPattern('characters:*');
    await this.clearByPattern('vocabulary:*');
    await this.clearByPattern('lesson:*');
    await this.clearByPattern('lessons:*');
    await this.clearByPattern('search:*');
    await this.del('statistics');
  }
}

// Export cache service instances
export const cacheService = new CacheService();
export const contentCacheService = new ContentCacheService();
