import { LeaderboardService } from './leaderboard.service';
import { LeaderboardPeriod } from '../types';

const cache = new Map<string, string>();
jest.mock('../config/redis', () => ({
  cacheGet: async (k: string) => { const v = cache.get(k); return v ? JSON.parse(v) : null; },
  cacheSet: async (k: string, v: any, _ttl?: number) => { cache.set(k, JSON.stringify(v)); return true; },
  cacheDel: async (_k: string) => true,
}));

const prisma = {
  userProgress: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  leaderboard: {
    deleteMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(prisma)),
} as any;

describe('LeaderboardService', () => {
  const service = new LeaderboardService(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
    cache.clear();
  });

  it('computes leaderboard and caches it', async () => {
    const now = new Date();
    prisma.userProgress.findMany.mockResolvedValueOnce([
      { userId: 'u1', totalXp: 100, currentLevel: 2, streakCount: 1, charactersMastered: 1, achievementsCount: 0,
        xpTransactions: [{ amount: 50 }], characterMastery: [{ masteryLevel: 'MASTERED', lastPracticed: now, accuracyScore: 0.9 }], achievements: [], streaks: [] },
      { userId: 'u2', totalXp: 80, currentLevel: 1, streakCount: 0, charactersMastered: 0, achievementsCount: 0,
        xpTransactions: [{ amount: 20 }], characterMastery: [], achievements: [], streaks: [] },
    ]);
    const res = await service.getLeaderboard(LeaderboardPeriod.DAILY, 10, 0);
    expect(res.success).toBe(true);
    expect(res.data?.entries.length).toBeGreaterThan(0);
  });

  it('returns user rank and caches it', async () => {
    const now = new Date();
    prisma.userProgress.findUnique.mockResolvedValueOnce({
      userId: 'u1', totalXp: 100, currentLevel: 2, streakCount: 1, charactersMastered: 1,
      achievementsCount: 0, xpTransactions: [{ amount: 50 }], characterMastery: [{ masteryLevel: 'MASTERED', lastPracticed: now, accuracyScore: 0.9 }], achievements: [], streaks: []
    });
    prisma.userProgress.findMany.mockResolvedValueOnce([
      { userId: 'u1', currentLevel: 2, streakCount: 1, xpTransactions: [{ amount: 50 }], characterMastery: [{ masteryLevel: 'MASTERED', lastPracticed: now, accuracyScore: 0.9 }], achievements: [], streaks: [] },
      { userId: 'u2', currentLevel: 1, streakCount: 0, xpTransactions: [{ amount: 20 }], characterMastery: [], achievements: [], streaks: [] }
    ]);
    const res = await service.getUserRank('u1', LeaderboardPeriod.DAILY);
    expect(res.success).toBe(true);
    expect(res.data?.rank).toBeGreaterThan(0);
  });
});


