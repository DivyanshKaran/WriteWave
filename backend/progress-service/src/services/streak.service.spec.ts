import { StreakService } from './streak.service';
import { StreakType } from '../types';

const cache = new Map<string, any>();
const cacheGet = jest.fn(async (k: string) => cache.get(k));
const cacheSet = jest.fn(async (k: string, v: any) => void cache.set(k, v));
const cacheDel = jest.fn(async (k: string) => void cache.delete(k));

jest.mock('../config/redis', () => ({
  cacheGet: (k: string) => cacheGet(k),
  cacheSet: (k: string, v: any, _ttl?: number) => cacheSet(k, v),
  cacheDel: (k: string) => cacheDel(k),
}));

const prisma = {
  streak: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
  },
  userProgress: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(prisma)),
} as any;

describe('StreakService', () => {
  const service = new StreakService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('getUserStreaks returns from cache', async () => {
    const userId = 'u1';
    const key = `user_streaks:${userId}:all`;
    const data = [{ id: 's1', userId, type: StreakType.DAILY_LOGIN }];
    cache.set(key, data);
    const res = await service.getUserStreaks(userId);
    expect(res.success).toBe(true);
    expect(res.data).toEqual(data);
    expect(prisma.streak.findMany).not.toHaveBeenCalled();
  });

  it('updateStreak creates new streak if none exists', async () => {
    const userId = 'u2';
    prisma.streak.findUnique.mockResolvedValueOnce(null);
    prisma.streak.create.mockResolvedValueOnce({ id: 's2', userId, type: StreakType.DAILY_LOGIN, currentCount: 1, longestCount: 1 });
    const res = await service.updateStreak(userId, StreakType.DAILY_LOGIN, new Date());
    expect(res.success).toBe(true);
    expect(prisma.streak.create).toHaveBeenCalled();
    expect(cacheDel).toHaveBeenCalledWith(`user_streaks:${userId}:all`);
  });

  it('freezeStreak increments freeze count until limit', async () => {
    const userId = 'u3';
    prisma.streak.findUnique.mockResolvedValueOnce({ id: 's3', userId, type: StreakType.DAILY_LOGIN, freezeCount: 0 });
    prisma.streak.update.mockResolvedValueOnce({ id: 's3', freezeCount: 1 });
    const res = await service.freezeStreak(userId, StreakType.DAILY_LOGIN);
    expect(res.success).toBe(true);
    expect(prisma.streak.update).toHaveBeenCalled();
  });
});


