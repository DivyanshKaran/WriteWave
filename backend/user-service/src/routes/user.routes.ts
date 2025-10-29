import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate, validationSchemas, validateQuery, validateParams } from '../middleware/validation';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

// User profile routes
router.get('/profile', userController.getUserProfile);

router.put('/profile', 
  validate(validationSchemas.userProfileUpdate),
  userController.updateUserProfile
);

// User settings routes
router.get('/settings', userController.getUserSettings);

router.put('/settings', 
  validate(validationSchemas.userSettingsUpdate),
  userController.updateUserSettings
);

// User sessions routes
router.get('/sessions', userController.getUserSessions);

// User account management routes
router.post('/deactivate', userController.deactivateUser);

router.post('/reactivate', userController.reactivateUser);

router.delete('/account', userController.deleteUser);

// User statistics route
router.get('/stats', userController.getUserStats);

// User avatar route
router.put('/avatar', userController.updateUserAvatar);

// Search users route (public but authenticated)
router.get('/search', 
  validateQuery(validationSchemas.searchQuery),
  userController.searchUsers
);

// Admin routes
router.get('/admin/users', 
  requireAdmin,
  validateQuery(validationSchemas.paginationQuery),
  userController.getAllUsers
);

router.get('/admin/users/:userId', 
  requireAdmin,
  validateParams(validationSchemas.userIdParam),
  userController.getUserById
);

export default router;
