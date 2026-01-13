import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { getCacheService } from "../config/redis";
import { logger } from "../config/logger";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_EXPIRY = 3600; // 1 hour

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

/**
 * Middleware to generate and attach CSRF token to session
 */
export const csrfTokenGenerator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || req.ip;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: "Session ID required",
        error: "INVALID_SESSION",
      });
      return;
    }

    // Generate new CSRF token
    const csrfToken = generateCSRFToken();
    const cacheKey = `csrf:${sessionId}`;

    // Store in Redis
    const cacheService = getCacheService();
    await cacheService.set(cacheKey, csrfToken, CSRF_TOKEN_EXPIRY);

    // Attach to response
    res.locals.csrfToken = csrfToken;

    next();
  } catch (error) {
    logger.error("CSRF token generation failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to generate CSRF token",
      error: "INTERNAL_ERROR",
    });
  }
};

/**
 * Middleware to validate CSRF token
 */
export const csrfProtection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  try {
    const sessionId = (req.headers["x-session-id"] as string) || req.ip;
    const csrfToken = (req.headers["x-csrf-token"] as string) || req.body._csrf;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: "Session ID required",
        error: "INVALID_SESSION",
      });
      return;
    }

    if (!csrfToken) {
      logger.warn("CSRF token missing", {
        ip: req.ip,
        url: req.url,
        method: req.method,
      });

      res.status(403).json({
        success: false,
        message: "CSRF token required",
        error: "CSRF_TOKEN_MISSING",
      });
      return;
    }

    // Retrieve stored token from Redis
    const cacheKey = `csrf:${sessionId}`;
    const cacheService = getCacheService();
    const storedToken = await cacheService.get<string>(cacheKey);

    if (!storedToken) {
      logger.warn("CSRF token expired or not found", {
        ip: req.ip,
        url: req.url,
        sessionId,
      });

      res.status(403).json({
        success: false,
        message: "CSRF token expired or invalid",
        error: "CSRF_TOKEN_INVALID",
      });
      return;
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = crypto.timingSafeEqual(
      Buffer.from(csrfToken),
      Buffer.from(storedToken)
    );

    if (!isValid) {
      logger.warn("CSRF token mismatch", {
        ip: req.ip,
        url: req.url,
        sessionId,
      });

      res.status(403).json({
        success: false,
        message: "Invalid CSRF token",
        error: "CSRF_TOKEN_INVALID",
      });
      return;
    }

    // Token is valid, proceed
    next();
  } catch (error) {
    logger.error("CSRF validation failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "CSRF validation error",
      error: "INTERNAL_ERROR",
    });
  }
};

/**
 * Endpoint to get CSRF token
 */
export const getCSRFToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const sessionId = (req.headers["x-session-id"] as string) || req.ip;

    if (!sessionId) {
      res.status(400).json({
        success: false,
        message: "Session ID required",
        error: "INVALID_SESSION",
      });
      return;
    }

    const csrfToken = generateCSRFToken();
    const cacheKey = `csrf:${sessionId}`;

    const cacheService = getCacheService();
    await cacheService.set(cacheKey, csrfToken, CSRF_TOKEN_EXPIRY);

    res.status(200).json({
      success: true,
      data: {
        csrfToken,
        expiresIn: CSRF_TOKEN_EXPIRY,
      },
    });
  } catch (error) {
    logger.error("Failed to generate CSRF token", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to generate CSRF token",
      error: "INTERNAL_ERROR",
    });
  }
};
