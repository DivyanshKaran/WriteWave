import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { healthCheck } from '@/middleware/auth';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'WriteWave User Service API',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: {
        'POST /auth/register': 'Register a new user',
        'POST /auth/login': 'Login user',
        'POST /auth/refresh-token': 'Refresh access token',
        'POST /auth/logout': 'Logout user',
        'POST /auth/logout-all': 'Logout from all devices',
        'GET /auth/me': 'Get current user',
        'POST /auth/forgot-password': 'Request password reset',
        'POST /auth/reset-password': 'Reset password',
        'POST /auth/verify-email': 'Verify email address',
        'POST /auth/resend-verification': 'Resend email verification',
        'GET /auth/google': 'Google OAuth login',
        'GET /auth/apple': 'Apple OAuth login',
      },
      users: {
        'GET /users/profile': 'Get user profile',
        'PUT /users/profile': 'Update user profile',
        'GET /users/settings': 'Get user settings',
        'PUT /users/settings': 'Update user settings',
        'GET /users/sessions': 'Get user sessions',
        'POST /users/deactivate': 'Deactivate user account',
        'POST /users/reactivate': 'Reactivate user account',
        'DELETE /users/account': 'Delete user account',
        'GET /users/stats': 'Get user statistics',
        'PUT /users/avatar': 'Update user avatar',
        'GET /users/search': 'Search users',
        'GET /users/admin/users': 'Get all users (admin)',
        'GET /users/admin/users/:userId': 'Get user by ID (admin)',
      },
      system: {
        'GET /health': 'Health check',
        'GET /': 'API information',
      }
    }
  });
});

export default router;
