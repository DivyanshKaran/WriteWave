import { logger } from '@/utils/logger';
import { clickhouseClient } from '@/models/clickhouse';
import { postgresClient } from '@/models/postgres';
import { 
  LearningMetrics, 
  UserInsights, 
  DifficultyLevel, 
  LearningMethod,
  ChurnRisk 
} from '@/types';
import { generateId } from '@/utils/helpers';
import { redisClient } from '@/utils/redis';

export class LearningAnalyticsService {
  constructor() {
    logger.info('Learning analytics service initialized');
  }

  async trackLearningSession(metrics: LearningMetrics): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Tracking learning session', { 
        userId: metrics.userId, 
        sessionId: metrics.sessionId,
        duration: metrics.duration,
        accuracy: metrics.accuracy 
      });

      // Insert into ClickHouse
      const query = `
        INSERT INTO learning_metrics (
          id, user_id, character_id, session_id, start_time, end_time,
          duration, characters_practiced, characters_correct, characters_incorrect,
          accuracy, xp_gained, streak_updated, difficulty, method, device, platform
        ) VALUES (
          {id:String}, {user_id:String}, {character_id:Nullable(String)}, {session_id:String},
          {start_time:DateTime64(3)}, {end_time:DateTime64(3)}, {duration:Float64},
          {characters_practiced:UInt32}, {characters_correct:UInt32}, {characters_incorrect:UInt32},
          {accuracy:Float64}, {xp_gained:UInt32}, {streak_updated:UInt8},
          {difficulty:String}, {method:String}, {device:String}, {platform:String}
        )
      `;

      const params = {
        id: generateId(),
        user_id: metrics.userId,
        character_id: metrics.characterId || null,
        session_id: metrics.sessionId,
        start_time: metrics.startTime,
        end_time: metrics.endTime,
        duration: metrics.duration,
        characters_practiced: metrics.charactersPracticed,
        characters_correct: metrics.charactersCorrect,
        characters_incorrect: metrics.charactersIncorrect,
        accuracy: metrics.accuracy,
        xp_gained: metrics.xpGained,
        streak_updated: metrics.streakUpdated ? 1 : 0,
        difficulty: metrics.difficulty,
        method: metrics.method,
        device: metrics.device,
        platform: metrics.platform
      };

      await clickhouseClient.query(query, { params });

      // Update user insights
      await this.updateUserInsights(metrics);

      // Cache session data for real-time analytics
      await this.cacheSessionData(metrics);

      logger.info('Learning session tracked successfully', { sessionId: metrics.sessionId });
      return { success: true };

    } catch (error) {
      logger.error('Error tracking learning session', { error: error.message, sessionId: metrics.sessionId });
      return { success: false, error: error.message };
    }
  }

  private async updateUserInsights(metrics: LearningMetrics): Promise<void> {
    try {
      // Get current user insights
      let insights = await postgresClient.getUserInsights(metrics.userId);
      
      if (!insights) {
        // Create new user insights
        insights = {
          id: generateId(),
          userId: metrics.userId,
          totalSessions: 0,
          totalTimeSpent: 0,
          averageSessionDuration: 0,
          charactersLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          accuracy: 0,
          favoriteMethod: LearningMethod.FLASHCARDS,
          progressRate: 0,
          engagementScore: 0,
          churnRisk: ChurnRisk.LOW,
          recommendations: [],
          lastActive: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      }

      // Update insights based on new session
      insights.totalSessions += 1;
      insights.totalTimeSpent += metrics.duration;
      insights.averageSessionDuration = insights.totalTimeSpent / insights.totalSessions;
      insights.charactersLearned += metrics.charactersCorrect;
      insights.accuracy = (insights.accuracy * (insights.totalSessions - 1) + metrics.accuracy) / insights.totalSessions;
      insights.lastActive = new Date();

      // Update streak
      if (metrics.streakUpdated) {
        insights.currentStreak += 1;
        if (insights.currentStreak > insights.longestStreak) {
          insights.longestStreak = insights.currentStreak;
        }
      }

      // Calculate engagement score
      insights.engagementScore = this.calculateEngagementScore(insights);

      // Calculate churn risk
      insights.churnRisk = this.calculateChurnRisk(insights);

      // Generate recommendations
      insights.recommendations = this.generateRecommendations(insights);

      // Save updated insights
      await postgresClient.createUserInsights(insights);

    } catch (error) {
      logger.error('Error updating user insights', { error: error.message, userId: metrics.userId });
    }
  }

  private calculateEngagementScore(insights: UserInsights): number {
    // Simple engagement score calculation
    const sessionScore = Math.min(insights.totalSessions / 10, 1) * 30; // Max 30 points
    const timeScore = Math.min(insights.totalTimeSpent / 3600, 1) * 25; // Max 25 points (1 hour)
    const accuracyScore = insights.accuracy * 25; // Max 25 points
    const streakScore = Math.min(insights.currentStreak / 7, 1) * 20; // Max 20 points (1 week)

    return Math.round(sessionScore + timeScore + accuracyScore + streakScore);
  }

  private calculateChurnRisk(insights: UserInsights): ChurnRisk {
    const daysSinceLastActive = (Date.now() - insights.lastActive.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActive > 30) {
      return ChurnRisk.CRITICAL;
    } else if (daysSinceLastActive > 14) {
      return ChurnRisk.HIGH;
    } else if (daysSinceLastActive > 7) {
      return ChurnRisk.MEDIUM;
    } else if (insights.engagementScore < 30) {
      return ChurnRisk.MEDIUM;
    } else {
      return ChurnRisk.LOW;
    }
  }

  private generateRecommendations(insights: UserInsights): string[] {
    const recommendations: string[] = [];

    if (insights.accuracy < 0.7) {
      recommendations.push('Try practicing easier characters to improve accuracy');
    }

    if (insights.currentStreak < 3) {
      recommendations.push('Set a daily practice goal to build a learning streak');
    }

    if (insights.averageSessionDuration < 300) { // 5 minutes
      recommendations.push('Try longer practice sessions for better retention');
    }

    if (insights.engagementScore < 50) {
      recommendations.push('Explore different learning methods to find what works best');
    }

    if (insights.churnRisk === ChurnRisk.HIGH || insights.churnRisk === ChurnRisk.CRITICAL) {
      recommendations.push('Consider setting up practice reminders to stay engaged');
    }

    return recommendations;
  }

  private async cacheSessionData(metrics: LearningMetrics): Promise<void> {
    try {
      const cacheKey = `session:${metrics.sessionId}`;
      const sessionData = {
        ...metrics,
        startTime: metrics.startTime.toISOString(),
        endTime: metrics.endTime.toISOString()
      };

      // Cache for 24 hours
      await redisClient.setex(cacheKey, 86400, JSON.stringify(sessionData));

      // Add to real-time learning stream
      const streamKey = 'learning:realtime';
      await redisClient.lpush(streamKey, JSON.stringify(sessionData));
      await redisClient.ltrim(streamKey, 0, 999); // Keep last 1000 sessions

    } catch (error) {
      logger.error('Failed to cache session data', { error: error.message, sessionId: metrics.sessionId });
    }
  }

  async getUserInsights(userId: string): Promise<UserInsights | null> {
    try {
      return await postgresClient.getUserInsights(userId);
    } catch (error) {
      logger.error('Failed to get user insights', { error: error.message, userId });
      return null;
    }
  }

  async getLearningProgress(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const query = `
        SELECT 
          toDate(start_time) as date,
          count() as sessions,
          sum(duration) as total_duration,
          avg(accuracy) as avg_accuracy,
          sum(characters_practiced) as characters_practiced,
          sum(characters_correct) as characters_correct,
          sum(xp_gained) as xp_gained
        FROM learning_metrics
        WHERE user_id = {user_id:String}
          AND start_time >= {start_date:DateTime64(3)}
          AND start_time <= {end_date:DateTime64(3)}
        GROUP BY date
        ORDER BY date
      `;

      const result = await clickhouseClient.query(query, {
        user_id: userId,
        start_date: startDate,
        end_date: endDate
      });

      return result;
    } catch (error) {
      logger.error('Failed to get learning progress', { error: error.message, userId });
      return [];
    }
  }

  async getCharacterDifficultyAnalysis(characterId?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          character_id,
          difficulty,
          count() as practice_sessions,
          avg(accuracy) as avg_accuracy,
          avg(duration) as avg_duration,
          sum(characters_correct) as total_correct,
          sum(characters_incorrect) as total_incorrect
        FROM learning_metrics
        WHERE character_id IS NOT NULL
      `;

      const params: any = {};

      if (characterId) {
        query += ' AND character_id = {character_id:String}';
        params.character_id = characterId;
      }

      query += `
        GROUP BY character_id, difficulty
        ORDER BY avg_accuracy DESC
      `;

      const result = await clickhouseClient.query(query, params);
      return result;
    } catch (error) {
      logger.error('Failed to get character difficulty analysis', { error: error.message });
      return [];
    }
  }

  async getOptimalSessionLength(): Promise<any> {
    try {
      const query = `
        SELECT 
          CASE 
            WHEN duration < 300 THEN '0-5min'
            WHEN duration < 600 THEN '5-10min'
            WHEN duration < 900 THEN '10-15min'
            WHEN duration < 1800 THEN '15-30min'
            ELSE '30min+'
          END as session_length,
          count() as sessions,
          avg(accuracy) as avg_accuracy,
          avg(characters_practiced) as avg_characters,
          sum(xp_gained) as total_xp
        FROM learning_metrics
        GROUP BY session_length
        ORDER BY avg_accuracy DESC
      `;

      const result = await clickhouseClient.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to get optimal session length', { error: error.message });
      return [];
    }
  }

  async getLearningMethodEffectiveness(): Promise<any> {
    try {
      const query = `
        SELECT 
          method,
          count() as sessions,
          avg(accuracy) as avg_accuracy,
          avg(duration) as avg_duration,
          sum(characters_practiced) as total_characters,
          sum(xp_gained) as total_xp,
          uniq(user_id) as unique_users
        FROM learning_metrics
        GROUP BY method
        ORDER BY avg_accuracy DESC
      `;

      const result = await clickhouseClient.query(query);
      return result;
    } catch (error) {
      logger.error('Failed to get learning method effectiveness', { error: error.message });
      return [];
    }
  }

  async getUserRetentionAnalysis(startDate: Date, endDate: Date): Promise<any> {
    try {
      const query = `
        SELECT 
          toDate(start_time) as date,
          uniq(user_id) as active_users,
          count() as total_sessions,
          avg(duration) as avg_session_duration,
          avg(accuracy) as avg_accuracy
        FROM learning_metrics
        WHERE start_time >= {start_date:DateTime64(3)}
          AND start_time <= {end_date:DateTime64(3)}
        GROUP BY date
        ORDER BY date
      `;

      const result = await clickhouseClient.query(query, {
        start_date: startDate,
        end_date: endDate
      });

      return result;
    } catch (error) {
      logger.error('Failed to get user retention analysis', { error: error.message });
      return [];
    }
  }

  async getChurnRiskUsers(): Promise<UserInsights[]> {
    try {
      // This would typically query the user_insights table for users with high churn risk
      // For now, we'll return a mock implementation
      return [];
    } catch (error) {
      logger.error('Failed to get churn risk users', { error: error.message });
      return [];
    }
  }

  async getRecentSessions(limit: number = 100): Promise<LearningMetrics[]> {
    try {
      const sessions = await redisClient.lrange('learning:realtime', 0, limit - 1);
      return sessions.map(sessionStr => {
        const session = JSON.parse(sessionStr);
        return {
          ...session,
          startTime: new Date(session.startTime),
          endTime: new Date(session.endTime)
        };
      });
    } catch (error) {
      logger.error('Failed to get recent sessions', { error: error.message });
      return [];
    }
  }

  async getLearningStats(): Promise<any> {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 86400000);

      const [todaySessions, yesterdaySessions, totalUsers] = await Promise.all([
        this.getSessionCount(today, now),
        this.getSessionCount(yesterday, today),
        this.getTotalUsers()
      ]);

      return {
        todaySessions,
        yesterdaySessions,
        totalUsers,
        growth: yesterdaySessions > 0 ? ((todaySessions - yesterdaySessions) / yesterdaySessions) * 100 : 0
      };
    } catch (error) {
      logger.error('Failed to get learning stats', { error: error.message });
      return {
        todaySessions: 0,
        yesterdaySessions: 0,
        totalUsers: 0,
        growth: 0
      };
    }
  }

  private async getSessionCount(startDate: Date, endDate: Date): Promise<number> {
    try {
      const query = `
        SELECT count() as count
        FROM learning_metrics
        WHERE start_time >= {start_date:DateTime64(3)}
          AND start_time <= {end_date:DateTime64(3)}
      `;

      const result = await clickhouseClient.query(query, {
        start_date: startDate,
        end_date: endDate
      });

      return result[0]?.count || 0;
    } catch (error) {
      logger.error('Failed to get session count', { error: error.message });
      return 0;
    }
  }

  private async getTotalUsers(): Promise<number> {
    try {
      const query = `
        SELECT uniq(user_id) as total_users
        FROM learning_metrics
      `;

      const result = await clickhouseClient.query(query);
      return result[0]?.total_users || 0;
    } catch (error) {
      logger.error('Failed to get total users', { error: error.message });
      return 0;
    }
  }
}

export const learningAnalyticsService = new LearningAnalyticsService();
