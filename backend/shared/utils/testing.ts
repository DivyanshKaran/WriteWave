import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { DatabaseError } from './errors';

/**
 * Test configuration interface
 */
export interface TestConfig {
  database: {
    url: string;
    resetOnStart?: boolean;
    seedOnStart?: boolean;
  };
  redis: {
    url: string;
    resetOnStart?: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  mockExternalServices?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Test data factory interface
 */
export interface TestDataFactory<T> {
  create(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

/**
 * Mock request interface
 */
export interface MockRequest extends Partial<Request> {
  body?: any;
  params?: any;
  query?: any;
  headers?: any;
  user?: any;
  ip?: string;
  method?: string;
  url?: string;
}

/**
 * Mock response interface
 */
export interface MockResponse extends Partial<Response> {
  status: jest.MockedFunction<any>;
  json: jest.MockedFunction<any>;
  send: jest.MockedFunction<any>;
  end: jest.MockedFunction<any>;
  setHeader: jest.MockedFunction<any>;
  getHeader: jest.MockedFunction<any>;
  locals: any;
}

/**
 * Test utilities class
 */
export class TestUtils {
  private static testConfig: TestConfig | null = null;
  private static testDatabase: PrismaClient | null = null;

  /**
   * Initialize test configuration
   */
  static initialize(config: TestConfig): void {
    this.testConfig = config;
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = config.logLevel || 'error';
    
    if (config.mockExternalServices) {
      process.env.MOCK_EXTERNAL_SERVICES = 'true';
    }
  }

  /**
   * Get test database instance
   */
  static getTestDatabase(): PrismaClient {
    if (!this.testDatabase) {
      if (!this.testConfig) {
        throw new Error('Test configuration not initialized');
      }
      
      this.testDatabase = new PrismaClient({
        datasources: {
          db: {
            url: this.testConfig.database.url
          }
        },
        log: ['error']
      });
    }
    
    return this.testDatabase;
  }

  /**
   * Reset test database
   */
  static async resetDatabase(): Promise<void> {
    if (!this.testDatabase || !this.testConfig) {
      return;
    }

    try {
      // Delete all data from all tables
      const tablenames = await this.testDatabase.$queryRaw<
        Array<{ tablename: string }>
      >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

      const tables = tablenames
        .map(({ tablename }) => tablename)
        .filter((name) => name !== '_prisma_migrations')
        .map((name) => `"public"."${name}"`)
        .join(', ');

      if (tables.length > 0) {
        await this.testDatabase.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
      }

      logger.info('Test database reset successfully');
    } catch (error) {
      logger.error('Failed to reset test database', { error: error.message });
      throw new DatabaseError('Failed to reset test database', error as Error);
    }
  }

  /**
   * Seed test database
   */
  static async seedDatabase(seedData: any): Promise<void> {
    if (!this.testDatabase) {
      return;
    }

    try {
      // Implement seeding logic based on your schema
      logger.info('Test database seeded successfully');
    } catch (error) {
      logger.error('Failed to seed test database', { error: error.message });
      throw new DatabaseError('Failed to seed test database', error as Error);
    }
  }

  /**
   * Cleanup test resources
   */
  static async cleanup(): Promise<void> {
    if (this.testDatabase) {
      await this.testDatabase.$disconnect();
      this.testDatabase = null;
    }
    
    this.testConfig = null;
  }
}

/**
 * Mock utilities for testing
 */
export class MockUtils {
  /**
   * Create mock request
   */
  static createMockRequest(overrides: MockRequest = {}): MockRequest {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      method: 'GET',
      url: '/',
      ip: '127.0.0.1',
      ...overrides
    };
  }

  /**
   * Create mock response
   */
  static createMockResponse(): MockResponse {
    const res: MockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      getHeader: jest.fn(),
      locals: {}
    };

    return res;
  }

  /**
   * Create mock next function
   */
  static createMockNext(): jest.MockedFunction<any> {
    return jest.fn();
  }

  /**
   * Mock external service calls
   */
  static mockExternalService(serviceName: string, mockImplementation: any): void {
    jest.mock(serviceName, () => mockImplementation);
  }

  /**
   * Mock database operations
   */
  static mockDatabaseOperation(operation: string, mockResult: any): void {
    const mockPrisma = {
      [operation]: jest.fn().mockResolvedValue(mockResult)
    };
    
    jest.mock('@prisma/client', () => ({
      PrismaClient: jest.fn().mockImplementation(() => mockPrisma)
    }));
  }
}

/**
 * Test data factories
 */
export class TestDataFactories {
  /**
   * User factory
   */
  static user: TestDataFactory<any> = {
    create: (overrides = {}) => ({
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      isEmailVerified: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),
    
    createMany: (count: number, overrides = {}) => {
      return Array.from({ length: count }, (_, index) => 
        this.user.create({
          id: `test-user-${index}`,
          email: `test${index}@example.com`,
          username: `testuser${index}`,
          ...overrides
        })
      );
    }
  };

  /**
   * Character factory
   */
  static character: TestDataFactory<any> = {
    create: (overrides = {}) => ({
      id: 'test-character-id',
      character: 'あ',
      type: 'HIRAGANA',
      pronunciation: 'a',
      meaning: 'hiragana a',
      strokeOrder: ['1', '2'],
      examples: ['あい', 'あお'],
      jlptLevel: 5,
      difficulty: 'BEGINNER',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),
    
    createMany: (count: number, overrides = {}) => {
      return Array.from({ length: count }, (_, index) => 
        this.character.create({
          id: `test-character-${index}`,
          character: String.fromCharCode(0x3042 + index), // Different hiragana characters
          ...overrides
        })
      );
    }
  };

  /**
   * Post factory
   */
  static post: TestDataFactory<any> = {
    create: (overrides = {}) => ({
      id: 'test-post-id',
      title: 'Test Post',
      content: 'This is a test post content',
      authorId: 'test-user-id',
      categoryId: 'test-category-id',
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }),
    
    createMany: (count: number, overrides = {}) => {
      return Array.from({ length: count }, (_, index) => 
        this.post.create({
          id: `test-post-${index}`,
          title: `Test Post ${index}`,
          ...overrides
        })
      );
    }
  };
}

/**
 * Test assertions utilities
 */
export class TestAssertions {
  /**
   * Assert response status
   */
  static assertStatus(res: MockResponse, expectedStatus: number): void {
    expect(res.status).toHaveBeenCalledWith(expectedStatus);
  }

  /**
   * Assert response JSON
   */
  static assertJson(res: MockResponse, expectedData: any): void {
    expect(res.json).toHaveBeenCalledWith(expectedData);
  }

  /**
   * Assert response contains field
   */
  static assertContains(res: MockResponse, field: string, expectedValue?: any): void {
    const calls = res.json.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    
    const responseData = calls[calls.length - 1][0];
    expect(responseData).toHaveProperty(field);
    
    if (expectedValue !== undefined) {
      expect(responseData[field]).toEqual(expectedValue);
    }
  }

  /**
   * Assert database record exists
   */
  static async assertRecordExists(
    prisma: PrismaClient,
    model: string,
    where: any
  ): Promise<void> {
    const record = await (prisma as any)[model].findUnique({ where });
    expect(record).toBeTruthy();
  }

  /**
   * Assert database record does not exist
   */
  static async assertRecordNotExists(
    prisma: PrismaClient,
    model: string,
    where: any
  ): Promise<void> {
    const record = await (prisma as any)[model].findUnique({ where });
    expect(record).toBeNull();
  }

  /**
   * Assert error was thrown
   */
  static assertErrorThrown(fn: () => any, expectedError?: any): void {
    if (expectedError) {
      expect(fn).toThrow(expectedError);
    } else {
      expect(fn).toThrow();
    }
  }

  /**
   * Assert async error was thrown
   */
  static async assertAsyncErrorThrown(
    fn: () => Promise<any>,
    expectedError?: any
  ): Promise<void> {
    if (expectedError) {
      await expect(fn()).rejects.toThrow(expectedError);
    } else {
      await expect(fn()).rejects.toThrow();
    }
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTestUtils {
  /**
   * Measure execution time
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{
    result: T;
    duration: number;
  }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    
    return { result, duration };
  }

  /**
   * Run performance test
   */
  static async runPerformanceTest(
    fn: () => Promise<any>,
    iterations: number = 100
  ): Promise<{
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
  }> {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const { duration } = await this.measureTime(fn);
      times.push(duration);
    }
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    return {
      averageTime,
      minTime,
      maxTime,
      totalTime
    };
  }
}

/**
 * Integration test utilities
 */
export class IntegrationTestUtils {
  /**
   * Setup test environment
   */
  static async setupTestEnvironment(config: TestConfig): Promise<void> {
    TestUtils.initialize(config);
    
    if (config.database.resetOnStart) {
      await TestUtils.resetDatabase();
    }
    
    if (config.database.seedOnStart) {
      await TestUtils.seedDatabase({});
    }
  }

  /**
   * Teardown test environment
   */
  static async teardownTestEnvironment(): Promise<void> {
    await TestUtils.cleanup();
  }

  /**
   * Run test with setup and teardown
   */
  static async runTest(
    config: TestConfig,
    testFn: () => Promise<void>
  ): Promise<void> {
    await this.setupTestEnvironment(config);
    
    try {
      await testFn();
    } finally {
      await this.teardownTestEnvironment();
    }
  }
}

/**
 * Export all test utilities
 */
export const testUtils = {
  TestUtils,
  MockUtils,
  TestDataFactories,
  TestAssertions,
  PerformanceTestUtils,
  IntegrationTestUtils
};
