import { jwtService } from '../utils/jwt';

describe('JWT utilities', () => {
  const userId = 'user_123';
  const email = 'user@example.com';

  it('generates and verifies access token', () => {
    const token = jwtService.generateAccessToken({ userId, email });
    expect(typeof token).toBe('string');
    const decoded = jwtService.verifyAccessToken(token);
    expect(decoded.userId).toBe(userId);
    expect(decoded.email).toBe(email);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('generates and verifies refresh token', () => {
    const token = jwtService.generateRefreshToken({ userId, tokenId: 'rt_1' });
    const decoded = jwtService.verifyRefreshToken(token);
    expect(decoded.userId).toBe(userId);
    expect(decoded.tokenId).toBe('rt_1');
  });

  it('generates token pair', () => {
    const pair = jwtService.generateTokenPair(userId, email, 'rt_2');
    expect(pair.accessToken).toBeTruthy();
    expect(pair.refreshToken).toBeTruthy();
    const r = jwtService.verifyRefreshToken(pair.refreshToken);
    expect(r.tokenId).toBe('rt_2');
  });

  it('extracts token from header and validates format', () => {
    const { accessToken } = jwtService.generateTokenPair(userId, email, 'rt_3');
    const header = `Bearer ${accessToken}`;
    const extracted = jwtService.extractTokenFromHeader(header);
    expect(extracted).toBe(accessToken);
    expect(jwtService.validateTokenFormat(accessToken)).toBe(true);
  });

  it('rejects malformed tokens', () => {
    expect(jwtService.validateTokenFormat('not-a-token')).toBe(false);
    expect(jwtService.extractTokenFromHeader('Basic abc')).toBeNull();
  });
});


