import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error('Redis reconnection failed after 10 attempts');
            return new Error('Redis reconnection failed');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
      this.isConnected = true;
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      logger.info('Redis client disconnected');
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
    } catch (error) {
      logger.error('Failed to disconnect from Redis:', error);
      throw error;
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      return true;
    } catch (error) {
      logger.error('Redis SET error:', error);
      return false;
    }
  }

  async setex(key: string, ttl: number, value: string): Promise<boolean> {
    try {
      await this.client.setEx(key, ttl, value);
      return true;
    } catch (error) {
      logger.error('Redis SETEX error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logger.error('Redis DEL error:', error);
      return false;
    }
  }

  async delMultiple(keys: string[]): Promise<number> {
    try {
      if (keys.length === 0) return 0;
      const result = await this.client.del(keys);
      return result;
    } catch (error) {
      logger.error('Redis DEL MULTIPLE error:', error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Redis EXISTS error:', error);
      return false;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, seconds);
      return result;
    } catch (error) {
      logger.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      const result = await this.client.hGet(key, field);
      return result || null;
    } catch (error) {
      logger.error('Redis HGET error:', error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.client.hSet(key, field, value);
      return true;
    } catch (error) {
      logger.error('Redis HSET error:', error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hGetAll(key);
    } catch (error) {
      logger.error('Redis HGETALL error:', error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      const result = await this.client.hDel(key, field);
      return result > 0;
    } catch (error) {
      logger.error('Redis HDEL error:', error);
      return false;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lPush(key, values);
    } catch (error) {
      logger.error('Redis LPUSH error:', error);
      return 0;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.rPush(key, values);
    } catch (error) {
      logger.error('Redis RPUSH error:', error);
      return 0;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lPop(key);
    } catch (error) {
      logger.error('Redis LPOP error:', error);
      return null;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rPop(key);
    } catch (error) {
      logger.error('Redis RPOP error:', error);
      return null;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lRange(key, start, stop);
    } catch (error) {
      logger.error('Redis LRANGE error:', error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    try {
      await this.client.lTrim(key, start, stop);
      return true;
    } catch (error) {
      logger.error('Redis LTRIM error:', error);
      return false;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.lLen(key);
    } catch (error) {
      logger.error('Redis LLEN error:', error);
      return 0;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sAdd(key, members);
    } catch (error) {
      logger.error('Redis SADD error:', error);
      return 0;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sRem(key, members);
    } catch (error) {
      logger.error('Redis SREM error:', error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.sMembers(key);
    } catch (error) {
      logger.error('Redis SMEMBERS error:', error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sIsMember(key, member);
      return result;
    } catch (error) {
      logger.error('Redis SISMEMBER error:', error);
      return false;
    }
  }

  async scard(key: string): Promise<number> {
    try {
      return await this.client.sCard(key);
    } catch (error) {
      logger.error('Redis SCARD error:', error);
      return 0;
    }
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.zAdd(key, { score, value: member });
    } catch (error) {
      logger.error('Redis ZADD error:', error);
      return 0;
    }
  }

  async zrem(key: string, member: string): Promise<number> {
    try {
      return await this.client.zRem(key, member);
    } catch (error) {
      logger.error('Redis ZREM error:', error);
      return 0;
    }
  }

  async zrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    try {
      if (withScores) {
        const result = await this.client.zRangeWithScores(key, start, stop);
        return result.map(item => `${item.value}:${item.score}`);
      } else {
        return await this.client.zRange(key, start, stop);
      }
    } catch (error) {
      logger.error('Redis ZRANGE error:', error);
      return [];
    }
  }

  async zrevrange(key: string, start: number, stop: number, withScores: boolean = false): Promise<string[]> {
    try {
      if (withScores) {
        const result = await this.client.zRangeWithScores(key, start, stop, { REV: true });
        return result.map(item => `${item.value}:${item.score}`);
      } else {
        return await this.client.zRange(key, start, stop, { REV: true });
      }
    } catch (error) {
      logger.error('Redis ZREVRANGE error:', error);
      return [];
    }
  }

  async zscore(key: string, member: string): Promise<number | null> {
    try {
      return await this.client.zScore(key, member);
    } catch (error) {
      logger.error('Redis ZSCORE error:', error);
      return null;
    }
  }

  async zcard(key: string): Promise<number> {
    try {
      return await this.client.zCard(key);
    } catch (error) {
      logger.error('Redis ZCARD error:', error);
      return 0;
    }
  }

  // Pattern operations
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      logger.error('Redis KEYS error:', error);
      return [];
    }
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<{ cursor: number; keys: string[] }> {
    try {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: count
      });
      return {
        cursor: result.cursor,
        keys: result.keys
      };
    } catch (error) {
      logger.error('Redis SCAN error:', error);
      return { cursor: 0, keys: [] };
    }
  }

  // Utility methods
  async flushdb(): Promise<boolean> {
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  async flushall(): Promise<boolean> {
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      logger.error('Redis FLUSHALL error:', error);
      return false;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  async info(): Promise<string> {
    try {
      return await this.client.info();
    } catch (error) {
      logger.error('Redis INFO error:', error);
      return '';
    }
  }

  // JSON operations
  async setJson(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(value);
      return await this.set(key, jsonString, ttl);
    } catch (error) {
      logger.error('Redis SET JSON error:', error);
      return false;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      logger.error('Redis GET JSON error:', error);
      return null;
    }
  }

  // Cache operations
  async cacheGet<T>(key: string): Promise<T | null> {
    return await this.getJson<T>(key);
  }

  async cacheSet<T>(key: string, value: T, ttl: number = 3600): Promise<boolean> {
    return await this.setJson(key, value, ttl);
  }

  async cacheDel(key: string): Promise<boolean> {
    return await this.del(key);
  }

  // Session operations
  async setSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    return await this.setJson(`session:${sessionId}`, data, ttl);
  }

  async getSession<T>(sessionId: string): Promise<T | null> {
    return await this.getJson<T>(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    return await this.del(`session:${sessionId}`);
  }

  // Rate limiting
  async rateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      const now = Date.now();
      const windowStart = now - window * 1000;
      
      // Remove old entries
      await this.client.zRemRangeByScore(key, 0, windowStart);
      
      // Count current entries
      const current = await this.client.zCard(key);
      
      if (current >= limit) {
        // Get the oldest entry to calculate reset time
        const oldest = await this.client.zRange(key, 0, 0);
        const resetTime = oldest.length > 0 ? parseInt(oldest[0]) + window * 1000 : now + window * 1000;
        
        return {
          allowed: false,
          remaining: 0,
          resetTime
        };
      }
      
      // Add current request
      await this.client.zAdd(key, { score: now, value: now.toString() });
      await this.client.expire(key, window);
      
      return {
        allowed: true,
        remaining: limit - current - 1,
        resetTime: now + window * 1000
      };
    } catch (error) {
      logger.error('Redis rate limit error:', error);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + window * 1000
      };
    }
  }

  // Health check
  isHealthy(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const redis = new RedisService();
