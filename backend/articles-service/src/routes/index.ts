import { Router } from "express";
import { articlesRoutes } from "./articles.routes";
import { prisma } from "../models";
import { logger } from "../utils/logger";
import { createClient } from "redis";

const router = Router();

// Health check endpoint
router.get("/health", async (_req, res) => {
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
    // Redis check (if Redis URL is configured)
    if (process.env.REDIS_URL) {
      const redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      await redisClient.ping();
      await redisClient.disconnect();
      checks.redis = "healthy";
    } else {
      checks.redis = "not_configured";
    }
  } catch (error: any) {
    checks.redis = "unhealthy";
    logger.error("Redis health check failed", { error: error.message });
  }

  checks.latencyMs = Date.now() - start;
  const isHealthy =
    checks.database === "healthy" &&
    (checks.redis === "healthy" || checks.redis === "not_configured");
  const statusCode = isHealthy ? 200 : 503;

  res.status(statusCode).json({
    success: isHealthy,
    status: isHealthy ? "healthy" : "degraded",
    checks,
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API Documentation endpoint
router.get("/docs", (_req, res) => {
  res.json({
    success: true,
    message: "Articles Service API Documentation",
    endpoints: {
      health: "GET /health",
      articles: {
        create: "POST /articles",
        list: "GET /articles",
        get: "GET /articles/:id",
        update: "PUT /articles/:id",
        delete: "DELETE /articles/:id",
        like: "POST /articles/:id/like",
        bookmark: "POST /articles/:id/bookmark",
        trending: "GET /articles/trending",
        featured: "GET /articles/featured",
        user: "GET /articles/user/:userId",
        stats: "GET /articles/stats",
        userStats: "GET /articles/user/:userId/stats",
      },
      comments: {
        add: "POST /articles/:id/comments",
        get: "GET /articles/:id/comments",
      },
      tags: {
        popular: "GET /articles/tags/popular",
      },
    },
  });
});

// API routes
router.use("/articles", articlesRoutes);

export { router as apiRoutes };
