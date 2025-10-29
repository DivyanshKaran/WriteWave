import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

// Redis client instance
let redisClient: RedisClientType;

// Initialize Redis client
export const initializeRedis = (): RedisClientType => {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    // Redis event listeners
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error', { error: error.message });
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  return redisClient;
};

// Get Redis client instance
export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
};

// Connect to Redis
export const connectRedis = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.connect();
    logger.info('Redis connected successfully');
  } catch (error) {
    if (process.env.OPTIONAL_REDIS === 'true') {
      logger.warn('Redis optional: proceeding without Redis', { error: (error as any)?.message });
      return;
    }
    logger.error('Failed to connect to Redis', { error: (error as any)?.message });
    throw error;
  }
};

// Disconnect from Redis
export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.disconnect();
      logger.info('Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('Failed to disconnect from Redis', { error: error.message });
    throw error;
  }
};

// Health check for Redis
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    logger.error('Redis health check failed', { error: error.message });
    return false;
  }
};

// Cache helper functions
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Cache get error', { key, error: error.message });
    return null;
  }
};

export const cacheSet = async <T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    logger.error('Cache set error', { key, error: error.message });
    return false;
  }
};

export const cacheDel = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    logger.error('Cache delete error', { key, error: error.message });
    return false;
  }
};

export const cacheExists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Cache exists error', { key, error: error.message });
    return false;
  }
};

export const cacheIncr = async (key: string, ttl?: number): Promise<number> => {
  try {
    const client = getRedisClient();
    const value = await client.incr(key);
    if (ttl) {
      await client.expire(key, ttl);
    }
    return value;
  } catch (error) {
    logger.error('Cache increment error', { key, error: error.message });
    return 0;
  }
};

export const cacheDecr = async (key: string, ttl?: number): Promise<number> => {
  try {
    const client = getRedisClient();
    const value = await client.decr(key);
    if (ttl) {
      await client.expire(key, ttl);
    }
    return value;
  } catch (error) {
    logger.error('Cache decrement error', { key, error: error.message });
    return 0;
  }
};

// Hash operations
export const cacheHGet = async (key: string, field: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.hGet(key, field);
  } catch (error) {
    logger.error('Cache hash get error', { key, field, error: error.message });
    return null;
  }
};

export const cacheHSet = async (key: string, field: string, value: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    await client.hSet(key, field, value);
    return true;
  } catch (error) {
    logger.error('Cache hash set error', { key, field, error: error.message });
    return false;
  }
};

export const cacheHGetAll = async (key: string): Promise<Record<string, string> | null> => {
  try {
    const client = getRedisClient();
    return await client.hGetAll(key);
  } catch (error) {
    logger.error('Cache hash get all error', { key, error: error.message });
    return null;
  }
};

// List operations
export const cacheLPush = async (key: string, ...values: string[]): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.lPush(key, values);
  } catch (error) {
    logger.error('Cache list push error', { key, error: error.message });
    return 0;
  }
};

export const cacheRPush = async (key: string, ...values: string[]): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.rPush(key, values);
  } catch (error) {
    logger.error('Cache list push error', { key, error: error.message });
    return 0;
  }
};

export const cacheLPop = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.lPop(key);
  } catch (error) {
    logger.error('Cache list pop error', { key, error: error.message });
    return null;
  }
};

export const cacheRPop = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.rPop(key);
  } catch (error) {
    logger.error('Cache list pop error', { key, error: error.message });
    return null;
  }
};

// Set operations
export const cacheSAdd = async (key: string, ...members: string[]): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.sAdd(key, members);
  } catch (error) {
    logger.error('Cache set add error', { key, error: error.message });
    return 0;
  }
};

export const cacheSRem = async (key: string, ...members: string[]): Promise<number> => {
  try {
    const client = getRedisClient();
    return await client.sRem(key, members);
  } catch (error) {
    logger.error('Cache set remove error', { key, error: error.message });
    return 0;
  }
};

export const cacheSMembers = async (key: string): Promise<string[]> => {
  try {
    const client = getRedisClient();
    return await client.sMembers(key);
  } catch (error) {
    logger.error('Cache set members error', { key, error: error.message });
    return [];
  }
};

export const cacheSIsMember = async (key: string, member: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    return await client.sIsMember(key, member);
  } catch (error) {
    logger.error('Cache set is member error', { key, member, error: error.message });
    return false;
  }
};

// Export default Redis client
export default getRedisClient();
