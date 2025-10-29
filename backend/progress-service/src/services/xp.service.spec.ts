import { XpService } from './xp.service';
import { XpSource } from '../types';

// Mock cache helpers
const cache = new Map<string, any>();
const cacheGet = jest.fn(async (k: string) => cache.get(k));
const cacheSet = jest.fn(async (k: string, v: any) => void cache.set(k, v));
const cacheDel = jest.fn(async (k: string) => void cache.delete(k));

jest.mock('../config/redis', () => ({
  cacheGet: (k: string) => cacheGet(k),
  cacheSet: (k: string, v: any, _ttl?: number) => cacheSet(k, v),
  cacheDel: (k: string) => cacheDel(k),
}));

// Minimal Prisma mock
const prisma = {
  userProgress: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  xpTransaction: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(prisma)),
} as any;

describe('XpService', () => {
  const service = new XpService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('calculateXp returns expected totals and description', () => {
    const res = service.calculateXp(XpSource.DAILY_STREAK);
    expect(res.baseXp).toBeGreaterThan(0);
    expect(res.totalXp).toBeGreaterThanOrEqual(res.baseXp);
    expect(typeof res.description).toBe('string');
  });

  it('getUserLevel returns cached value when present', async () => {
    const userId = 'u1';
    const levelInfo = { level: 3, name: 'Bronze', xpRequired: 100, xpToNext: 50, totalXp: 150, multiplier: 1.2, rewards: [] };
    cache.set(`user_level:${userId}`, levelInfo);

    const result = await service.getUserLevel(userId);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(levelInfo);
    expect(prisma.userProgress.findUnique).not.toHaveBeenCalled();
  });

  it('getUserLevel computes and caches when not cached', async () => {
    const userId = 'u2';
    prisma.userProgress.findUnique.mockResolvedValueOnce({ userId, totalXp: 250 });

    const result = await service.getUserLevel(userId);
    expect(result.success).toBe(true);
    expect(cacheSet).toHaveBeenCalledWith(`user_level:${userId}`, expect.any(Object));
  });

  it('addXp returns error when user progress missing', async () => {
    prisma.userProgress.findUnique.mockResolvedValueOnce(null);
    const result = await service.addXp('missing', XpSource.DAILY_LOGIN);
    expect(result.success).toBe(false);
    expect(result.error).toBe('USER_NOT_FOUND');
  });

  it('addXp creates transaction, updates progress, and clears cache', async () => {
    const userId = 'u3';
    prisma.userProgress.findUnique.mockResolvedValueOnce({
      userId,
      totalXp: 100,
      currentXp: 50,
      currentLevel: 1,
      levelName: 'Bronze',
      xpToNextLevel: 100,
    });
    prisma.xpTransaction.create.mockResolvedValueOnce({ id: 't1' });
    prisma.userProgress.update.mockResolvedValueOnce({ userId });

    const result = await service.addXp(userId, XpSource.DAILY_LOGIN);
    expect(result.success).toBe(true);
    expect(prisma.xpTransaction.create).toHaveBeenCalled();
    expect(prisma.userProgress.update).toHaveBeenCalled();
    expect(cacheDel).toHaveBeenCalledWith(`user_progress:${userId}`);
    expect(cacheDel).toHaveBeenCalledWith(`user_level:${userId}`);
  });
});


