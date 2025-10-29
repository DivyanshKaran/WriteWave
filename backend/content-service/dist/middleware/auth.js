"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.healthCheck = exports.requestId = exports.securityHeaders = exports.notFound = exports.errorHandler = exports.requestLogging = exports.corsMiddleware = exports.rateLimit = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../config/logger");
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required',
                error: 'UNAUTHORIZED',
                timestamp: new Date().toISOString()
            });
        }
        const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user'
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('JWT authentication failed', { error });
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token',
            error: 'UNAUTHORIZED',
            timestamp: new Date().toISOString()
        });
    }
};
exports.authenticateJWT = authenticateJWT;
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
            (0, logger_1.rateLimitLogger)(key, req.url, maxRequests);
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
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
    });
};
exports.healthCheck = healthCheck;
exports.authMiddleware = exports.authenticateJWT;
//# sourceMappingURL=auth.js.map