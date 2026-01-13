import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import compression from "compression";
import dotenv from "dotenv";
import { apiRoutes } from "./routes";
import { logger, requestLogger } from "./utils/logger";
import { ensureUploadDir } from "./middleware/uploads";

// Load environment variables
dotenv.config();

const app = express();
ensureUploadDir();
const PORT = process.env["PORT"] || 8007;

// Security middleware with comprehensive headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: [
          "'self'",
          process.env.API_BASE_URL || "http://localhost:8000",
        ],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (
      process.env["CORS_ORIGIN"] ||
      process.env["FRONTEND_URL"] ||
      "http://localhost:3000"
    ).split(","),
    credentials: process.env["CORS_CREDENTIALS"] === "true",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Compression middleware
app.use(compression());

// Logging middleware
const logsDir = path.resolve(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
if (process.env["NODE_ENV"] === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", apiRoutes);

// Root endpoint
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "WriteWave Articles Service",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("*", (_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Endpoint not found",
      code: "NOT_FOUND",
    },
  });
});

// Global error handler
app.use(
  (
    error: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Global Error Handler:", error);

    // Don't leak error details in production
    const isDevelopment = process.env["NODE_ENV"] === "development";

    res.status(error.status || 500).json({
      success: false,
      error: {
        message: isDevelopment ? error.message : "Internal server error",
        code: error.code || "INTERNAL_ERROR",
        ...(isDevelopment && { stack: error.stack }),
      },
    });
  }
);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  try {
    const { disconnectKafka } = await import("../../shared/utils/kafka");
    await disconnectKafka();
    logger.info("Kafka connections closed");
  } catch (error) {
    logger.warn("Error disconnecting Kafka (non-fatal)", {
      error: (error as any).message,
    });
  }
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Initialize Kafka producer if enabled
const initializeKafka = async () => {
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
};

// Start server
app.listen(PORT, async () => {
  logger.info(`Articles Service running on port ${PORT}`, {
    port: PORT,
    environment: process.env["NODE_ENV"] || "development",
  });
  await initializeKafka();
});

export default app;
