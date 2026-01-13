import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import "express-async-errors";

import { config } from "./config";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";
import {
  logger,
  morganStream,
  requestLogger,
  errorLogger,
} from "./config/logger";
import { corsMiddleware, rateLimit } from "./middleware/auth";
import passport from "./config/passport";
import routes from "./routes";

// Middleware functions
const securityHeaders = (req: any, res: any, next: any) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
};

const requestId = (req: any, res: any, next: any) => {
  req.id = Math.random().toString(36).substr(2, 9);
  next();
};

const notFound = (req: any, res: any) => {
  res.status(404).json({ message: "Route not found" });
};

const errorHandler = (err: any, req: any, res: any, next: any) => {
  logger.error("Error:", err);
  res.status(500).json({ message: "Internal server error" });
};

// Create Express app
const app = express();

// Trust proxy (for rate limiting and IP detection)
app.set("trust proxy", 1);

// Security middleware with comprehensive headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind requires unsafe-inline
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          process.env.API_BASE_URL || "http://localhost:8000",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        upgradeInsecureRequests:
          process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },
    permissionsPolicy: {
      features: {
        geolocation: ["'none'"],
        microphone: ["'none'"],
        camera: ["'none'"],
        payment: ["'none'"],
      },
    },
  })
);
app.use(securityHeaders);
app.use(corsMiddleware);

// Request ID middleware
app.use(requestId);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Initialize Passport for OAuth
app.use(passport.initialize());

// Logging middleware
app.use(morgan("combined", { stream: morganStream }));
app.use(requestLogger);

// Rate limiting middleware - use Redis-backed rate limiter
import { apiRateLimiter } from "./middleware/rate-limit";
app.use(apiRateLimiter);

// CSRF token endpoint (before protection)
import { getCSRFToken, csrfProtection } from "./middleware/csrf";
app.get(`/api/${config.apiVersion}/csrf-token`, getCSRFToken);

// API routes with CSRF protection
app.use(`/api/${config.apiVersion}`, csrfProtection, routes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    // Disconnect from Kafka (no-op in this build context)
    try {
      const { disconnectKafka } = await import("./utils/events");
      await disconnectKafka();
      logger.info("Kafka connections closed");
    } catch (error) {
      logger.warn("Error disconnecting Kafka (non-fatal)", {
        error: (error as any).message,
      });
    }

    // Disconnect from databases
    await disconnectDatabase();
    await disconnectRedis();

    logger.info("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error: error.message });
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
const startServer = async () => {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Initialize Kafka producer if enabled
    if (process.env.ENABLE_KAFKA === "true") {
      try {
        const { getProducer } = await import("./utils/events");
        await getProducer();
        logger.info("Kafka producer connected");
      } catch (error) {
        logger.warn("Failed to connect Kafka producer (non-fatal)", {
          error: (error as any).message,
        });
      }
    }

    // Start HTTP server
    const server = app.listen(config.port, () => {
      logger.info(`User Service started on port ${config.port}`, {
        port: config.port,
        environment: config.nodeEnv,
        version: process.env.npm_package_version || "1.0.0",
      });
    });

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      const bind =
        typeof config.port === "string"
          ? "Pipe " + config.port
          : "Port " + config.port;

      switch (error.code) {
        case "EACCES":
          logger.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          logger.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    return server;
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

// Start the server
(async () => {
  const server = await startServer();
})();

// Export app for testing
export default app;
