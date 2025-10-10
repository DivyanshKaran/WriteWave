import { logger } from '@/utils/logger';
import { clickhouseClient } from '@/models/clickhouse';
import { 
  AnalyticsEvent, 
  CreateEventRequest, 
  EventType, 
  EventSource, 
  Platform 
} from '@/types';
import { generateId } from '@/utils/helpers';
import { redisClient } from '@/utils/redis';

export class EventTrackingService {
  private eventBuffer: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout;
  private batchSize: number;

  constructor() {
    this.batchSize = parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000');
    this.startFlushInterval();
    logger.info('Event tracking service initialized');
  }

  private startFlushInterval(): void {
    const interval = parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || '5000');
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, interval);
  }

  async trackEvent(eventData: CreateEventRequest): Promise<{ success: boolean; eventId?: string; error?: string }> {
    try {
      logger.debug('Tracking event', { eventName: eventData.eventName, eventType: eventData.eventType });

      // Validate event data
      const validation = this.validateEventData(eventData);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Create event object
      const event: AnalyticsEvent = {
        id: generateId(),
        userId: eventData.userId,
        sessionId: eventData.sessionId,
        eventType: eventData.eventType,
        eventName: eventData.eventName,
        properties: eventData.properties || {},
        timestamp: eventData.timestamp || new Date(),
        source: eventData.source || EventSource.WEB_APP,
        version: eventData.version || '1.0.0',
        platform: eventData.platform || Platform.WEB,
        userAgent: eventData.userAgent,
        ipAddress: eventData.ipAddress,
        location: eventData.location,
        metadata: eventData.metadata || {}
      };

      // Add to buffer
      this.eventBuffer.push(event);

      // Flush if buffer is full
      if (this.eventBuffer.length >= this.batchSize) {
        await this.flushEvents();
      }

      // Cache event for real-time analytics
      await this.cacheEvent(event);

      logger.debug('Event tracked successfully', { eventId: event.id });
      return { success: true, eventId: event.id };

    } catch (error) {
      logger.error('Error tracking event', { error: error.message, eventData });
      return { success: false, error: error.message };
    }
  }

  async trackEvents(eventsData: CreateEventRequest[]): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Tracking multiple events', { count: eventsData.length });

    for (const eventData of eventsData) {
      try {
        const result = await this.trackEvent(eventData);
        results.push(result);
      } catch (error) {
        errors.push({
          eventData,
          error: error.message
        });
      }
    }

    // Flush all buffered events
    await this.flushEvents();

    logger.info('Multiple events tracked', { 
      total: eventsData.length, 
      successful: results.length, 
      failed: errors.length 
    });

    return {
      success: errors.length === 0,
      results,
      errors
    };
  }

  async flushEvents(): Promise<void> {
    if (this.eventBuffer.length === 0) {
      return;
    }

    const eventsToFlush = [...this.eventBuffer];
    this.eventBuffer = [];

    try {
      logger.debug('Flushing events to ClickHouse', { count: eventsToFlush.length });
      await clickhouseClient.insertEvents(eventsToFlush);
      logger.info('Events flushed successfully', { count: eventsToFlush.length });
    } catch (error) {
      logger.error('Failed to flush events', { error: error.message, count: eventsToFlush.length });
      
      // Re-add events to buffer for retry
      this.eventBuffer.unshift(...eventsToFlush);
      
      // Limit buffer size to prevent memory issues
      if (this.eventBuffer.length > this.batchSize * 2) {
        this.eventBuffer = this.eventBuffer.slice(0, this.batchSize);
        logger.warn('Event buffer size limited to prevent memory issues');
      }
    }
  }

  private async cacheEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const cacheKey = `event:${event.id}`;
      const cacheData = {
        ...event,
        timestamp: event.timestamp.toISOString()
      };

      // Cache for 1 hour
      await redisClient.setex(cacheKey, 3600, JSON.stringify(cacheData));

      // Add to real-time event stream
      const streamKey = 'events:realtime';
      await redisClient.lpush(streamKey, JSON.stringify(cacheData));
      await redisClient.ltrim(streamKey, 0, 999); // Keep last 1000 events

      // Update event counters
      await this.updateEventCounters(event);

    } catch (error) {
      logger.error('Failed to cache event', { error: error.message, eventId: event.id });
    }
  }

  private async updateEventCounters(event: AnalyticsEvent): Promise<void> {
    try {
      const now = new Date();
      const hourKey = `events:hour:${now.getFullYear()}:${now.getMonth()}:${now.getDate()}:${now.getHours()}`;
      const dayKey = `events:day:${now.getFullYear()}:${now.getMonth()}:${now.getDate()}`;
      const eventTypeKey = `events:type:${event.eventType}`;
      const eventNameKey = `events:name:${event.eventName}`;

      await Promise.all([
        redisClient.incr(hourKey),
        redisClient.incr(dayKey),
        redisClient.incr(eventTypeKey),
        redisClient.incr(eventNameKey),
        redisClient.expire(hourKey, 86400), // 24 hours
        redisClient.expire(dayKey, 2592000), // 30 days
        redisClient.expire(eventTypeKey, 86400),
        redisClient.expire(eventNameKey, 86400)
      ]);

      if (event.userId) {
        const userKey = `events:user:${event.userId}`;
        await redisClient.incr(userKey);
        await redisClient.expire(userKey, 86400);
      }

    } catch (error) {
      logger.error('Failed to update event counters', { error: error.message });
    }
  }

  private validateEventData(eventData: CreateEventRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!eventData.eventName) {
      errors.push('Event name is required');
    }

    if (!eventData.eventType) {
      errors.push('Event type is required');
    }

    // Validate event name format
    if (eventData.eventName && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(eventData.eventName)) {
      errors.push('Event name must start with a letter and contain only letters, numbers, and underscores');
    }

    // Validate properties
    if (eventData.properties && typeof eventData.properties !== 'object') {
      errors.push('Properties must be an object');
    }

    // Validate timestamp
    if (eventData.timestamp && eventData.timestamp > new Date()) {
      errors.push('Timestamp cannot be in the future');
    }

    // Validate user ID format
    if (eventData.userId && !/^[a-zA-Z0-9_-]+$/.test(eventData.userId)) {
      errors.push('User ID contains invalid characters');
    }

    // Validate session ID format
    if (eventData.sessionId && !/^[a-zA-Z0-9_-]+$/.test(eventData.sessionId)) {
      errors.push('Session ID contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async getEventCount(startDate: Date, endDate: Date, eventType?: EventType): Promise<number> {
    try {
      return await clickhouseClient.getEventCount(startDate, endDate, eventType);
    } catch (error) {
      logger.error('Failed to get event count', { error: error.message });
      return 0;
    }
  }

  async getTopEvents(startDate: Date, endDate: Date, limit: number = 10): Promise<any[]> {
    try {
      return await clickhouseClient.getTopEvents(startDate, endDate, limit);
    } catch (error) {
      logger.error('Failed to get top events', { error: error.message });
      return [];
    }
  }

  async getActiveUsers(startDate: Date, endDate: Date): Promise<number> {
    try {
      return await clickhouseClient.getActiveUsers(startDate, endDate);
    } catch (error) {
      logger.error('Failed to get active users', { error: error.message });
      return 0;
    }
  }

  async getTimeSeriesData(
    startDate: Date,
    endDate: Date,
    granularity: string = 'hour',
    eventType?: EventType
  ): Promise<any[]> {
    try {
      return await clickhouseClient.getTimeSeriesData(startDate, endDate, granularity, eventType);
    } catch (error) {
      logger.error('Failed to get time series data', { error: error.message });
      return [];
    }
  }

  async getRecentEvents(limit: number = 100): Promise<AnalyticsEvent[]> {
    try {
      const events = await redisClient.lrange('events:realtime', 0, limit - 1);
      return events.map(eventStr => {
        const event = JSON.parse(eventStr);
        return {
          ...event,
          timestamp: new Date(event.timestamp)
        };
      });
    } catch (error) {
      logger.error('Failed to get recent events', { error: error.message });
      return [];
    }
  }

  async getEventStats(): Promise<any> {
    try {
      const now = new Date();
      const hourKey = `events:hour:${now.getFullYear()}:${now.getMonth()}:${now.getDate()}:${now.getHours()}`;
      const dayKey = `events:day:${now.getFullYear()}:${now.getMonth()}:${now.getDate()}`;

      const [hourlyCount, dailyCount] = await Promise.all([
        redisClient.get(hourKey) || '0',
        redisClient.get(dayKey) || '0'
      ]);

      return {
        hourly: parseInt(hourlyCount),
        daily: parseInt(dailyCount),
        bufferSize: this.eventBuffer.length
      };
    } catch (error) {
      logger.error('Failed to get event stats', { error: error.message });
      return {
        hourly: 0,
        daily: 0,
        bufferSize: this.eventBuffer.length
      };
    }
  }

  async searchEvents(
    query: string,
    startDate: Date,
    endDate: Date,
    limit: number = 100
  ): Promise<AnalyticsEvent[]> {
    try {
      // This would typically use ClickHouse's full-text search capabilities
      // For now, we'll implement a simple search in the cached events
      const events = await this.getRecentEvents(1000);
      
      return events
        .filter(event => {
          const searchText = `${event.eventName} ${event.eventType} ${JSON.stringify(event.properties)}`.toLowerCase();
          return searchText.includes(query.toLowerCase()) &&
                 event.timestamp >= startDate &&
                 event.timestamp <= endDate;
        })
        .slice(0, limit);
    } catch (error) {
      logger.error('Failed to search events', { error: error.message });
      return [];
    }
  }

  async getEventProperties(eventName: string, limit: number = 100): Promise<any[]> {
    try {
      // Get recent events of this type to analyze properties
      const events = await this.getRecentEvents(1000);
      const filteredEvents = events.filter(e => e.eventName === eventName);
      
      // Extract unique property keys
      const propertyKeys = new Set<string>();
      filteredEvents.forEach(event => {
        Object.keys(event.properties).forEach(key => propertyKeys.add(key));
      });

      return Array.from(propertyKeys).slice(0, limit);
    } catch (error) {
      logger.error('Failed to get event properties', { error: error.message });
      return [];
    }
  }

  async cleanup(): Promise<void> {
    try {
      // Flush remaining events
      await this.flushEvents();
      
      // Clear interval
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
      }

      logger.info('Event tracking service cleaned up');
    } catch (error) {
      logger.error('Error during event tracking cleanup', { error: error.message });
    }
  }
}

export const eventTrackingService = new EventTrackingService();
