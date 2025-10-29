import { logger } from '../utils/logger';
import { clickhouseClient } from '../models/clickhouse';
import { 
  AnalyticsEvent, 
  CreateEventRequest, 
  EventType, 
  EventSource, 
  Platform 
} from '../types';
import { generateId } from '../utils/helpers';
import { redisClient } from '../utils/redis';
// Kafka imports - optional
let createConsumer: any, Topics: any;
try {
  const kafkaModule = require('../../../shared/utils/kafka');
  createConsumer = kafkaModule.createConsumer;
  Topics = kafkaModule.Topics;
} catch (e) {
  // Kafka not available, will be handled gracefully
  createConsumer = null;
  Topics = { USER_EVENTS: 'user.events' };
}

export class EventTrackingService {
  private eventBuffer: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout;
  private batchSize: number;

  constructor() {
    this.batchSize = parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000');
    if (process.env.ENABLE_CRON === 'true') {
      this.startFlushInterval();
      logger.info('Event tracking service initialized with scheduled flush');
    } else {
      logger.warn('ENABLE_CRON is not true; scheduled flush is disabled');
    }

    if (process.env.ENABLE_KAFKA === 'true') {
      this.startKafkaConsumer().catch((e) => logger.error('Kafka consumer failed to start', { error: e.message }));
    }
  }

