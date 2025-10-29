process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Silence logger during tests
jest.mock('./src/utils/logger', () => {
  const noOp = () => {};
  return {
    logger: { debug: noOp, info: noOp, warn: noOp, error: noOp },
  };
});


