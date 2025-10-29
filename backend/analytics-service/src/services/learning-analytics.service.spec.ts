import { LearningAnalyticsService } from './learning-analytics.service';
import { LearningMethod } from '../types';

const chQuery = jest.fn(async () => []);
const chTimeSeries = jest.fn(async () => []);
const chPerf = jest.fn(async () => []);
jest.mock('../models/clickhouse', () => ({
  clickhouseClient: {
    query: (...args: any[]) => chQuery(...args),
    getTimeSeriesData: (...args: any[]) => chTimeSeries(...args),
    getPerformanceMetrics: (...args: any[]) => chPerf(...args),
  },
}));

const pgGetInsights = jest.fn(async () => null);
const pgCreateInsights = jest.fn(async (_d: any) => {});
const pgQuery = jest.fn(async () => ({ rows: [], rowCount: 0 }));
jest.mock('../models/postgres', () => ({
  postgresClient: {
    getUserInsights: (...args: any[]) => pgGetInsights(...args),
    createUserInsights: (...args: any[]) => pgCreateInsights(...args),
    getDashboard: jest.fn(async () => null),
    getDashboards: jest.fn(async () => []),
    createDashboard: jest.fn(async (d: any) => ({ id: 'd1', ...d })),
    query: (...args: any[]) => pgQuery(...args),
    getABTests: jest.fn(async () => []),
    createABTest: jest.fn(async (d: any) => ({ id: 't1', ...d })),
    getABTest: jest.fn(async () => null),
    updateABTest: jest.fn(async (_id: string, u: any) => ({ id: 't1', ...u })),
    deleteABTest: jest.fn(async () => true),
    createABTestResult: jest.fn(async (d: any) => ({ id: 'r1', ...d })),
    getABTestResults: jest.fn(async () => []),
  },
}));

const redis = new Map<string, string>();
const redisMock = {
  setex: jest.fn(async (k: string, _ttl: number, v: string) => { redis.set(k, v); }),
  lpush: jest.fn(async (_k: string, _v: string) => {}),
  ltrim: jest.fn(async (_k: string, _s: number, _e: number) => {}),
  lrange: jest.fn(async (k: string) => redis.get(k) ? [redis.get(k)!] : []),
};
jest.mock('../utils/redis', () => ({ redisClient: redisMock }));

describe('LearningAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    redis.clear();
  });

  it('tracks session, writes clickhouse, updates insights and caches', async () => {
    const service = new LearningAnalyticsService();
    const now = new Date();
    const metrics = {
      userId: 'u1', sessionId: 's1', startTime: now, endTime: new Date(now.getTime()+1000),
      duration: 60, charactersPracticed: 10, charactersCorrect: 8, charactersIncorrect: 2,
      accuracy: 0.8, xpGained: 20, streakUpdated: true, difficulty: 'beginner', method: LearningMethod.FLASHCARDS,
      device: 'web', platform: 'web', characterId: 'ch1',
    } as any;
    const res = await service.trackLearningSession(metrics);
    expect(res.success).toBe(true);
    expect(chQuery).toHaveBeenCalled();
    expect(pgGetInsights).toHaveBeenCalledWith('u1');
    expect(pgCreateInsights).toHaveBeenCalled();
    expect(redisMock.setex).toHaveBeenCalled();
  });

  it('returns recent sessions from redis', async () => {
    const service = new LearningAnalyticsService();
    // Seed a session via trackLearningSession
    await service.trackLearningSession({
      userId: 'u2', sessionId: 's2', startTime: new Date(), endTime: new Date(), duration: 10,
      charactersPracticed: 1, charactersCorrect: 1, charactersIncorrect: 0, accuracy: 1,
      xpGained: 5, streakUpdated: false, difficulty: 'beginner', method: LearningMethod.FLASHCARDS, device: 'web', platform: 'web',
    } as any);
    const list = await service.getRecentSessions(5);
    expect(Array.isArray(list)).toBe(true);
  });
});


