import { redis } from '@/utils/redis';
import { logger } from '@/utils/logger';
import { 
  LeaderboardEntry, 
  LeaderboardType, 
  Post, 
  Comment, 
  StudyGroup, 
  User,
  ForumCategory
} from '@/types';

export class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly SHORT_TTL = 300; // 5 minutes
  private readonly LONG_TTL = 86400; // 24 hours

  // Cache keys
  private readonly KEYS = {
    USER: (id: string) => `user:${id}`,
    USER_STATS: (id: string) => `user:${id}:stats`,
    POST: (id: string) => `post:${id}`,
    POST_COMMENTS: (id: string) => `post:${id}:comments`,
    STUDY_GROUP: (id: string) => `group:${id}`,
    STUDY_GROUP_MEMBERS: (id: string) => `group:${id}:members`,
    FORUM_CATEGORIES: 'forum:categories',
    LEADERBOARD: (type: string, period?: string, category?: string) => 
      `leaderboard:${type}:${period || 'all'}:${category || 'all'}`,
    SEARCH_RESULTS: (query: string) => `search:${query}`,
    USER_ACTIVITY: (id: string) => `user:${id}:activity`,
    USER_ACHIEVEMENTS: (id: string) => `user:${id}:achievements`,
    MODERATION_STATS: 'moderation:stats',
    ONLINE_USERS: 'users:online'
  };

  // User caching
  async cacheUser(user: User, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.USER(user.id), user, ttl);
    } catch (error) {
      logger.error('Failed to cache user:', error);
      return false;
    }
  }

  async getCachedUser(userId: string): Promise<User | null> {
    try {
      return await redis.cacheGet<User>(this.KEYS.USER(userId));
    } catch (error) {
      logger.error('Failed to get cached user:', error);
      return null;
    }
  }

  async invalidateUser(userId: string): Promise<boolean> {
    try {
      const keys = [
        this.KEYS.USER(userId),
        this.KEYS.USER_STATS(userId),
        this.KEYS.USER_ACTIVITY(userId),
        this.KEYS.USER_ACHIEVEMENTS(userId)
      ];
      
      for (const key of keys) {
        await redis.del(key);
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to invalidate user cache:', error);
      return false;
    }
  }

  // Post caching
  async cachePost(post: Post, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.POST(post.id), post, ttl);
    } catch (error) {
      logger.error('Failed to cache post:', error);
      return false;
    }
  }

  async getCachedPost(postId: string): Promise<Post | null> {
    try {
      return await redis.cacheGet<Post>(this.KEYS.POST(postId));
    } catch (error) {
      logger.error('Failed to get cached post:', error);
      return null;
    }
  }

  async invalidatePost(postId: string): Promise<boolean> {
    try {
      const keys = [
        this.KEYS.POST(postId),
        this.KEYS.POST_COMMENTS(postId)
      ];
      
      for (const key of keys) {
        await redis.del(key);
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to invalidate post cache:', error);
      return false;
    }
  }

  // Study group caching
  async cacheStudyGroup(group: StudyGroup, ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.STUDY_GROUP(group.id), group, ttl);
    } catch (error) {
      logger.error('Failed to cache study group:', error);
      return false;
    }
  }

  async getCachedStudyGroup(groupId: string): Promise<StudyGroup | null> {
    try {
      return await redis.cacheGet<StudyGroup>(this.KEYS.STUDY_GROUP(groupId));
    } catch (error) {
      logger.error('Failed to get cached study group:', error);
      return null;
    }
  }

  async invalidateStudyGroup(groupId: string): Promise<boolean> {
    try {
      const keys = [
        this.KEYS.STUDY_GROUP(groupId),
        this.KEYS.STUDY_GROUP_MEMBERS(groupId)
      ];
      
      for (const key of keys) {
        await redis.del(key);
      }
      
      return true;
    } catch (error) {
      logger.error('Failed to invalidate study group cache:', error);
      return false;
    }
  }

  // Forum categories caching
  async cacheForumCategories(categories: ForumCategory[], ttl: number = this.LONG_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.FORUM_CATEGORIES, categories, ttl);
    } catch (error) {
      logger.error('Failed to cache forum categories:', error);
      return false;
    }
  }

  async getCachedForumCategories(): Promise<ForumCategory[] | null> {
    try {
      return await redis.cacheGet<ForumCategory[]>(this.KEYS.FORUM_CATEGORIES);
    } catch (error) {
      logger.error('Failed to get cached forum categories:', error);
      return null;
    }
  }

  async invalidateForumCategories(): Promise<boolean> {
    try {
      return await redis.del(this.KEYS.FORUM_CATEGORIES);
    } catch (error) {
      logger.error('Failed to invalidate forum categories cache:', error);
      return false;
    }
  }

  // Leaderboard caching
  async cacheLeaderboard(
    type: LeaderboardType, 
    entries: LeaderboardEntry[], 
    period?: string, 
    category?: string, 
    ttl: number = this.SHORT_TTL
  ): Promise<boolean> {
    try {
      const key = this.KEYS.LEADERBOARD(type, period, category);
      return await redis.cacheSet(key, entries, ttl);
    } catch (error) {
      logger.error('Failed to cache leaderboard:', error);
      return false;
    }
  }

  async getCachedLeaderboard(
    type: LeaderboardType, 
    period?: string, 
    category?: string
  ): Promise<LeaderboardEntry[] | null> {
    try {
      const key = this.KEYS.LEADERBOARD(type, period, category);
      return await redis.cacheGet<LeaderboardEntry[]>(key);
    } catch (error) {
      logger.error('Failed to get cached leaderboard:', error);
      return null;
    }
  }

  async invalidateLeaderboard(type?: LeaderboardType, period?: string, category?: string): Promise<boolean> {
    try {
      if (type) {
        // Invalidate specific leaderboard
        const key = this.KEYS.LEADERBOARD(type, period, category);
        return await redis.del(key);
      } else {
        // Invalidate all leaderboards
        const pattern = 'leaderboard:*';
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
        return true;
      }
    } catch (error) {
      logger.error('Failed to invalidate leaderboard cache:', error);
      return false;
    }
  }

  // Search results caching
  async cacheSearchResults(query: string, results: any, ttl: number = this.SHORT_TTL): Promise<boolean> {
    try {
      const key = this.KEYS.SEARCH_RESULTS(query);
      return await redis.cacheSet(key, results, ttl);
    } catch (error) {
      logger.error('Failed to cache search results:', error);
      return false;
    }
  }

  async getCachedSearchResults(query: string): Promise<any | null> {
    try {
      const key = this.KEYS.SEARCH_RESULTS(query);
      return await redis.cacheGet(key);
    } catch (error) {
      logger.error('Failed to get cached search results:', error);
      return null;
    }
  }

  async invalidateSearchResults(): Promise<boolean> {
    try {
      const pattern = 'search:*';
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Failed to invalidate search results cache:', error);
      return false;
    }
  }

  // User activity caching
  async cacheUserActivity(userId: string, activities: any[], ttl: number = this.SHORT_TTL): Promise<boolean> {
    try {
      const key = this.KEYS.USER_ACTIVITY(userId);
      return await redis.cacheSet(key, activities, ttl);
    } catch (error) {
      logger.error('Failed to cache user activity:', error);
      return false;
    }
  }

  async getCachedUserActivity(userId: string): Promise<any[] | null> {
    try {
      const key = this.KEYS.USER_ACTIVITY(userId);
      return await redis.cacheGet<any[]>(key);
    } catch (error) {
      logger.error('Failed to get cached user activity:', error);
      return null;
    }
  }

  // User achievements caching
  async cacheUserAchievements(userId: string, achievements: any[], ttl: number = this.DEFAULT_TTL): Promise<boolean> {
    try {
      const key = this.KEYS.USER_ACHIEVEMENTS(userId);
      return await redis.cacheSet(key, achievements, ttl);
    } catch (error) {
      logger.error('Failed to cache user achievements:', error);
      return false;
    }
  }

  async getCachedUserAchievements(userId: string): Promise<any[] | null> {
    try {
      const key = this.KEYS.USER_ACHIEVEMENTS(userId);
      return await redis.cacheGet<any[]>(key);
    } catch (error) {
      logger.error('Failed to get cached user achievements:', error);
      return null;
    }
  }

  // Moderation stats caching
  async cacheModerationStats(stats: any, ttl: number = this.SHORT_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.MODERATION_STATS, stats, ttl);
    } catch (error) {
      logger.error('Failed to cache moderation stats:', error);
      return false;
    }
  }

  async getCachedModerationStats(): Promise<any | null> {
    try {
      return await redis.cacheGet(this.KEYS.MODERATION_STATS);
    } catch (error) {
      logger.error('Failed to get cached moderation stats:', error);
      return null;
    }
  }

  // Online users caching
  async cacheOnlineUsers(userIds: string[], ttl: number = this.SHORT_TTL): Promise<boolean> {
    try {
      return await redis.cacheSet(this.KEYS.ONLINE_USERS, userIds, ttl);
    } catch (error) {
      logger.error('Failed to cache online users:', error);
      return false;
    }
  }

  async getCachedOnlineUsers(): Promise<string[] | null> {
    try {
      return await redis.cacheGet<string[]>(this.KEYS.ONLINE_USERS);
    } catch (error) {
      logger.error('Failed to get cached online users:', error);
      return null;
    }
  }

  // Session caching
  async cacheSession(sessionId: string, data: any, ttl: number = 86400): Promise<boolean> {
    try {
      return await redis.setSession(sessionId, data, ttl);
    } catch (error) {
      logger.error('Failed to cache session:', error);
      return false;
    }
  }

  async getCachedSession<T>(sessionId: string): Promise<T | null> {
    try {
      return await redis.getSession<T>(sessionId);
    } catch (error) {
      logger.error('Failed to get cached session:', error);
      return null;
    }
  }

  async deleteCachedSession(sessionId: string): Promise<boolean> {
    try {
      return await redis.deleteSession(sessionId);
    } catch (error) {
      logger.error('Failed to delete cached session:', error);
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(key: string, limit: number, window: number): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    try {
      return await redis.rateLimit(key, limit, window);
    } catch (error) {
      logger.error('Failed to check rate limit:', error);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + window * 1000
      };
    }
  }

  // Cache warming
  async warmCache(): Promise<void> {
    try {
      logger.info('Starting cache warming...');
      
      // Warm forum categories
      // This would typically fetch from database and cache
      
      // Warm popular posts
      // This would typically fetch from database and cache
      
      // Warm leaderboards
      // This would typically fetch from database and cache
      
      logger.info('Cache warming completed');
    } catch (error) {
      logger.error('Failed to warm cache:', error);
    }
  }

  // Cache statistics
  async getCacheStats(): Promise<any> {
    try {
      const info = await redis.info();
      const keys = await redis.keys('*');
      
      return {
        totalKeys: keys.length,
        memoryUsage: info.match(/used_memory_human:([^\r\n]+)/)?.[1] || 'Unknown',
        connectedClients: info.match(/connected_clients:(\d+)/)?.[1] || 'Unknown',
        uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1] || 'Unknown'
      };
    } catch (error) {
      logger.error('Failed to get cache stats:', error);
      return null;
    }
  }

  // Clear all cache
  async clearAllCache(): Promise<boolean> {
    try {
      return await redis.flushdb();
    } catch (error) {
      logger.error('Failed to clear all cache:', error);
      return false;
    }
  }

  // Clear cache by pattern
  async clearCacheByPattern(pattern: string): Promise<boolean> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      logger.error('Failed to clear cache by pattern:', error);
      return false;
    }
  }
}

export const cacheService = new CacheService();
