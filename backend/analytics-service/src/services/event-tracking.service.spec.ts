import { EventTrackingService } from './event-tracking.service';
import { EventType, EventSource, Platform } from '../types';

// Mocks
const insertEvents = jest.fn();
const getEventCount = jest.fn();
const getTopEvents = jest.fn();
const getActiveUsers = jest.fn();
const getTimeSeriesData = jest.fn();
const query = jest.fn();

jest.mock('../models/clickhouse', () => ({
  clickhouseClient: {
    insertEvents: (...args: any[]) => insertEvents(...args),
    getEventCount: (...args: any[]) => getEventCount(...args),
    getTopEvents: (...args: any[]) => getTopEvents(...args),
    getActiveUsers: (...args: any[]) => getActiveUsers(...args),
    getTimeSeriesData: (...args: any[]) => getTimeSeriesData(...args),
    query: (...args: any[]) => query(...args),
  },
}));

const redis = new Map<string, string>();
const redisMock = {
  get: jest.fn(async (k: string) => redis.get(k) || null),
  setex: jest.fn(async (k: string, _ttl: number, v: string) => void redis.set(k, v)),
  lpush: jest.fn(async (_k: string, _v: string) => {}),
  ltrim: jest.fn(async (_k: string, _s: number, _e: number) => {}),
  incr: jest.fn(async (_k: string) => {}),
  expire: jest.fn(async (_k: string, _s: number) => {}),
  lrange: jest.fn(async (k: string, _s: number, _e: number) => {
    const val = redis.get(k);
    if (!val) return [] as string[];
    return [val];
  }),
};

jest.mock('../utils/redis', () => ({ redisClient: redisMock }));

describe('EventTrackingService', () => {
  const service = new EventTrackingService();

  beforeEach(() => {
    jest.clearAllMocks();
    redis.clear();
  });

  it('validates and tracks a single event', async () => {
    const result = await service.trackEvent({
      userId: 'u1',
      sessionId: 's1',
      eventType: EventType.USER_INTERACTION,
      eventName: 'ButtonClick',
      properties: { a: 1 },
      source: EventSource.WEB_APP,
      platform: Platform.WEB,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid event', async () => {
    const result = await service.trackEvent({
      userId: 'u1',
      sessionId: 's1',
      // missing eventType and bad name
      eventName: '1-bad',
      properties: 'not-object' as any,
    } as any);
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('flushes events to clickhouse', async () => {
    await service.trackEvent({
      userId: 'u1', eventType: EventType.USER_INTERACTION, eventName: 'Click'
    } as any);
    await service.flushEvents();
    expect(insertEvents).toHaveBeenCalled();
  });

  it('returns recent events from redis', async () => {
    // seed one event into redis via trackEvent
    await service.trackEvent({
      userId: 'u2', eventType: EventType.SYSTEM_EVENT, eventName: 'Ping'
    } as any);
    const events = await service.getRecentEvents(10);
    expect(Array.isArray(events)).toBe(true);
  });
});


