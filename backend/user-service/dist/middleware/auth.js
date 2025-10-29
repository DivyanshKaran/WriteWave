"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = exports.requestId = exports.securityHeaders = exports.notFound = exports.errorHandler = exports.requestLogging = exports.corsMiddleware = exports.rateLimit = exports.requireAdmin = exports.requireEmailVerification = exports.optionalAuth = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            (0, logger_1.authLogger)('token_missing', undefined, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
            });
            res.status(401).json({
                success: false,
                message: 'Access token required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const decoded = jwt_1.jwtService.verifyAccessToken(token);
        const user = await database_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                profile: true,
                settings: true,
            },
        });
        if (!user) {
            (0, logger_1.authLogger)('user_not_found', decoded.userId, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
            });
            res.status(401).json({
                success: false,
                message: 'User not found',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!user.isActive) {
            (0, logger_1.authLogger)('user_inactive', user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
            });
            res.status(401).json({
                success: false,
                message: 'Account is deactivated',
                error: 'ACCOUNT_DEACTIVATED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        req.user = user;
        (0, logger_1.authLogger)('token_verified', user.id, {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
        });
        next();
    }
    catch (error) {
        (0, logger_1.authLogger)('token_verification_failed', undefined, {
            error: error.message,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            url: req.url,
        });
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: 'UNAUTHORIZED',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.authenticateToken = authenticateToken;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        const decoded = jwt_1.jwtService.verifyAccessToken(token);
        const user = await database_1.prisma.user.findUnique({
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
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireEmailVerification = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        if (!req.user.isEmailVerified) {
            (0, logger_1.authLogger)('email_not_verified', req.user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
            });
            res.status(403).json({
                success: false,
                message: 'Email verification required',
                error: 'EMAIL_NOT_VERIFIED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Email verification check failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.requireEmailVerification = requireEmailVerification;
const requireAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const isAdmin = req.user.email === 'admin@writewave.app';
        if (!isAdmin) {
            (0, logger_1.authLogger)('admin_access_denied', req.user.id, {
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                url: req.url,
            });
            res.status(403).json({
                success: false,
                message: 'Admin access required',
                error: 'FORBIDDEN',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        next();
    }
    catch (error) {
        logger_1.logger.error('Admin check failed', { error: error.message });
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString(),
        });
    }
};
exports.requireAdmin = requireAdmin;
const rateLimit = (maxRequests = 100, windowMs = 900000) => {
    const requests = new Map();
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        for (const [ip, data] of requests.entries()) {
            if (data.resetTime < windowStart) {
                requests.delete(ip);
            }
        }
        let requestData = requests.get(key);
        if (!requestData || requestData.resetTime < windowStart) {
            requestData = { count: 0, resetTime: now + windowMs };
            requests.set(key, requestData);
        }
        requestData.count++;
        if (requestData.count > maxRequests) {
            logger_1.logger.warn('Rate limit exceeded', {
                ip: key,
                count: requestData.count,
                maxRequests,
                windowMs,
                url: req.url,
                userAgent: req.get('User-Agent'),
            });
            res.status(429).json({
                success: false,
                message: 'Too many requests',
                error: 'RATE_LIMIT_EXCEEDED',
                timestamp: new Date().toISOString(),
                retryAfter: Math.ceil((requestData.resetTime - now) / 1000),
            });
            return;
        }
        res.set({
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count).toString(),
            'X-RateLimit-Reset': new Date(requestData.resetTime).toISOString(),
        });
        next();
    };
};
exports.rateLimit = rateLimit;
const corsMiddleware = (req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
};
exports.corsMiddleware = corsMiddleware;
const requestLogging = (req, res, next) => {
    const start = Date.now();
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - start;
        logger_1.logger.info('HTTP Request', {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            userId: req.user?.id,
        });
        return originalSend.call(this, data);
    };
    next();
};
exports.requestLogging = requestLogging;
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Request error', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
    });
    let statusCode = 500;
    let message = 'Internal server error';
    let errorCode = 'INTERNAL_ERROR';
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        errorCode = 'VALIDATION_ERROR';
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
        errorCode = 'UNAUTHORIZED';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
        errorCode = 'FORBIDDEN';
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Not found';
        errorCode = 'NOT_FOUND';
    }
    else if (error.name === 'ConflictError') {
        statusCode = 409;
        message = 'Conflict';
        errorCode = 'CONFLICT';
    }
    res.status(statusCode).json({
        success: false,
        message,
        error: errorCode,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        error: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.url,
    });
};
exports.notFound = notFound;
const securityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
};
exports.securityHeaders = securityHeaders;
const requestId = (req, res, next) => {
    const requestId = req.headers['x-request-id'] ||
        `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
};
exports.requestId = requestId;
const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'ok',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
    });
};
exports.healthCheck = healthCheck;
//# sourceMappingURL=auth.js.map