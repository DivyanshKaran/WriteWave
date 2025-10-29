import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { logger, securityLogger } from './logger';
import { AuthenticationError, RateLimitError } from './errors';

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  bcrypt: {
    rounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
  };
  helmet: {
    contentSecurityPolicy: boolean;
    crossOriginEmbedderPolicy: boolean;
    crossOriginOpenerPolicy: boolean;
    crossOriginResourcePolicy: boolean;
    dnsPrefetchControl: boolean;
    frameguard: boolean;
    hidePoweredBy: boolean;
    hsts: boolean;
    ieNoOpen: boolean;
    noSniff: boolean;
    originAgentCluster: boolean;
    permittedCrossDomainPolicies: boolean;
    referrerPolicy: boolean;
    xssFilter: boolean;
  };
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production',
    refreshExpiresIn: '7d',
    issuer: 'writewave',
    audience: 'writewave-users'
  },
  bcrypt: {
    rounds: 12
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-Auth-Token',
      'X-User-ID',
      'X-User-Role',
      'X-Service',
      'X-Version',
      'X-Request-ID'
    ]
  },
  helmet: {
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    dnsPrefetchControl: true,
    frameguard: true,
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: true,
    referrerPolicy: true,
    xssFilter: true
  }
};

/**
 * Password utilities
 */
export class PasswordUtils {
  /**
   * Hash a password
   */
  static async hash(password: string, rounds: number = defaultSecurityConfig.bcrypt.rounds): Promise<string> {
    try {
      return await bcrypt.hash(password, rounds);
    } catch (error) {
      logger.error('Password hashing failed', { error: error.message });
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Compare password with hash
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Password comparison failed', { error: error.message });
      throw new Error('Password comparison failed');
    }
  }

  /**
   * Validate password strength
   */
  static validateStrength(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Password must contain lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Password must contain uppercase letters');

    if (/\d/.test(password)) score += 1;
    else feedback.push('Password must contain numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
    else feedback.push('Password must contain special characters');

    // Common patterns check
    if (/(.)\1{2,}/.test(password)) {
      feedback.push('Password should not contain repeated characters');
      score -= 1;
    }

    if (/123|abc|qwe/i.test(password)) {
      feedback.push('Password should not contain common sequences');
      score -= 1;
    }

    return {
      isValid: score >= 4 && password.length >= 8,
      score: Math.max(0, Math.min(5, score)),
      feedback
    };
  }

  /**
   * Generate secure random password
   */
  static generate(length: number = 16): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

/**
 * JWT utilities
 */
export class JWTUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Record<string, any>, config: SecurityConfig = defaultSecurityConfig): string {
    try {
      return jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });
    } catch (error) {
      logger.error('JWT access token generation failed', { error: error.message });
      throw new Error('Token generation failed');
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Record<string, any>, config: SecurityConfig = defaultSecurityConfig): string {
    try {
      return jwt.sign(payload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });
    } catch (error) {
      logger.error('JWT refresh token generation failed', { error: error.message });
      throw new Error('Refresh token generation failed');
    }
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string, config: SecurityConfig = defaultSecurityConfig): any {
    try {
      return jwt.verify(token, config.jwt.secret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });
    } catch (error) {
      logger.warn('JWT access token verification failed', { error: error.message });
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string, config: SecurityConfig = defaultSecurityConfig): any {
    try {
      return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience
      });
    } catch (error) {
      logger.warn('JWT refresh token verification failed', { error: error.message });
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.warn('JWT token decode failed', { error: error.message });
      return null;
    }
  }
}

/**
 * Crypto utilities
 */
export class CryptoUtils {
  /**
   * Generate secure random string
   */
  static randomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure random bytes
   */
  static randomBytes(length: number = 32): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Hash data with SHA-256
   */
  static sha256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash data with SHA-512
   */
  static sha512(data: string): string {
    return crypto.createHash('sha512').update(data).digest('hex');
  }

