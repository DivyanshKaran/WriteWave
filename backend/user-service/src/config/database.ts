import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

// Prisma Client instance
export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

// Log Prisma events
prisma.$on("query", (e) => {
  if (process.env.NODE_ENV === "development") {
    logger.debug("Prisma Query", {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    });
  }
});

prisma.$on("error", (e) => {
  logger.error("Prisma Error", {
    message: e.message,
    target: e.target,
  });
});

prisma.$on("info", (e) => {
  logger.info("Prisma Info", {
    message: e.message,
    target: e.target,
  });
});

prisma.$on("warn", (e) => {
  logger.warn("Prisma Warning", {
    message: e.message,
    target: e.target,
  });
});

// Database connection function
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", { error });
    throw error;
  }
};

// Database disconnection function
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
  } catch (error) {
    logger.error("Database disconnection failed", { error });
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async (): Promise<{
  status: "connected" | "disconnected";
  responseTime?: number;
}> => {
  const startTime = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    return {
      status: "connected",
      responseTime,
    };
  } catch (error) {
    logger.error("Database health check failed", { error });
    return {
      status: "disconnected",
    };
  }
};

// Transaction helper
export const withTransaction = async <T>(
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> => {
  return await prisma.$transaction(callback);
};

// Whitelist of allowed models to prevent SQL injection
const ALLOWED_MODELS = [
  "user",
  "profile",
  "session",
  "device",
  "loginHistory",
] as const;
type AllowedModel = (typeof ALLOWED_MODELS)[number];

function isAllowedModel(model: string): model is AllowedModel {
  return ALLOWED_MODELS.includes(model as AllowedModel);
}

// Soft delete helper - SECURITY: Validates model name to prevent SQL injection
export const softDelete = async (model: string, id: string): Promise<void> => {
  // Validate model name to prevent SQL injection
  if (!isAllowedModel(model)) {
    throw new Error(
      `Invalid model: ${model}. Allowed models: ${ALLOWED_MODELS.join(", ")}`
    );
  }

  // Use Prisma's type-safe query builder instead of raw SQL
  const modelClient = (prisma as any)[model];
  if (!modelClient) {
    throw new Error(`Model ${model} not found in Prisma client`);
  }

  await modelClient.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
};

// Restore soft deleted record - SECURITY: Validates model name to prevent SQL injection
export const restoreSoftDelete = async (
  model: string,
  id: string
): Promise<void> => {
  // Validate model name to prevent SQL injection
  if (!isAllowedModel(model)) {
    throw new Error(
      `Invalid model: ${model}. Allowed models: ${ALLOWED_MODELS.join(", ")}`
    );
  }

  // Use Prisma's type-safe query builder instead of raw SQL
  const modelClient = (prisma as any)[model];
  if (!modelClient) {
    throw new Error(`Model ${model} not found in Prisma client`);
  }

  await modelClient.update({
    where: { id },
    data: {
      isActive: true,
      updatedAt: new Date(),
    },
  });
};

// Pagination helper
export const paginate = async <T>(
  model: any,
  page: number = 1,
  limit: number = 10,
  where: any = {},
  orderBy: any = { createdAt: "desc" }
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Search helper
export const search = async <T>(
  model: any,
  searchTerm: string,
  searchFields: string[],
  page: number = 1,
  limit: number = 10,
  orderBy: any = { createdAt: "desc" }
): Promise<{
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}> => {
  const skip = (page - 1) * limit;

  // Build search conditions
  const searchConditions = searchFields.map((field) => ({
    [field]: {
      contains: searchTerm,
      mode: "insensitive" as const,
    },
  }));

  const where = {
    OR: searchConditions,
  };

  const [data, total] = await Promise.all([
    model.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    model.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

// Cleanup expired records
export const cleanupExpiredRecords = async (): Promise<void> => {
  try {
    // Clean up expired email verifications
    await prisma.emailVerification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Clean up expired password resets
    await prisma.passwordReset.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Clean up expired refresh tokens
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Clean up expired sessions
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    logger.info("Expired records cleaned up successfully");
  } catch (error) {
    logger.error("Failed to cleanup expired records", { error });
    throw error;
  }
};

// Database statistics
export const getDatabaseStats = async (): Promise<{
  users: number;
  activeUsers: number;
  verifiedUsers: number;
  sessions: number;
  activeSessions: number;
}> => {
  try {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      totalSessions,
      activeSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isEmailVerified: true } }),
      prisma.session.count(),
      prisma.session.count({ where: { isActive: true } }),
    ]);

    return {
      users: totalUsers,
      activeUsers,
      verifiedUsers,
      sessions: totalSessions,
      activeSessions,
    };
  } catch (error) {
    logger.error("Failed to get database statistics", { error });
    throw error;
  }
};
