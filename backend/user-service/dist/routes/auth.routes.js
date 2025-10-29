"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const passport_1 = __importDefault(require("../config/passport"));
const router = (0, express_1.Router)();
const authRateLimit = (0, auth_1.rateLimit)(10, 900000);
router.post('/register', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.userRegistration), auth_controller_1.authController.register);
router.post('/login', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.userLogin), auth_controller_1.authController.login);
router.post('/refresh-token', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.refreshToken), auth_controller_1.authController.refreshToken);
router.post('/forgot-password', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.passwordResetRequest), auth_controller_1.authController.requestPasswordReset);
router.post('/reset-password', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.passwordResetConfirm), auth_controller_1.authController.confirmPasswordReset);
router.post('/verify-email', authRateLimit, (0, validation_1.validate)(validation_1.validationSchemas.emailVerification), auth_controller_1.authController.verifyEmail);
router.post('/resend-verification', authRateLimit, auth_controller_1.authController.resendEmailVerification);
router.get('/google', passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
}));
router.get('/google/callback', passport_1.default.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`,
    session: false
}), auth_controller_1.authController.googleCallback.bind(auth_controller_1.authController));
router.post('/logout', auth_1.authenticateToken, auth_controller_1.authController.logout);
router.post('/logout-all', auth_1.authenticateToken, auth_controller_1.authController.logoutAllDevices);
router.get('/me', auth_1.authenticateToken, auth_controller_1.authController.getCurrentUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map