import express from 'express';
import { logger } from '../utils/logger';
import { authenticateToken, requireAdmin, requireModerator } from '../middleware/auth';
import { validate, validateQuery, validateParams } from '../middleware/validation';
import { 
  commonSchemas, 
  notificationSchemas, 
  preferencesSchemas, 
  subscriptionSchemas,
  scheduledSchemas,
  analyticsSchemas
} from '../middleware/validation';

// Import controllers
import NotificationController from '../controllers/notification.controller';
import PreferencesController from '../controllers/preferences.controller';
import SubscriptionController from '../controllers/subscription.controller';
import ScheduledController from '../controllers/scheduled.controller';
import AnalyticsController from '../controllers/analytics.controller';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Documentation endpoint
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    message: 'Notification Service API Documentation',
    endpoints: {
      health: 'GET /health',
      notifications: {
        send: 'POST /notifications/send',
        bulk: 'POST /notifications/bulk',
        users: 'POST /notifications/users',
        all: 'POST /notifications/all',
        type: 'POST /notifications/type',
        get: 'GET /notifications/:id',
        update: 'PUT /notifications/:id',
        delete: 'DELETE /notifications/:id',
        user: 'GET /notifications/user/:userId',
        status: 'GET /notifications/status/:status',
        retry: 'POST /notifications/:id/retry',
        cancel: 'POST /notifications/:id/cancel',
        stats: 'GET /notifications/stats',
        cleanup: 'POST /notifications/cleanup',
        validate: 'POST /notifications/validate'
      },
      preferences: {
        get: 'GET /preferences/:userId',
        update: 'PUT /preferences/:userId',
        reset: 'POST /preferences/:userId/reset',
        delete: 'DELETE /preferences/:userId',
        bulk: 'POST /preferences/bulk',
        stats: 'GET /preferences/stats',
        export: 'POST /preferences/export',
        import: 'POST /preferences/import'
      },
      subscriptions: {
        create: 'POST /subscriptions/:userId',
        get: 'GET /subscriptions/:userId',
        update: 'PUT /subscriptions/:id',
        delete: 'DELETE /subscriptions/:id',
        validate: 'POST /subscriptions/:id/validate',
        test: 'POST /subscriptions/:id/test',
        stats: 'GET /subscriptions/stats',
        cleanup: 'POST /subscriptions/cleanup',
        vapid: 'GET /subscriptions/vapid-key'
      },
      scheduled: {
        create: 'POST /scheduled',
        get: 'GET /scheduled/:id',
        update: 'PUT /scheduled/:id',
        delete: 'DELETE /scheduled/:id',
        user: 'GET /scheduled/user/:userId',
        stats: 'GET /scheduled/stats'
      },
      analytics: {
        get: 'GET /analytics',
        user: 'GET /analytics/user/:userId',
        channel: 'GET /analytics/channel/:channel',
        type: 'GET /analytics/type/:type',
        export: 'POST /analytics/export',
        realtime: 'GET /analytics/realtime'
      }
    }
  });
});

// Notification routes
router.post('/notifications/send', 
  authenticateToken,
  validate(notificationSchemas.createNotification),
  NotificationController.sendNotification
);

router.post('/notifications/bulk',
  authenticateToken,
  requireAdmin,
  validate(notificationSchemas.bulkNotification),
  NotificationController.sendBulkNotifications
);

router.post('/notifications/users',
  authenticateToken,
  requireModerator,
  validate(notificationSchemas.bulkNotification),
  NotificationController.sendToUsers
);

router.post('/notifications/all',
  authenticateToken,
  requireAdmin,
  validate(notificationSchemas.createNotification),
  NotificationController.sendToAllUsers
);

router.post('/notifications/type',
  authenticateToken,
  requireModerator,
  validate(notificationSchemas.createNotification),
  NotificationController.sendByType
);

router.get('/notifications/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  NotificationController.getNotification
);

router.put('/notifications/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  validate(notificationSchemas.updateNotification),
  NotificationController.updateNotification
);

router.delete('/notifications/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  NotificationController.deleteNotification
);

router.get('/notifications/user/:userId',
  authenticateToken,
  validateParams(commonSchemas.userId),
  validateQuery(commonSchemas.pagination),
  NotificationController.getUserNotifications
);

router.get('/notifications/status/:status',
  authenticateToken,
  requireModerator,
  validateParams(commonSchemas.id),
  validateQuery(commonSchemas.pagination),
  NotificationController.getNotificationsByStatus
);

router.post('/notifications/:id/retry',
  authenticateToken,
  requireModerator,
  validateParams(commonSchemas.id),
  NotificationController.retryNotification
);

router.post('/notifications/:id/cancel',
  authenticateToken,
  validateParams(commonSchemas.id),
  NotificationController.cancelScheduledNotification
);

router.get('/notifications/stats',
  authenticateToken,
  requireModerator,
  validateQuery(commonSchemas.dateRange),
  NotificationController.getNotificationStats
);

router.post('/notifications/cleanup',
  authenticateToken,
  requireAdmin,
  NotificationController.cleanupOldNotifications
);

router.post('/notifications/validate',
  authenticateToken,
  validate(notificationSchemas.createNotification),
  NotificationController.validateNotification
);

