"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const auth_service_1 = require("../services/auth.service");
const logger_1 = require("./logger");
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use('google', new passport_google_oauth20_1.Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
        passReqToCallback: true,
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            logger_1.logger.info('Google OAuth callback', {
                email: profile.emails?.[0]?.value,
                providerId: profile.id
            });
            const email = profile.emails?.[0]?.value;
            const googleId = profile.id;
            if (!email || !googleId) {
                return done(new Error('Missing email or Google ID'), null);
            }
            const userAgent = req.get('User-Agent') || req.headers['user-agent'] || 'unknown';
            const deviceInfo = {
                deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
                os: userAgent,
                browser: userAgent,
                userAgent: userAgent,
            };
            const ipAddress = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'unknown';
            const oauthData = {
                provider: 'google',
                providerId: googleId,
                email: email,
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || '',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                profilePicture: profile.photos?.[0]?.value || null,
            };
            const result = await auth_service_1.authService.oauthLogin(oauthData, deviceInfo, ipAddress, userAgent);
            if (!result.success) {
                return done(new Error(result.message), null);
            }
            return done(null, result.data);
        }
        catch (error) {
            logger_1.logger.error('Google OAuth error', { error: error.message });
            return done(error, null);
        }
    }));
}
else {
    logger_1.logger.warn('Google OAuth not configured; skipping GoogleStrategy registration');
}
passport_1.default.serializeUser((user, done) => {
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    done(null, user);
});
exports.default = passport_1.default;
//# sourceMappingURL=passport.js.map