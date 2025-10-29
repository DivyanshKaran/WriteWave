import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { storage } from '../models';
import { asyncHandler } from '../utils/errors';
import { 
  NotificationPreferences, 
  UpdatePreferencesRequest 
} from '../types';

export class PreferencesController {
  // Get user preferences
  static getPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    
    const preferences = await storage.getPreferences(userId);
    
    if (!preferences) {
      // Return default preferences if none exist
      const defaultPreferences: NotificationPreferences = {
        id: 'default',
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        learningReminders: true,
        streakWarnings: true,
        achievements: true,
        socialNotifications: true,
        systemUpdates: true,
        marketingEmails: false,
        weeklyDigest: true,
        monthlyRoundup: true,
        preferredTime: '09:00',
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      res.json({
        success: true,
        data: defaultPreferences
      });
      return;
    }

    res.json({
      success: true,
      data: preferences
    });
  });

  // Update user preferences
  static updatePreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    const updates: UpdatePreferencesRequest = req.body;
    
    logger.info('Updating user preferences', { userId });

    // Check if preferences exist
    let preferences = await storage.getPreferences(userId);
    
    if (!preferences) {
      // Create new preferences with defaults
      const defaultPreferences: NotificationPreferences = {
        id: 'default',
        userId,
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        inAppEnabled: true,
        learningReminders: true,
        streakWarnings: true,
        achievements: true,
        socialNotifications: true,
        systemUpdates: true,
        marketingEmails: false,
        weeklyDigest: true,
        monthlyRoundup: true,
        preferredTime: '09:00',
        timezone: 'UTC',
        language: 'en',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      preferences = await storage.createPreferences(defaultPreferences);
    }

    // Update preferences
    const updatedPreferences = await storage.updatePreferences(userId, updates);
    
    if (!updatedPreferences) {
      res.status(400).json({
        success: false,
        error: 'Failed to update preferences'
      });
      return;
    }

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully'
    });
  });

  // Reset preferences to defaults
  static resetPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    
    logger.info('Resetting user preferences to defaults', { userId });

    const defaultPreferences: NotificationPreferences = {
      id: 'default',
      userId,
      emailEnabled: true,
      pushEnabled: true,
      smsEnabled: false,
      inAppEnabled: true,
      learningReminders: true,
      streakWarnings: true,
      achievements: true,
      socialNotifications: true,
      systemUpdates: true,
      marketingEmails: false,
      weeklyDigest: true,
      monthlyRoundup: true,
      preferredTime: '09:00',
      timezone: 'UTC',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedPreferences = await storage.updatePreferences(userId, defaultPreferences);
    
    if (!updatedPreferences) {
      res.status(400).json({
        success: false,
        error: 'Failed to reset preferences'
      });
      return;
    }

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences reset to defaults successfully'
    });
  });

  // Delete user preferences
  static deletePreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userId } = req.params;
    
    logger.info('Deleting user preferences', { userId });

    const success = await storage.deletePreferences(userId);
    
    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Preferences not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Preferences deleted successfully'
    });
  });

  // Get preferences for multiple users
  static getBulkPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
      return;
    }

    const preferences = await Promise.all(
      userIds.map(async (userId: string) => {
        const userPreferences = await storage.getPreferences(userId);
        return { userId, preferences: userPreferences };
      })
    );

    res.json({
      success: true,
      data: preferences
    });
  });

  // Update preferences for multiple users
  static updateBulkPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Updates array is required'
      });
      return;
    }

    const results = await Promise.allSettled(
      updates.map(async (update: { userId: string; preferences: UpdatePreferencesRequest }) => {
        const { userId, preferences } = update;
        return await storage.updatePreferences(userId, preferences);
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
          userId: updates[index].userId,
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      },
      message: `Bulk preferences update: ${successful} successful, ${failed} failed`
    });
  });

  // Get preferences statistics
  static getPreferencesStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Mock implementation - in real app, query database
    const stats = {
      totalUsers: 1000,
      emailEnabled: 850,
      pushEnabled: 750,
      smsEnabled: 200,
      inAppEnabled: 900,
      learningReminders: 800,
      streakWarnings: 700,
      achievements: 900,
      socialNotifications: 600,
      systemUpdates: 950,
      marketingEmails: 300,
      weeklyDigest: 500,
      monthlyRoundup: 400,
      topTimezones: [
        { timezone: 'UTC', count: 300 },
        { timezone: 'America/New_York', count: 200 },
        { timezone: 'Europe/London', count: 150 },
        { timezone: 'Asia/Tokyo', count: 100 }
      ],
      topLanguages: [
        { language: 'en', count: 600 },
        { language: 'es', count: 200 },
        { language: 'fr', count: 100 },
        { language: 'de', count: 50 }
      ],
      preferredTimes: [
        { time: '09:00', count: 200 },
        { time: '18:00', count: 150 },
        { time: '12:00', count: 100 },
        { time: '21:00', count: 80 }
      ]
    };

    res.json({
      success: true,
      data: stats
    });
  });

  // Export preferences
  static exportPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { userIds, format = 'json' } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
      return;
    }

    const preferences = await Promise.all(
      userIds.map(async (userId: string) => {
        const userPreferences = await storage.getPreferences(userId);
        return { userId, preferences: userPreferences };
      })
    );

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = preferences.map(p => ({
        userId: p.userId,
        emailEnabled: p.preferences?.emailEnabled || false,
        pushEnabled: p.preferences?.pushEnabled || false,
        smsEnabled: p.preferences?.smsEnabled || false,
        inAppEnabled: p.preferences?.inAppEnabled || false,
        learningReminders: p.preferences?.learningReminders || false,
        streakWarnings: p.preferences?.streakWarnings || false,
        achievements: p.preferences?.achievements || false,
        socialNotifications: p.preferences?.socialNotifications || false,
        systemUpdates: p.preferences?.systemUpdates || false,
        marketingEmails: p.preferences?.marketingEmails || false,
        weeklyDigest: p.preferences?.weeklyDigest || false,
        monthlyRoundup: p.preferences?.monthlyRoundup || false,
        preferredTime: p.preferences?.preferredTime || '09:00',
        timezone: p.preferences?.timezone || 'UTC',
        language: p.preferences?.language || 'en'
      }));

      const csv = Object.keys(csvData[0]).join(',') + '\n' +
        csvData.map(row => Object.values(row).join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=preferences.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: preferences
      });
    }
  });

  // Import preferences
  static importPreferences = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { preferences } = req.body;
    
    if (!Array.isArray(preferences) || preferences.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Preferences array is required'
      });
      return;
    }

    const results = await Promise.allSettled(
      preferences.map(async (pref: { userId: string; preferences: UpdatePreferencesRequest }) => {
        const { userId, preferences: userPrefs } = pref;
        return await storage.updatePreferences(userId, userPrefs);
      })
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    res.json({
      success: failed === 0,
      data: {
        total: preferences.length,
        successful,
        failed,
        results: results.map((result, index) => ({
          userId: preferences[index].userId,
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        }))
      },
      message: `Preferences import: ${successful} successful, ${failed} failed`
    });
  });
}

export default PreferencesController;
