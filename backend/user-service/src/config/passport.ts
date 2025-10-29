import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { authService } from '../services/auth.service';
import { logger } from './logger';

// Configure Google OAuth Strategy (lazy enable)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    'google',
    new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      passReqToCallback: true,
    },
    async (req: any, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        logger.info('Google OAuth callback', { 
          email: profile.emails?.[0]?.value,
          providerId: profile.id 
        });

        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;

        if (!email || !googleId) {
          return done(new Error('Missing email or Google ID'), null);
        }

        // Extract device info, IP address, and user agent
        const userAgent = req.get('User-Agent') || req.headers['user-agent'] || 'unknown';
        const deviceInfo = {
          deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
          os: userAgent,
          browser: userAgent,
          userAgent: userAgent,
        };
        const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || 'unknown';

        // Check if user exists or create new one
        // This handles both OAuth and email-based accounts with the same email
        const oauthData = {
          provider: 'google' as const,
          providerId: googleId,
          email: email,
          firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
          lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
          profilePicture: profile.photos?.[0]?.value || null,
        };

        const result = await authService.oauthLogin(oauthData, deviceInfo, ipAddress, userAgent);

        if (!result.success) {
          return done(new Error(result.message), null);
        }

        return done(null, result.data);
      } catch (error: any) {
        logger.error('Google OAuth error', { error: error.message });
        return done(error, null);
      }
      }
    )
  );
} else {
  logger.warn('Google OAuth not configured; skipping GoogleStrategy registration');
}

// Serialize user for session
passport.serializeUser((user: any, done: any) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: any, done: any) => {
  done(null, user);
});

export default passport;

