import { JWTPayload, RefreshTokenPayload } from '../types';
export declare class JWTService {
    private readonly secret;
    private readonly refreshSecret;
    private readonly expiresIn;
    private readonly refreshExpiresIn;
    constructor();
    generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
    generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string;
    verifyAccessToken(token: string): JWTPayload;
    verifyRefreshToken(token: string): RefreshTokenPayload;
    decodeToken(token: string): any;
    getTokenExpiration(token: string): Date | null;
    isTokenExpired(token: string): boolean;
    getTimeUntilExpiration(token: string): number;
    generateTokenPair(userId: string, email: string, refreshTokenId: string): {
        accessToken: string;
        refreshToken: string;
    };
    refreshAccessToken(refreshToken: string, newRefreshTokenId: string): {
        accessToken: string;
        refreshToken: string;
    };
    private parseExpiresIn;
    validateTokenFormat(token: string): boolean;
    extractTokenFromHeader(authHeader: string): string | null;
    getTokenInfo(token: string): {
        isValid: boolean;
        isExpired: boolean;
        expiration?: Date;
        timeUntilExpiration?: number;
        payload?: any;
    };
}
export declare const jwtService: JWTService;
export declare const validateToken: (token: string) => boolean;
export declare const extractToken: (authHeader: string) => string | null;
export declare const generateAccessToken: (userId: string, email: string) => string;
export declare const generateRefreshToken: (userId: string, tokenId: string) => string;
export declare const generateTokenPair: (userId: string, email: string, refreshTokenId: string) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyAccessToken: (token: string) => JWTPayload;
export declare const verifyRefreshToken: (token: string) => RefreshTokenPayload;
export declare const refreshAccessToken: (refreshToken: string, newRefreshTokenId: string) => {
    accessToken: string;
    refreshToken: string;
};
export default jwtService;
//# sourceMappingURL=jwt.d.ts.map