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
    if (process.env.OPTIONAL_REDIS === 'true') {
      logger.warn('Redis optional: proceeding without Redis', { error: (error as any)?.message });
      // Return a client instance without connecting to avoid null access
      if (!redisClient) {
        redisClient = createClient(redisConfig);
      }
      return redisClient;
    }
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

  constructor() {
    this.client = getRedisClient();
  }

  // Set cache with TTL
  async set(
    key: string,
    value: any,
    ttlSeconds: number = 3600
  ): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serializedValue);
    } catch (error) {
      logger.error('Cache set failed', { key, error });
      throw error;
    }
  }

  // Get cache
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
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
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete failed', { key, error });
      throw error;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
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
      await this.client.setEx(key, ttlSeconds, serializedValue);
    } catch (error) {
      logger.error('Cache setEx failed', { key, error });
      throw error;
    }
  }

  // Get TTL
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Cache TTL check failed', { key, error });
      return -1;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Cache increment failed', { key, error });
      throw error;
    }
  }

  // Decrement counter
  async decr(key: string): Promise<number> {
    try {
      return await this.client.decr(key);
    } catch (error) {
      logger.error('Cache decrement failed', { key, error });
      throw error;
    }
  }

  // Set hash field
  async hSet(key: string, field: string, value: any): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value);
      await this.client.hSet(key, field, serializedValue);
    } catch (error) {
      logger.error('Cache hSet failed', { key, field, error });
      throw error;
    }
  }

  // Get hash field
  async hGet<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.client.hGet(key, field);
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
      const hash = await this.client.hGetAll(key);
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
      await this.client.hDel(key, field);
    } catch (error) {
      logger.error('Cache hDel failed', { key, field, error });
      throw error;
    }
  }

  // Add to set
  async sAdd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sAdd(key, members);
    } catch (error) {
      logger.error('Cache sAdd failed', { key, error });
      throw error;
    }
  }

  // Get set members
  async sMembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Cache sMembers failed', { key, error });
      return [];
    }
  }

  // Remove from set
  async sRem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sRem(key, members);
    } catch (error) {
      logger.error('Cache sRem failed', { key, error });
      throw error;
    }
  }

  // Check if member exists in set
  async sIsMember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sIsMember(key, member);
      return Boolean(result);
    } catch (error) {
      logger.error('Cache sIsMember failed', { key, member, error });
      return false;
    }
  }

  // Push to list
  async lPush(key: string, ...values: any[]): Promise<void> {
    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      await this.client.lPush(key, serializedValues);
    } catch (error) {
      logger.error('Cache lPush failed', { key, error });
      throw error;
    }
  }

  // Pop from list
  async rPop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.rPop(key);
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
      return await this.client.lLen(key);
    } catch (error) {
      logger.error('Cache lLen failed', { key, error });
      return 0;
    }
  }

  // Get list range
  async lRange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.client.lRange(key, start, stop);
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

// Export cache service instance (lazy initialization)
let _cacheService: CacheService | null = null;
export const getCacheService = (): CacheService => {
  if (!_cacheService) {
    _cacheService = new CacheService();
  }
  return _cacheService;
};

// Session management with Redis
export class SessionService {
  private client: RedisClientType;

  constructor() {
    this.client = getRedisClient();
  }

  // Create session
  async createSession(
    userId: string,
    sessionData: any,
    ttlSeconds: number = 86400 // 24 hours
  ): Promise<string> {
    try {
      const sessionId = `session:${userId}:${Date.now()}`;
      await this.client.setEx(sessionId, ttlSeconds, JSON.stringify(sessionData));
      return sessionId;
    } catch (error) {
      logger.error('Session creation failed', { userId, error });
      throw error;
    }
  }

  // Get session
  async getSession<T>(sessionId: string): Promise<T | null> {
    try {
      const sessionData = await this.client.get(sessionId);
      if (!sessionData) return null;
      return JSON.parse(sessionData) as T;
    } catch (error) {
      logger.error('Session retrieval failed', { sessionId, error });
      return null;
    }
  }

  // Update session
  async updateSession(
    sessionId: string,
    sessionData: any,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(sessionId, ttlSeconds, JSON.stringify(sessionData));
      } else {
        await this.client.set(sessionId, JSON.stringify(sessionData));
      }
    } catch (error) {
      logger.error('Session update failed', { sessionId, error });
      throw error;
    }
  }

  // Delete session
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await this.client.del(sessionId);
    } catch (error) {
      logger.error('Session deletion failed', { sessionId, error });
      throw error;
    }
  }

  // Extend session TTL
  async extendSession(sessionId: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.expire(sessionId, ttlSeconds);
    } catch (error) {
      logger.error('Session extension failed', { sessionId, error });
      throw error;
    }
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<string[]> {
    try {
      const pattern = `session:${userId}:*`;
      const keys = await this.client.keys(pattern);
      return keys;
    } catch (error) {
      logger.error('Get user sessions failed', { userId, error });
      return [];
    }
  }

  // Delete user sessions
  async deleteUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserSessions(userId);
      if (sessions.length > 0) {
        await this.client.del(sessions);
      }
    } catch (error) {
      logger.error('Delete user sessions failed', { userId, error });
      throw error;
    }
  }
}

// Export session service instance (lazy initialization)
let _sessionService: SessionService | null = null;
export const getSessionService = (): SessionService => {
  if (!_sessionService) {
    _sessionService = new SessionService();
  }
  return _sessionService;
};