// Preferences routes
router.get('/preferences/:userId',
  authenticateToken,
  validateParams(commonSchemas.userId),
  PreferencesController.getPreferences
);

router.put('/preferences/:userId',
  authenticateToken,
  validateParams(commonSchemas.userId),
  validate(preferencesSchemas.updatePreferences),
  PreferencesController.updatePreferences
);

router.post('/preferences/:userId/reset',
  authenticateToken,
  validateParams(commonSchemas.userId),
  PreferencesController.resetPreferences
);

router.delete('/preferences/:userId',
  authenticateToken,
  requireAdmin,
  validateParams(commonSchemas.userId),
  PreferencesController.deletePreferences
);

router.post('/preferences/bulk',
  authenticateToken,
  requireModerator,
  PreferencesController.getBulkPreferences
);

router.put('/preferences/bulk',
  authenticateToken,
  requireModerator,
  PreferencesController.updateBulkPreferences
);

router.get('/preferences/stats',
  authenticateToken,
  requireModerator,
  PreferencesController.getPreferencesStats
);

router.post('/preferences/export',
  authenticateToken,
  requireModerator,
  PreferencesController.exportPreferences
);

router.post('/preferences/import',
  authenticateToken,
  requireAdmin,
  PreferencesController.importPreferences
);

// Subscription routes
router.post('/subscriptions/:userId',
  authenticateToken,
  validateParams(commonSchemas.userId),
  validate(subscriptionSchemas.createSubscription),
  SubscriptionController.createSubscription
);

router.get('/subscriptions/:userId',
  authenticateToken,
  validateParams(commonSchemas.userId),
  SubscriptionController.getUserSubscriptions
);

router.get('/subscriptions/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  SubscriptionController.getSubscription
);

router.put('/subscriptions/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  SubscriptionController.updateSubscription
);

router.delete('/subscriptions/:id',
  authenticateToken,
  validateParams(commonSchemas.id),
  SubscriptionController.deleteSubscription
);

router.post('/subscriptions/:userId/unsubscribe',
  authenticateToken,
  validateParams(commonSchemas.userId),
  SubscriptionController.unsubscribeUser
);

router.post('/subscriptions/:id/validate',
  authenticateToken,
  validateParams(commonSchemas.id),
  SubscriptionController.validateSubscription
);

router.post('/subscriptions/:id/test',
  authenticateToken,
  validateParams(commonSchemas.id),
  SubscriptionController.sendTestNotification
);

router.get('/subscriptions/vapid-key',
  SubscriptionController.getVapidPublicKey
);

router.get('/subscriptions/stats',
  authenticateToken,
  requireModerator,
  SubscriptionController.getSubscriptionStats
);

router.post('/subscriptions/cleanup',
  authenticateToken,
  requireAdmin,
  SubscriptionController.cleanupExpiredSubscriptions
);

router.put('/subscriptions/bulk',
  authenticateToken,
  requireModerator,
  SubscriptionController.bulkUpdateSubscriptions
);

router.delete('/subscriptions/bulk',
  authenticateToken,
  requireAdmin,
  SubscriptionController.bulkDeleteSubscriptions
);


// Scheduled notification routes
router.post('/scheduled',
  authenticateToken,
  validate(scheduledSchemas.createScheduled),
  ScheduledController.createScheduled
);

router.get('/scheduled/:id',
  authenticateToken,
  ScheduledController.getScheduled
);

router.put('/scheduled/:id',
  authenticateToken,
  ScheduledController.updateScheduled
);

router.delete('/scheduled/:id',
  authenticateToken,
  ScheduledController.deleteScheduled
);

router.get('/scheduled/user/:userId',
  authenticateToken,
  ScheduledController.getUserScheduled
);

router.post('/scheduled/:id/cancel',
  authenticateToken,
  ScheduledController.cancelScheduled
);

router.get('/scheduled/stats',
  authenticateToken,
  requireModerator,
  ScheduledController.getScheduledStats
);

router.post('/scheduled/process',
  authenticateToken,
  requireModerator,
  ScheduledController.processDueScheduled
);

// Analytics routes
router.get('/analytics',
  authenticateToken,
  requireModerator,
  validateQuery(analyticsSchemas.getAnalytics),
  AnalyticsController.getAnalytics
);

router.get('/analytics/user/:userId',
  authenticateToken,
  AnalyticsController.getUserAnalytics
);

router.get('/analytics/channel/:channel',
  authenticateToken,
  requireModerator,
  AnalyticsController.getChannelAnalytics
);

router.get('/analytics/type/:type',
  authenticateToken,
  requireModerator,
  AnalyticsController.getTypeAnalytics
);

router.get('/analytics/realtime',
  authenticateToken,
  requireModerator,
  AnalyticsController.getRealtimeAnalytics
);

router.post('/analytics/export',
  authenticateToken,
  requireModerator,
  AnalyticsController.exportAnalytics
);

// Error handling middleware
router.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Route error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /docs',
      'POST /notifications/send',
      'GET /notifications/user/:userId',
      'PUT /preferences/:userId',
      'POST /subscriptions/:userId'
    ]
  });
});

export default router;
