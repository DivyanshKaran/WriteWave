import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';
import { storage, generateId } from '@/models';
import { pushService } from '@/services/push.service';
import { asyncHandler } from '@/utils/errors';
import { 
  PushSubscription, 
  CreateSubscriptionRequest 
} from '@/types';

export class SubscriptionController {
  // Create push subscription
  static createSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const subscriptionData: CreateSubscriptionRequest = req.body;
    
    logger.info('Creating push subscription', { userId });

    // Check if subscription already exists for this endpoint
    const existingSubscriptions = await storage.getSubscriptionsByUser(userId);
    const existingSubscription = existingSubscriptions.find(sub => 
      sub.endpoint === subscriptionData.endpoint
    );

    if (existingSubscription) {
      // Update existing subscription
      const updatedSubscription = await storage.updateSubscription(existingSubscription.id, {
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
        userAgent: subscriptionData.userAgent,
        isActive: true,
        updatedAt: new Date()
      });

      return res.json({
        success: true,
        data: updatedSubscription,
        message: 'Push subscription updated successfully'
      });
    }

    // Create new subscription
    const subscription: PushSubscription = {
      id: generateId(),
      userId,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.p256dh,
      auth: subscriptionData.auth,
      userAgent: subscriptionData.userAgent,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const createdSubscription = await storage.createSubscription(subscription);

    res.status(201).json({
      success: true,
      data: createdSubscription,
      message: 'Push subscription created successfully'
    });
  });

  // Get user subscriptions
  static getUserSubscriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    const subscriptions = await storage.getSubscriptionsByUser(userId);
    
    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  });

  // Get subscription by ID
  static getSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const subscription = await storage.getSubscription(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  });

  // Update subscription
  static updateSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info('Updating push subscription', { id });

    const updatedSubscription = await storage.updateSubscription(id, {
      ...updates,
      updatedAt: new Date()
    });
    
    if (!updatedSubscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: updatedSubscription,
      message: 'Push subscription updated successfully'
    });
  });

  // Delete subscription
  static deleteSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    logger.info('Deleting push subscription', { id });

    const success = await storage.deleteSubscription(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Push subscription deleted successfully'
    });
  });

  // Unsubscribe user (delete all subscriptions)
  static unsubscribeUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    
    logger.info('Unsubscribing user from push notifications', { userId });

    const subscriptions = await storage.getSubscriptionsByUser(userId);
    
    // Deactivate all subscriptions
    for (const subscription of subscriptions) {
      await storage.updateSubscription(subscription.id, {
        isActive: false,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: { deactivatedCount: subscriptions.length },
      message: `User unsubscribed from push notifications (${subscriptions.length} subscriptions deactivated)`
    });
  });

  // Validate subscription
  static validateSubscription = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    
    const subscription = await storage.getSubscription(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    logger.info('Validating push subscription', { id });

    const isValid = await pushService.validateSubscription(subscription);
    
    if (!isValid) {
      // Deactivate invalid subscription
      await storage.updateSubscription(id, {
        isActive: false,
        updatedAt: new Date()
      });
    }

    res.json({
      success: true,
      data: { isValid },
      message: isValid ? 'Subscription is valid' : 'Subscription is invalid and has been deactivated'
    });
  });

  // Get VAPID public key
  static getVapidPublicKey = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const publicKey = await pushService.getVapidPublicKey();
    
    res.json({
      success: true,
      data: { publicKey }
    });
  });

  // Send test notification
  static sendTestNotification = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title = 'Test Notification', body = 'This is a test notification' } = req.body;
    
    const subscription = await storage.getSubscription(id);
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    logger.info('Sending test notification', { id });

    const result = await pushService.sendPushNotification(subscription, {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png'
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: { messageId: result.messageId },
      message: 'Test notification sent successfully'
    });
  });

  // Get subscription statistics
  static getSubscriptionStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Mock implementation - in real app, query database
    const stats = {
      totalSubscriptions: 1000,
      activeSubscriptions: 850,
      inactiveSubscriptions: 150,
      subscriptionsByUserAgent: [
        { userAgent: 'Chrome', count: 600 },
        { userAgent: 'Firefox', count: 200 },
        { userAgent: 'Safari', count: 150 },
        { userAgent: 'Edge', count: 50 }
      ],
      recentSubscriptions: 50, // Last 24 hours
      recentUnsubscriptions: 10 // Last 24 hours
    };

    res.json({
      success: true,
      data: stats
    });
  });

  // Cleanup expired subscriptions
  static cleanupExpiredSubscriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Cleaning up expired push subscriptions');

    const deletedCount = await pushService.cleanupExpiredSubscriptions();
    
    res.json({
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} expired subscriptions`
    });
  });

  // Bulk operations
  static bulkUpdateSubscriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Updates array is required'
      });
    }

    const results = await Promise.allSettled(
      updates.map(async (update: { id: string; updates: any }) => {
        const { id, updates: subscriptionUpdates } = update;
        return await storage.updateSubscription(id, subscriptionUpdates);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: failed === 0,
      data: {
        total: updates.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          id: updates[index].id,
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      },
      message: `Bulk subscription update: ${successful} successful, ${failed} failed`
    });
  });

  static bulkDeleteSubscriptions = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }

    const results = await Promise.allSettled(
      ids.map(async (id: string) => {
        return await storage.deleteSubscription(id);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value).length;

    res.json({
      success: failed === 0,
      data: {
        total: ids.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          id: ids[index],
          success: result.status === 'fulfilled' && result.value,
          error: result.status === 'rejected' ? result.reason : null
        }))
      },
      message: `Bulk subscription deletion: ${successful} successful, ${failed} failed`
    });
  });
}

export default SubscriptionController;