  private startFlushInterval(): void {
    const interval = parseInt(process.env.ANALYTICS_FLUSH_INTERVAL || '5000');
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, interval);
  }

  private async isDuplicate(topic: string, id?: string): Promise<boolean> {
    if (!id) return false;
    const key = `kafka:dedup:${topic}:${id}`;
    const exists = await redisClient.get(key);
    if (exists) return true;
    await redisClient.setex(key, 3600, '1');
    return false;
  }

  private async startKafkaConsumer(): Promise<void> {
    if (!createConsumer) {
      logger.warn('Kafka consumer not available, skipping');
      return;
    }
    const consumer = await createConsumer('analytics-service');
    await consumer.subscribe({ topic: Topics.USER_EVENTS, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          if (await this.isDuplicate(topic, payload.id || payload.eventId)) {
            return;
          }
          await clickhouseClient.insertEvents([
            {
              id: generateId(),
              userId: payload.id,
              sessionId: undefined as any,
              eventType: EventType.USER_INTERACTION,
              eventName: payload.type || 'user_event',
              properties: payload,
              timestamp: new Date(payload.occurredAt || new Date().toISOString()),
              source: EventSource.API,
              version: '1.0.0',
              platform: Platform.SERVER,
              userAgent: 'kafka',
              ipAddress: undefined as any,
              location: undefined as any,
              metadata: { topic },
            } as any,
          ]);
        } catch (err: any) {
          logger.error('Failed to process Kafka message', { error: err.message });
        }
      },
    });

    logger.info('Analytics Kafka consumer running', { topic: Topics.USER_EVENTS });
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
      logger.error('Error tracking event', { error: (error as any).message, eventData });
      return { success: false, error: (error as any).message };
    }
  }

  async trackEvents(eventsData: CreateEventRequest[]): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results = [];
    const errors = [];

    logger.info('Tracking multiple events', { count: eventsData.length });

    // Process events in parallel for better performance
    const promises = eventsData.map(async (eventData) => {
      try {
        const result = await this.trackEvent(eventData);
        return { success: true, result, eventData: null };
      } catch (error) {
        return { 
          success: false, 
          result: null, 
          eventData, 
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });

    const settledResults = await Promise.allSettled(promises);
    
    settledResults.forEach((settled) => {
      if (settled.status === 'fulfilled') {
        if (settled.value.success) {
          results.push(settled.value.result);
        } else {
          errors.push({
            eventData: settled.value.eventData,
            error: settled.value.error
          });
        }
      } else {
        errors.push({
          eventData: null,
          error: settled.reason instanceof Error ? settled.reason.message : String(settled.reason)
        });
      }
    });

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

  async trackBatchEvents(eventsData: CreateEventRequest[], userId?: string): Promise<any[]> {
    // Apply userId override if provided
    const eventsWithUserId = eventsData.map(event => ({
      ...event,
      userId: userId || event.userId
    }));
    
    const result = await this.trackEvents(eventsWithUserId);
    return result.results;
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

  async getEventStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    eventType?: EventType;
    eventName?: string;
    userId?: string;
    groupBy?: string;
  }): Promise<any> {
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

  async searchEvents(params: {
    query?: string;
    eventType?: EventType;
    eventName?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ events: AnalyticsEvent[]; pagination: any }> {
    const {
      query,
      startDate,
      endDate,
      limit = 100,
      page = 1,
      eventType,
      eventName,
      userId
    } = params;
    try {
      const offset = (page - 1) * limit;
      let sqlQuery = `
        SELECT * FROM events
        WHERE timestamp >= {startDate:DateTime64(3)} AND timestamp <= {endDate:DateTime64(3)}
      `;
      
      const queryParams: any = {
        startDate: startDate || new Date(Date.now() - 86400000),
        endDate: endDate || new Date()
      };

      if (eventType) {
        sqlQuery += ' AND event_type = {eventType:String}';
        queryParams.eventType = eventType;
      }

      if (eventName) {
        sqlQuery += ' AND event_name = {eventName:String}';
        queryParams.eventName = eventName;
      }

      if (userId) {
        sqlQuery += ' AND user_id = {userId:String}';
        queryParams.userId = userId;
      }

      if (query) {
        // Full-text search on event_name and properties
        sqlQuery += ' AND (event_name LIKE {searchQuery:String} OR properties LIKE {searchQuery:String})';
        queryParams.searchQuery = `%${query}%`;
      }

      sqlQuery += ` ORDER BY timestamp ${params.sortOrder === 'asc' ? 'ASC' : 'DESC'} LIMIT {limit:UInt32} OFFSET {offset:UInt32}`;
      queryParams.limit = limit;
      queryParams.offset = offset;

      const events = await clickhouseClient.query(sqlQuery, queryParams);
      const totalCount = await clickhouseClient.getEventCount(
        queryParams.startDate,
        queryParams.endDate,
        eventType
      );

      return {
        events: events.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          sessionId: row.session_id,
          eventType: row.event_type as EventType,
          eventName: row.event_name,
          properties: JSON.parse(row.properties),
          timestamp: new Date(row.timestamp),
          source: row.source as EventSource,
          version: row.version,
          platform: row.platform as Platform,
          userAgent: row.user_agent,
          ipAddress: row.ip_address,
          location: row.country ? {
            country: row.country,
            region: row.region,
            city: row.city,
            latitude: row.latitude,
            longitude: row.longitude,
            timezone: row.timezone
          } : undefined,
          metadata: JSON.parse(row.metadata)
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: offset + limit < totalCount,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to search events', { error: error instanceof Error ? error.message : String(error) });
      return { events: [], pagination: { page: 1, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
    }
  }

  async getEventById(id: string): Promise<AnalyticsEvent | null> {
    try {
      // Try to get from cache first
      const cachedEvent = await redisClient.get(`event:${id}`);
      if (cachedEvent) {
        const event = JSON.parse(cachedEvent);
        return {
          ...event,
          timestamp: new Date(event.timestamp)
        };
      }

      // Query ClickHouse if not in cache
      const query = `
        SELECT * FROM events
        WHERE id = {id:String}
        LIMIT 1
      `;
      const result = await clickhouseClient.query(query, { id });
      
      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        eventType: row.event_type as EventType,
        eventName: row.event_name,
        properties: JSON.parse(row.properties),
        timestamp: new Date(row.timestamp),
        source: row.source as EventSource,
        version: row.version,
        platform: row.platform as Platform,
        userAgent: row.user_agent,
        ipAddress: row.ip_address,
        location: row.country ? {
          country: row.country,
          region: row.region,
          city: row.city,
          latitude: row.latitude,
          longitude: row.longitude,
          timezone: row.timezone
        } : undefined,
        metadata: JSON.parse(row.metadata)
      };
    } catch (error) {
      logger.error('Failed to get event by ID', { error: error instanceof Error ? error.message : String(error), id });
      return null;
    }
  }

  async exportEvents(params: {
    format: 'json' | 'csv' | 'parquet';
    startDate?: Date;
    endDate?: Date;
    eventType?: EventType;
    eventName?: string;
    userId?: string;
  }): Promise<string | Buffer> {
    try {
      let sqlQuery = `
        SELECT * FROM events
        WHERE timestamp >= {startDate:DateTime64(3)} AND timestamp <= {endDate:DateTime64(3)}
      `;
      
      const queryParams: any = {
        startDate: params.startDate || new Date(Date.now() - 86400000),
        endDate: params.endDate || new Date()
      };

      if (params.eventType) {
        sqlQuery += ' AND event_type = {eventType:String}';
        queryParams.eventType = params.eventType;
      }

      if (params.eventName) {
        sqlQuery += ' AND event_name = {eventName:String}';
        queryParams.eventName = params.eventName;
      }

      if (params.userId) {
        sqlQuery += ' AND user_id = {userId:String}';
        queryParams.userId = params.userId;
      }

      sqlQuery += ' ORDER BY timestamp DESC';

      const events = await clickhouseClient.query(sqlQuery, queryParams);

      switch (params.format) {
        case 'csv':
          const headers = ['id', 'user_id', 'event_type', 'event_name', 'timestamp', 'properties'];
          const csvRows = [
            headers.join(','),
            ...events.map((row: any) => [
              row.id,
              row.user_id || '',
              row.event_type,
              row.event_name,
              row.timestamp,
              JSON.stringify(row.properties).replace(/"/g, '""')
            ].join(','))
          ];
          return csvRows.join('\n');

        case 'json':
          return JSON.stringify(events, null, 2);

        case 'parquet':
          // Parquet export would require additional library
          // For now, return JSON
          logger.warn('Parquet format not implemented, returning JSON');
          return JSON.stringify(events, null, 2);

        default:
          return JSON.stringify(events, null, 2);
      }
    } catch (error) {
      logger.error('Failed to export events', { error: error instanceof Error ? error.message : String(error) });
      throw error;
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
