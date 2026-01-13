import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types";
import { jwtService } from "../utils/jwt";
import { prisma } from "../config/database";
import { logger, authLogger } from "../config/logger";

// Authentication middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      authLogger("token_missing", undefined, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.url,
      });

      res.status(401).json({
        success: false,
        message: "Access token required",
        error: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (!user) {
      authLogger("user_not_found", decoded.userId, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.url,
      });

      res.status(401).json({
        success: false,
        message: "User not found",
        error: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!user.isActive) {
      authLogger("user_inactive", user.id, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.url,
      });

      res.status(401).json({
        success: false,
        message: "Account is deactivated",
        error: "ACCOUNT_DEACTIVATED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user to request
    req.user = user;

    authLogger("token_verified", user.id, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
    });

    next();
  } catch (error) {
    authLogger("token_verification_failed", undefined, {
      error: error.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
    });

    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: "UNAUTHORIZED",
      timestamp: new Date().toISOString(),
    });
  }
};

// Optional authentication middleware
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      next();
      return;
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        profile: true,
        settings: true,
      },
    });

    if (user && user.isActive) {
      req.user = user;
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Email verification required middleware
export const requireEmailVerification = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
        error: "UNAUTHORIZED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    if (!req.user.isEmailVerified) {
      authLogger("email_not_verified", req.user.id, {
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        url: req.url,
      });

      res.status(403).json({
        success: false,
        message: "Email verification required",
        error: "EMAIL_NOT_VERIFIED",
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  } catch (error) {
    logger.error("Email verification check failed", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: "INTERNAL_ERROR",
      timestamp: new Date().toISOString(),
    });
  }
};

// User roles enum
export enum UserRole {
  USER = "user",
  MODERATOR = "moderator",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.USER]: 1,
  [UserRole.MODERATOR]: 2,
  [UserRole.ADMIN]: 3,
  [UserRole.SUPER_ADMIN]: 4,
};

/**
 * Check if user has required role or higher
 */
function hasRole(userRole: string, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as UserRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Middleware factory for role-based access control
 */
export const requireRole = (requiredRole: UserRole) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "UNAUTHORIZED",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Get user role from database or JWT payload
      const userRole = (req.user as any).role || UserRole.USER;

      if (!hasRole(userRole, requiredRole)) {
        authLogger("insufficient_permissions", req.user.id, {
          userRole,
          requiredRole,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
          url: req.url,
        });

        res.status(403).json({
          success: false,
          message: `${requiredRole} access required`,
          error: "FORBIDDEN",
          timestamp: new Date().toISOString(),
        });
        return;
      }

      // Log admin/moderator actions for audit trail
      if (requiredRole !== UserRole.USER) {
        authLogger("privileged_access", req.user.id, {
          role: userRole,
          action: `${req.method} ${req.url}`,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
      }

      next();
    } catch (error) {
      logger.error("Role check failed", { error: error.message });
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      });
    }
  };
};

// Convenience middleware for common roles
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole(UserRole.MODERATOR);
export const requireSuperAdmin = requireRole(UserRole.SUPER_ADMIN);

// Rate limiting middleware
export const rateLimit = (
  maxRequests: number = 100,
  windowMs: number = 900000
) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || "unknown";
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    // Get or create request data
    let requestData = requests.get(key);
    if (!requestData || requestData.resetTime < windowStart) {
      requestData = { count: 0, resetTime: now + windowMs };
      requests.set(key, requestData);
    }

    // Increment request count
    requestData.count++;

    // Check if limit exceeded
    if (requestData.count > maxRequests) {
      logger.warn("Rate limit exceeded", {
        ip: key,
        count: requestData.count,
        maxRequests,
        windowMs,
        url: req.url,
        userAgent: req.get("User-Agent"),
      });

      res.status(429).json({
        success: false,
        message: "Too many requests",
        error: "RATE_LIMIT_EXCEEDED",
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
      });
      return;
    }

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": Math.max(
        0,
        maxRequests - requestData.count
      ).toString(),
      "X-RateLimit-Reset": new Date(requestData.resetTime).toISOString(),
    });

    next();
  };
};

// CORS middleware
export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
    "http://localhost:3000",
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400"); // 24 hours

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};

// Request logging middleware
export const requestLogging = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;

    logger.info("HTTP Request", {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      userId: (req as AuthenticatedRequest).user?.id,
    });

    return originalSend.call(this, data);
  };

  next();
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error("Request error", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: (req as AuthenticatedRequest).user?.id,
  });

  // Default error response
  let statusCode = 500;
  let message = "Internal server error";
  let errorCode = "INTERNAL_ERROR";

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    message = "Validation error";
    errorCode = "VALIDATION_ERROR";
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized";
    errorCode = "UNAUTHORIZED";
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    message = "Forbidden";
    errorCode = "FORBIDDEN";
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
    message = "Not found";
    errorCode = "NOT_FOUND";
  } else if (error.name === "ConflictError") {
    statusCode = 409;
    message = "Conflict";
    errorCode = "CONFLICT";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    error: "NOT_FOUND",
    timestamp: new Date().toISOString(),
    path: req.url,
  });
};

// Security headers middleware
export const securityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
};

// Request ID middleware
export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId =
    (req.headers["x-request-id"] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  req.headers["x-request-id"] = requestId;
  res.setHeader("X-Request-ID", requestId);

  next();
};

// Health check middleware
export const healthCheck = (req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    version: process.env.npm_package_version || "1.0.0",
    timestamp: new Date().toISOString(),
  });
};
