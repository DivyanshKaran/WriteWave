import { CacheService } from './cache.service';

const store = new Map<string, string>();
const redisMock = {
  cacheSet: jest.fn(async (k: string, v: any, _ttl?: number) => { store.set(k, JSON.stringify(v)); return true; }),
  cacheGet: jest.fn(async <T>(k: string) => { const v = store.get(k); return v ? JSON.parse(v) as T : null; }),
  del: jest.fn(async (k: string) => { store.delete(k); return true; }),
  keys: jest.fn(async (pattern: string) => Array.from(store.keys()).filter(k => pattern === '*' || k.startsWith(pattern.replace('*','')))),
  delMultiple: jest.fn(async (keys: string[]) => { keys.forEach(k => store.delete(k)); return true; }),
  setSession: jest.fn(async (_id: string, _d: any, _ttl?: number) => true),
  getSession: jest.fn(async <T>(_id: string) => null as any as T),
  deleteSession: jest.fn(async (_id: string) => true),
  rateLimit: jest.fn(async (_k: string, limit: number, _w: number) => ({ allowed: true, remaining: limit - 1, resetTime: Date.now() + 1000 })),
  info: jest.fn(async () => 'used_memory_human:1MB\nconnected_clients:1\nuptime_in_seconds:10'),
  flushdb: jest.fn(async () => { store.clear(); return true; }),
};

jest.mock('../utils/redis', () => ({ redis: redisMock }));

describe('CacheService', () => {
  const service = new CacheService();

  beforeEach(() => {
    jest.clearAllMocks();
    store.clear();
  });

  it('caches and retrieves a user', async () => {
    const ok = await service.cacheUser({ id: 'u1', username: 'user' } as any);
    expect(ok).toBe(true);
    const u = await service.getCachedUser('u1');
    expect(u?.id).toBe('u1');
  });

  it('invalidates user-related keys', async () => {
    await service.cacheUser({ id: 'u2' } as any);
    const res = await service.invalidateUser('u2');
    expect(res).toBe(true);
  });

  it('caches leaderboard and reads it back', async () => {
    const entries = [{ userId: 'u1', score: 10 }];
    await service.cacheLeaderboard('xp' as any, entries, 'week', 'all');
    const cached = await service.getCachedLeaderboard('xp' as any, 'week', 'all');
    expect(cached?.length).toBe(1);
  });

  it('returns cache stats', async () => {
    const stats = await service.getCacheStats();
    expect(stats).toHaveProperty('totalKeys');
  });
});