  /**
   * Generate HMAC signature
   */
  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Encrypt data with AES-256-GCM
   */
  static encrypt(data: string, key: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from('writewave', 'utf8'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Decrypt data with AES-256-GCM
   */
  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }, key: string): string {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAAD(Buffer.from('writewave', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimitUtils {
  /**
   * Create rate limiter middleware
   */
  static createLimiter(config: SecurityConfig = defaultSecurityConfig): any {
    return rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests,
      skipFailedRequests: config.rateLimit.skipFailedRequests,
      keyGenerator: (req: Request) => {
        return req.ip || 'unknown';
      },
      handler: (req: Request, res: Response) => {
        securityLogger.logViolation('rate_limit_exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });

        res.status(429).json({
          success: false,
          error: {
            name: 'RateLimitError',
            message: 'Too many requests, please try again later',
            statusCode: 429,
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil(config.rateLimit.windowMs / 1000)
          }
        });
      },
      standardHeaders: true,
      legacyHeaders: false
    });
  }

  /**
   * Create user-specific rate limiter
   */
  static createUserLimiter(maxRequests: number = 1000, windowMs: number = 15 * 60 * 1000): any {
    return rateLimit({
      windowMs,
      max: maxRequests,
      keyGenerator: (req: Request) => {
        return (req as any).user?.id || req.ip || 'unknown';
      },
      handler: (req: Request, res: Response) => {
        securityLogger.logViolation('user_rate_limit_exceeded', {
          userId: (req as any).user?.id,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });

        res.status(429).json({
          success: false,
          error: {
            name: 'RateLimitError',
            message: 'User rate limit exceeded',
            statusCode: 429,
            timestamp: new Date().toISOString(),
            retryAfter: Math.ceil(windowMs / 1000)
          }
        });
      }
    });
  }
}

/**
 * Security middleware
 */
export class SecurityMiddleware {
  /**
   * Create CORS middleware
   */
  static createCORS(config: SecurityConfig = defaultSecurityConfig): any {
    return cors({
      origin: config.cors.origin,
      credentials: config.cors.credentials,
      methods: config.cors.methods,
      allowedHeaders: config.cors.allowedHeaders,
      exposedHeaders: config.cors.exposedHeaders,
      optionsSuccessStatus: 200
    });
  }

  /**
   * Create Helmet middleware
   */
  static createHelmet(config: SecurityConfig = defaultSecurityConfig): any {
    return helmet({
      contentSecurityPolicy: config.helmet.contentSecurityPolicy ? {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      } : false,
      crossOriginEmbedderPolicy: config.helmet.crossOriginEmbedderPolicy,
      crossOriginOpenerPolicy: config.helmet.crossOriginOpenerPolicy,
      crossOriginResourcePolicy: config.helmet.crossOriginResourcePolicy,
      dnsPrefetchControl: config.helmet.dnsPrefetchControl,
      frameguard: config.helmet.frameguard,
      hidePoweredBy: config.helmet.hidePoweredBy,
      hsts: config.helmet.hsts,
      ieNoOpen: config.helmet.ieNoOpen,
      noSniff: config.helmet.noSniff,
      originAgentCluster: config.helmet.originAgentCluster,
      permittedCrossDomainPolicies: config.helmet.permittedCrossDomainPolicies,
      referrerPolicy: config.helmet.referrerPolicy,
      xssFilter: config.helmet.xssFilter
    });
  }

  /**
   * Request ID middleware
   */
  static requestId(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const requestId = req.get('X-Request-ID') || CryptoUtils.randomString(16);
      (req as any).id = requestId;
      res.setHeader('X-Request-ID', requestId);
      next();
    };
  }

  /**
   * Security headers middleware
   */
  static securityHeaders(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      next();
    };
  }

  /**
   * IP whitelist middleware
   */
  static ipWhitelist(allowedIPs: string[]): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const clientIP = req.ip || req.connection.remoteAddress;
      
      if (!clientIP || !allowedIPs.includes(clientIP)) {
        securityLogger.logViolation('ip_not_whitelisted', {
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          url: req.url,
          method: req.method
        });

        res.status(403).json({
          success: false,
          error: {
            name: 'AuthorizationError',
            message: 'Access denied from this IP address',
            statusCode: 403,
            timestamp: new Date().toISOString()
          }
        });
        return;
      }

      next();
    };
  }
}

/**
 * Input sanitization utilities
 */
export class SanitizationUtils {
  /**
   * Sanitize HTML content
   */
  static sanitizeHTML(html: string): string {
    // Basic HTML sanitization - in production, use a proper library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
      .replace(/<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi, '')
      .replace(/<meta\b[^<]*(?:(?!<\/meta>)<[^<]*)*<\/meta>/gi, '');
  }

  /**
   * Sanitize SQL injection attempts
   */
  static sanitizeSQL(input: string): string {
    return input
      .replace(/('|(\\')|(;)|(\-\-)|(\/\*)|(\*\/)|(\|)|(\*)|(\%)|(\+)|(\=)|(\<)|(\>)|(\[)|(\])|(\{)|(\})|(\()|(\))|(\^)|(\$)|(\?)|(\!)|(\@)|(\#)|(\&)|(\~)|(\`)|(\\)/g, '');
  }

  /**
   * Sanitize file path
   */
  static sanitizeFilePath(path: string): string {
    return path
      .replace(/\.\./g, '') // Remove directory traversal
      .replace(/[\/\\]/g, '_') // Replace path separators
      .replace(/[^a-zA-Z0-9._-]/g, ''); // Remove special characters
  }

  /**
   * Sanitize email
   */
  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Sanitize username
   */
  static sanitizeUsername(username: string): string {
    return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }
}

/**
 * Export utilities
 */
export const securityUtils = {
  password: PasswordUtils,
  jwt: JWTUtils,
  crypto: CryptoUtils,
  rateLimit: RateLimitUtils,
  middleware: SecurityMiddleware,
  sanitization: SanitizationUtils
};
