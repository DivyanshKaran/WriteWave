import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import services and utilities
import { prisma } from "./models";
import { redis } from "./utils/redis";
import { logger, stream } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./utils/errors";
import { initializeWebSocket } from "./services/websocket.service";
import { userSyncService } from "./services/user-sync.service";

// Import routes
import routes from "./routes";

// Create Express app
const app = express();
const server = createServer(app);

// Initialize WebSocket
const webSocketService = initializeWebSocket(server);

// Trust proxy (for rate limiting behind reverse proxy)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(","),
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(morgan("combined", { stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Health check endpoint
app.get("/health", async (_req, res) => {
  const start = Date.now();
  const checks: {
    service: string;
    database: string;
    redis: string;
    latencyMs?: number;
  } = {
    service: "healthy",
    database: "unknown",
    redis: "unknown",
  };

  try {
    // Database check - use parameterized query
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "healthy";
  } catch (error: any) {
    checks.database = "unhealthy";
    logger.error("Database health check failed", { error: error.message });
  }

  try {
    // Redis check
    const pingResult = await redis.ping();
    checks.redis = pingResult ? "healthy" : "unhealthy";
  } catch (error: any) {
    checks.redis = "unhealthy";
    logger.error("Redis health check failed", { error: error.message });
  }

  checks.latencyMs = Date.now() - start;
  const isHealthy = checks.database === "healthy" && checks.redis === "healthy";
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isHealthy,
    status: isHealthy ? "healthy" : "degraded",
    checks,
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/community", routes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    server.close(() => {
      logger.info("HTTP server closed");
    });

    // Close WebSocket connections
    await webSocketService.cleanup();
    logger.info("WebSocket service cleaned up");

    // Stop user sync service
    try {
      await userSyncService.stop();
      logger.info("User sync service stopped");
    } catch (error) {
      logger.warn("Error stopping user sync service (non-fatal)", {
        error: (error as any).message,
      });
    }

    // Close Kafka connections
    try {
      const { disconnectKafka } = await import("../../shared/utils/kafka");
      await disconnectKafka();
      logger.info("Kafka connections closed");
    } catch (error) {
      logger.warn("Error disconnecting Kafka (non-fatal)", {
        error: (error as any).message,
      });
    }

    // Close Redis connection
    await redis.disconnect();
    logger.info("Redis connection closed");

    // Close Prisma connection
    await prisma.$disconnect();
    logger.info("Database connection closed");

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

// Start server
const PORT = parseInt(process.env.PORT || "8004", 10);
const HOST = process.env.HOST || "0.0.0.0";

const startServer = async () => {
  try {
    // Connect to Redis (optional gating)
    try {
      await redis.connect();
      logger.info("Connected to Redis");
    } catch (err: any) {
      if (process.env.OPTIONAL_REDIS === "true") {
        logger.warn("Redis optional: proceeding without Redis", {
          error: err?.message,
        });
      } else {
        throw err;
      }
    }

    // Test database connection
    await prisma.$connect();
    logger.info("Connected to database");

    // Initialize user sync service (Kafka consumer) if enabled
    if (process.env.ENABLE_KAFKA === "true") {
      logger.info("User sync service will be initialized (Kafka consumer)");
      // User sync service initializes itself via constructor
    }

    // Initialize Kafka producer if enabled
    if (process.env.ENABLE_KAFKA === "true") {
      try {
        const { getProducer } = await import("../../shared/utils/kafka");
        await getProducer();
        logger.info("Kafka producer connected");
      } catch (error) {
        logger.warn("Failed to connect Kafka producer (non-fatal)", {
          error: (error as any).message,
        });
      }
    }

    // Start HTTP server
    server.listen(PORT, HOST, () => {
      logger.info(`Community Service running on http://${HOST}:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`WebSocket enabled: true`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
