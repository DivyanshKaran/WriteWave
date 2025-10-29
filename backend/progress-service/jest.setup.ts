process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/writewave_progress?schema=public';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret';

// Silence logger during tests
jest.mock('./src/config/logger', () => {
  const noOp = () => {};
  return {
    logger: { debug: noOp, info: noOp, warn: noOp, error: noOp },
  };
});


