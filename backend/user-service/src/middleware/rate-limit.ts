import { Request, Response, NextFunction } from "express";
import { getCacheService } from "../config/redis";
import { logger } from "../config/logger";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: Request) => string;
}

/**
 * Redis-backed rate limiter for distributed systems
 */
export class RedisRateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: "Too many requests, please try again later",
      skipSuccessfulRequests: false,
      keyGenerator: (req: Request) => req.ip || "unknown",
      ...config,
    };
  }

  middleware() {
    return async (
      req: Request,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const key = this.config.keyGenerator!(req);
        const cacheKey = `ratelimit:${key}:${req.path}`;
        const cacheService = getCacheService();

        // Get current count
        const current = await cacheService.get<number>(cacheKey);
        const count = current || 0;

        // Check if limit exceeded
        if (count >= this.config.maxRequests) {
          const ttl = await cacheService.getTTL(cacheKey);
          const retryAfter = ttl > 0 ? ttl : this.config.windowMs / 1000;

          logger.warn("Rate limit exceeded", {
            key,
            path: req.path,
            count,
            limit: this.config.maxRequests,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
          });

          res.set({
            "X-RateLimit-Limit": this.config.maxRequests.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": new Date(
              Date.now() + retryAfter * 1000
            ).toISOString(),
            "Retry-After": retryAfter.toString(),
          });

          res.status(429).json({
            success: false,
            message: this.config.message,
            error: "RATE_LIMIT_EXCEEDED",
            retryAfter,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Increment counter
        const newCount = count + 1;
        const ttl = count === 0 ? this.config.windowMs / 1000 : undefined;
        await cacheService.set(cacheKey, newCount, ttl);

        // Set rate limit headers
        res.set({
          "X-RateLimit-Limit": this.config.maxRequests.toString(),
          "X-RateLimit-Remaining": Math.max(
            0,
            this.config.maxRequests - newCount
          ).toString(),
          "X-RateLimit-Reset": new Date(
            Date.now() + this.config.windowMs
          ).toISOString(),
        });

        // If configured, decrement on successful response
        if (this.config.skipSuccessfulRequests) {
          const originalSend = res.send;
          res.send = function (data) {
            if (res.statusCode < 400) {
              cacheService.decrement(cacheKey).catch((err) => {
                logger.error("Failed to decrement rate limit", {
                  error: err.message,
                });
              });
            }
            return originalSend.call(this, data);
          };
        }

        next();
      } catch (error) {
        logger.error("Rate limiter error", { error: error.message });
        // Fail open - allow request if rate limiter fails
        next();
      }
    };
  }
}

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = new RedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: "Too many authentication attempts, please try again later",
  keyGenerator: (req: Request) => {
    // Rate limit by IP + email combination for login attempts
    const email = req.body?.email || "";
    return `${req.ip}:${email}`;
  },
}).middleware();

/**
 * Rate limiter for password reset requests
 */
export const passwordResetRateLimiter = new RedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 attempts per hour
  message: "Too many password reset requests, please try again later",
  keyGenerator: (req: Request) => {
    const email = req.body?.email || "";
    return `${req.ip}:${email}`;
  },
}).middleware();

/**
 * Rate limiter for registration
 */
export const registrationRateLimiter = new RedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 registrations per hour per IP
  message: "Too many registration attempts, please try again later",
}).middleware();

/**
 * General API rate limiter
 */
export const apiRateLimiter = new RedisRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  skipSuccessfulRequests: false,
}).middleware();

/**
 * Strict rate limiter for sensitive operations
 */
export const sensitiveOperationRateLimiter = new RedisRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 operations per hour
  message: "Too many sensitive operations, please try again later",
}).middleware();
