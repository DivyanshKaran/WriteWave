import { userService } from './user.service';

// In-memory cache mock
const cacheStore = new Map<string, any>();
const cacheMock = {
  get: jest.fn((key: string) => Promise.resolve(cacheStore.get(key)) as any),
  set: jest.fn((key: string, value: any) => {
    cacheStore.set(key, value);
    return Promise.resolve();
  }) as any,
  del: jest.fn((key: string) => {
    cacheStore.delete(key);
    return Promise.resolve();
  }) as any,
};

jest.mock('../config/redis', () => ({
  getCacheService: () => cacheMock,
}));

// Prisma mock shape with used methods only
const prismaMock = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  userProfile: {
    upsert: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
  userSettings: {
    findUnique: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
  refreshToken: { deleteMany: jest.fn(), count: jest.fn() },
  emailVerification: { deleteMany: jest.fn(), count: jest.fn() },
  passwordReset: { deleteMany: jest.fn(), count: jest.fn() },
  session: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn((fn: any) => fn(prismaMock)),
};

jest.mock('../config/database', () => ({ prisma: prismaMock }));

const publishMock = jest.fn();
jest.mock('../utils/events', () => ({
  publish: (...args: any[]) => publishMock(...args),
  Topics: { USER_EVENTS: 'user.events' },
}));

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cacheStore.clear();
  });

  it('getUserProfile returns from cache when available', async () => {
    const userId = 'u1';
    const profile = { id: userId, email: 'a@b.com' };
    cacheStore.set(`user_profile:${userId}`, profile);

    const result = await userService.getUserProfile(userId);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(profile);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('getUserProfile fetches from DB and caches when not cached', async () => {
    const userId = 'u2';
    prismaMock.user.findUnique.mockResolvedValueOnce({
      id: userId,
      email: 'x@y.com',
      username: 'user',
      firstName: 'x',
      lastName: 'y',
      isEmailVerified: true,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: { bio: 'bio' },
      settings: { theme: 'dark' },
    });

    const result = await userService.getUserProfile(userId);
    expect(result.success).toBe(true);
    expect(cacheMock.set).toHaveBeenCalledWith(
      `user_profile:${userId}`,
      expect.objectContaining({ id: userId }),
      300
    );
  });

  it('getUserSettings creates default when not found', async () => {
    const userId = 'u3';
    prismaMock.userSettings.findUnique.mockResolvedValueOnce(null);
    prismaMock.userSettings.create.mockResolvedValueOnce({ userId, emailNotifications: true });

    const result = await userService.getUserSettings(userId);
    expect(result.success).toBe(true);
    expect(prismaMock.userSettings.create).toHaveBeenCalledWith({ data: { userId } });
  });

  it('updateUserSettings upserts and clears cache and publishes event', async () => {
    const userId = 'u4';
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: userId });
    prismaMock.userSettings.upsert.mockResolvedValueOnce({ userId, theme: 'dark' });

    const result = await userService.updateUserSettings(userId, { theme: 'dark' } as any);
    expect(result.success).toBe(true);
    expect(prismaMock.userSettings.upsert).toHaveBeenCalled();
    expect(cacheMock.del).toHaveBeenCalledWith(`user_settings:${userId}`);
    expect(publishMock).toHaveBeenCalledWith('user.events', userId, expect.any(Object));
  });
});


