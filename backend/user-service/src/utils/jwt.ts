import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JWTPayload, RefreshTokenPayload } from '../types';
import { logger } from '../config/logger';

// JWT utility class
export class JWTService {
  private readonly secret: string;
  private readonly refreshSecret: string;
  private readonly expiresIn: string;
  private readonly refreshExpiresIn: string;

  constructor() {
    this.secret = config.jwt.secret;
    this.refreshSecret = config.jwt.refreshSecret;
    this.expiresIn = config.jwt.expiresIn;
    this.refreshExpiresIn = config.jwt.refreshExpiresIn;
  }

  // Generate access token
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      const tokenPayload: JWTPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.expiresIn),
      };

      const token = jwt.sign(tokenPayload, this.secret, {
        algorithm: 'HS256',
        issuer: 'writewave',
        audience: 'writewave-users',
      });

      logger.debug('Access token generated', { userId: payload.userId });
      return token;
    } catch (error) {
      logger.error('Failed to generate access token', { error, userId: payload.userId });
      throw new Error('Token generation failed');
    }
  }

  // Generate refresh token
  generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      const tokenPayload: RefreshTokenPayload = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + this.parseExpiresIn(this.refreshExpiresIn),
      };

      const token = jwt.sign(tokenPayload, this.refreshSecret, {
        algorithm: 'HS256',
        issuer: 'writewave',
        audience: 'writewave-users',
      });

      logger.debug('Refresh token generated', { userId: payload.userId, tokenId: payload.tokenId });
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token', { error, userId: payload.userId });
      throw new Error('Refresh token generation failed');
    }
  }

  // Verify access token
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
        issuer: 'writewave',
        audience: 'writewave-users',
      }) as JWTPayload;

      logger.debug('Access token verified', { userId: decoded.userId });
      return decoded;
    } catch (error) {
      logger.warn('Access token verification failed', { error: error.message });
      throw new Error('Invalid or expired token');
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshSecret, {
        algorithms: ['HS256'],
        issuer: 'writewave',
        audience: 'writewave-users',
      }) as RefreshTokenPayload;

      logger.debug('Refresh token verified', { userId: decoded.userId, tokenId: decoded.tokenId });
      return decoded;
    } catch (error) {
      logger.warn('Refresh token verification failed', { error: error.message });
      throw new Error('Invalid or expired refresh token');
    }
  }

  // Decode token without verification (for debugging)
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Failed to decode token', { error });
      return null;
    }
  }

  // Get token expiration time
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Failed to get token expiration', { error });
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      return expiration < new Date();
    } catch (error) {
      logger.error('Failed to check token expiration', { error });
      return true;
    }
  }

  // Get time until token expires
  getTimeUntilExpiration(token: string): number {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return 0;
      return Math.max(0, expiration.getTime() - Date.now());
    } catch (error) {
      logger.error('Failed to get time until expiration', { error });
      return 0;
    }
  }

  // Generate token pair
  generateTokenPair(
    userId: string,
    email: string,
    refreshTokenId: string
  ): { accessToken: string; refreshToken: string } {
    try {
      const accessToken = this.generateAccessToken({ userId, email });
      const refreshToken = this.generateRefreshToken({ userId, tokenId: refreshTokenId });

      logger.info('Token pair generated', { userId });
      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Failed to generate token pair', { error, userId });
      throw new Error('Token pair generation failed');
    }
  }

  // Refresh access token
  refreshAccessToken(refreshToken: string, newRefreshTokenId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Generate new token pair
      const accessToken = this.generateAccessToken({
        userId: decoded.userId,
        email: '', // Will be populated from database
      });
      
      const newRefreshToken = this.generateRefreshToken({
        userId: decoded.userId,
        tokenId: newRefreshTokenId,
      });

      logger.info('Access token refreshed', { userId: decoded.userId });
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      logger.error('Failed to refresh access token', { error });
      throw new Error('Token refresh failed');
    }
  }

  // Parse expires in string to seconds
  private parseExpiresIn(expiresIn: string): number {
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
        return parseInt(expiresIn, 10) || 3600; // Default to 1 hour
    }
  }

  // Validate token format
  validateTokenFormat(token: string): boolean {
    try {
      if (!token || typeof token !== 'string') return false;
      
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Check if each part is base64 encoded
      parts.forEach(part => {
        if (!/^[A-Za-z0-9_-]+$/.test(part)) {
          throw new Error('Invalid token format');
        }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Extract token from Authorization header
  extractTokenFromHeader(authHeader: string): string | null {
    try {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      
      const token = authHeader.substring(7);
      if (!this.validateTokenFormat(token)) {
        return null;
      }
      
      return token;
    } catch (error) {
      logger.error('Failed to extract token from header', { error });
      return null;
    }
  }

  // Get token info for debugging
  getTokenInfo(token: string): {
    isValid: boolean;
    isExpired: boolean;
    expiration?: Date;
    timeUntilExpiration?: number;
    payload?: any;
  } {
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
    } catch (error) {
      logger.error('Failed to get token info', { error });
      return { isValid: false, isExpired: true };
    }
  }
}

// Export JWT service instance
export const jwtService = new JWTService();

// Token validation middleware
export const validateToken = (token: string): boolean => {
  try {
    return jwtService.validateTokenFormat(token) && !jwtService.isTokenExpired(token);
  } catch (error) {
    return false;
  }
};

// Token extraction utility
export const extractToken = (authHeader: string): string | null => {
  return jwtService.extractTokenFromHeader(authHeader);
};

// Token generation utilities
export const generateAccessToken = (userId: string, email: string): string => {
  return jwtService.generateAccessToken({ userId, email });
};

export const generateRefreshToken = (userId: string, tokenId: string): string => {
  return jwtService.generateRefreshToken({ userId, tokenId });
};

export const generateTokenPair = (
  userId: string,
  email: string,
  refreshTokenId: string
): { accessToken: string; refreshToken: string } => {
  return jwtService.generateTokenPair(userId, email, refreshTokenId);
};

// Token verification utilities
export const verifyAccessToken = (token: string): JWTPayload => {
  return jwtService.verifyAccessToken(token);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwtService.verifyRefreshToken(token);
};

// Token refresh utility
export const refreshAccessToken = (
  refreshToken: string,
  newRefreshTokenId: string
): { accessToken: string; refreshToken: string } => {
  return jwtService.refreshAccessToken(refreshToken, newRefreshTokenId);
};

// Export default
export default jwtService;
