process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Silence logger during tests
jest.mock('./src/config/logger', () => {
  const noOp = () => {};
  return { logger: { debug: noOp, info: noOp, warn: noOp, error: noOp } };
});


