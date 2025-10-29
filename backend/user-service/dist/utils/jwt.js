"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = exports.extractToken = exports.validateToken = exports.jwtService = exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const logger_1 = require("../config/logger");
class JWTService {
    constructor() {
        this.secret = config_1.config.jwt.secret;
        this.refreshSecret = config_1.config.jwt.refreshSecret;
        this.expiresIn = config_1.config.jwt.expiresIn;
        this.refreshExpiresIn = config_1.config.jwt.refreshExpiresIn;
    }
    generateAccessToken(payload) {
        try {
            const tokenPayload = {
                ...payload,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.expiresIn),
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, this.secret, {
                algorithm: 'HS256',
                issuer: 'writewave',
                audience: 'writewave-users',
            });
            logger_1.logger.debug('Access token generated', { userId: payload.userId });
            return token;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate access token', { error, userId: payload.userId });
            throw new Error('Token generation failed');
        }
    }
    generateRefreshToken(payload) {
        try {
            const tokenPayload = {
                ...payload,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.refreshExpiresIn),
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, this.refreshSecret, {
                algorithm: 'HS256',
                issuer: 'writewave',
                audience: 'writewave-users',
            });
            logger_1.logger.debug('Refresh token generated', { userId: payload.userId, tokenId: payload.tokenId });
            return token;
        }
        catch (error) {
            logger_1.logger.error('Failed to generate refresh token', { error, userId: payload.userId });
            throw new Error('Refresh token generation failed');
        }
    }
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secret, {
                algorithms: ['HS256'],
                issuer: 'writewave',
                audience: 'writewave-users',
            });
            logger_1.logger.debug('Access token verified', { userId: decoded.userId });
            return decoded;
        }
        catch (error) {
            logger_1.logger.warn('Access token verification failed', { error: error.message });
            throw new Error('Invalid or expired token');
        }
    }
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.refreshSecret, {
                algorithms: ['HS256'],
                issuer: 'writewave',
                audience: 'writewave-users',
            });
            logger_1.logger.debug('Refresh token verified', { userId: decoded.userId, tokenId: decoded.tokenId });
            return decoded;
        }
        catch (error) {
            logger_1.logger.warn('Refresh token verification failed', { error: error.message });
            throw new Error('Invalid or expired refresh token');
        }
    }
    decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            logger_1.logger.error('Failed to decode token', { error });
            return null;
        }
    }
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        }
        catch (error) {
            logger_1.logger.error('Failed to get token expiration', { error });
            return null;
        }
    }
    isTokenExpired(token) {
        try {
            const expiration = this.getTokenExpiration(token);
            if (!expiration)
                return true;
            return expiration < new Date();
        }
        catch (error) {
            logger_1.logger.error('Failed to check token expiration', { error });
            return true;
        }
    }
    getTimeUntilExpiration(token) {
        try {
            const expiration = this.getTokenExpiration(token);
            if (!expiration)
                return 0;
            return Math.max(0, expiration.getTime() - Date.now());
        }
        catch (error) {
            logger_1.logger.error('Failed to get time until expiration', { error });
            return 0;
        }
    }
    generateTokenPair(userId, email, refreshTokenId) {
        try {
            const accessToken = this.generateAccessToken({ userId, email });
            const refreshToken = this.generateRefreshToken({ userId, tokenId: refreshTokenId });
            logger_1.logger.info('Token pair generated', { userId });
            return { accessToken, refreshToken };
        }
        catch (error) {
            logger_1.logger.error('Failed to generate token pair', { error, userId });
            throw new Error('Token pair generation failed');
        }
    }
    refreshAccessToken(refreshToken, newRefreshTokenId) {
        try {
            const decoded = this.verifyRefreshToken(refreshToken);
            const accessToken = this.generateAccessToken({
                userId: decoded.userId,
                email: '',
            });
            const newRefreshToken = this.generateRefreshToken({
                userId: decoded.userId,
                tokenId: newRefreshTokenId,
            });
            logger_1.logger.info('Access token refreshed', { userId: decoded.userId });
            return { accessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            logger_1.logger.error('Failed to refresh access token', { error });
            throw new Error('Token refresh failed');
        }
    }
    parseExpiresIn(expiresIn) {
        const unit = expiresIn.slice(-1);
        const value = parseInt(expiresIn.slice(0, -1), 10);
        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 24 * 60 * 60;
            default:
                return parseInt(expiresIn, 10) || 3600;
        }
    }
    validateTokenFormat(token) {
        try {
            if (!token || typeof token !== 'string')
                return false;
            const parts = token.split('.');
            if (parts.length !== 3)
                return false;
            parts.forEach(part => {
                if (!/^[A-Za-z0-9_-]+$/.test(part)) {
                    throw new Error('Invalid token format');
                }
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    extractTokenFromHeader(authHeader) {
        try {
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return null;
            }
            const token = authHeader.substring(7);
            if (!this.validateTokenFormat(token)) {
                return null;
            }
            return token;
        }
        catch (error) {
            logger_1.logger.error('Failed to extract token from header', { error });
            return null;
        }
    }
    getTokenInfo(token) {
        try {
            const isValid = this.validateTokenFormat(token);
            if (!isValid) {
                return { isValid: false, isExpired: true };
            }
            const isExpired = this.isTokenExpired(token);
            const expiration = this.getTokenExpiration(token);
            const timeUntilExpiration = this.getTimeUntilExpiration(token);
            const payload = this.decodeToken(token);
            return {
                isValid,
                isExpired,
                expiration,
                timeUntilExpiration,
                payload,
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get token info', { error });
            return { isValid: false, isExpired: true };
        }
    }
}
exports.JWTService = JWTService;
exports.jwtService = new JWTService();
const validateToken = (token) => {
    try {
        return exports.jwtService.validateTokenFormat(token) && !exports.jwtService.isTokenExpired(token);
    }
    catch (error) {
        return false;
    }
};
exports.validateToken = validateToken;
const extractToken = (authHeader) => {
    return exports.jwtService.extractTokenFromHeader(authHeader);
};
exports.extractToken = extractToken;
const generateAccessToken = (userId, email) => {
    return exports.jwtService.generateAccessToken({ userId, email });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, tokenId) => {
    return exports.jwtService.generateRefreshToken({ userId, tokenId });
};
exports.generateRefreshToken = generateRefreshToken;
const generateTokenPair = (userId, email, refreshTokenId) => {
    return exports.jwtService.generateTokenPair(userId, email, refreshTokenId);
};
exports.generateTokenPair = generateTokenPair;
const verifyAccessToken = (token) => {
    return exports.jwtService.verifyAccessToken(token);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return exports.jwtService.verifyRefreshToken(token);
};
exports.verifyRefreshToken = verifyRefreshToken;
const refreshAccessToken = (refreshToken, newRefreshTokenId) => {
    return exports.jwtService.refreshAccessToken(refreshToken, newRefreshTokenId);
};
exports.refreshAccessToken = refreshAccessToken;
exports.default = exports.jwtService;
//# sourceMappingURL=jwt.js.map