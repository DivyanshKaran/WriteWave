process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/writewave_users?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '10';

// Silence logger during tests
jest.mock('./src/config/logger', () => {
  const noOp = () => {};
  return {
    logger: { debug: noOp, info: noOp, warn: noOp, error: noOp },
    authLogger: noOp,
    userActionLogger: noOp,
  };
});


