import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { validate, validationSchemas } from '@/middleware/validation';
import { authenticateToken, rateLimit } from '@/middleware/auth';

const router = Router();

// Rate limiting for auth endpoints
const authRateLimit = rateLimit(10, 900000); // 10 requests per 15 minutes

// Public routes (no authentication required)
router.post('/register', 
  authRateLimit,
  validate(validationSchemas.userRegistration),
  authController.register
);

router.post('/login', 
  authRateLimit,
  validate(validationSchemas.userLogin),
  authController.login
);

router.post('/refresh-token', 
  authRateLimit,
  validate(validationSchemas.refreshToken),
  authController.refreshToken
);

router.post('/forgot-password', 
  authRateLimit,
  validate(validationSchemas.passwordResetRequest),
  authController.requestPasswordReset
);

router.post('/reset-password', 
  authRateLimit,
  validate(validationSchemas.passwordResetConfirm),
  authController.confirmPasswordReset
);

router.post('/verify-email', 
  authRateLimit,
  validate(validationSchemas.emailVerification),
  authController.verifyEmail
);

router.post('/resend-verification', 
  authRateLimit,
  authController.resendEmailVerification
);

// OAuth routes
router.get('/google', authController.googleLogin);
router.get('/google/callback', authController.googleLogin);

router.get('/apple', authController.appleLogin);
router.get('/apple/callback', authController.appleLogin);

// Protected routes (authentication required)
router.post('/logout', 
  authenticateToken,
  authController.logout
);

router.post('/logout-all', 
  authenticateToken,
  authController.logoutAllDevices
);

router.get('/me', 
  authenticateToken,
  authController.getCurrentUser
);

export default router;
