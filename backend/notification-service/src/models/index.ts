// In-memory data models for Notification Service
// In a real implementation, you would use a database like PostgreSQL or MongoDB

import { 
  Notification, 
  NotificationTemplate, 
  NotificationPreferences, 
  PushSubscription,
  DeliveryTracking,
  ScheduledNotification,
  User,
  ABTest
} from '@/types';

// In-memory storage (replace with actual database in production)
class InMemoryStorage {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  private subscriptions: Map<string, PushSubscription> = new Map();
  private deliveryTracking: Map<string, DeliveryTracking> = new Map();
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private users: Map<string, User> = new Map();
  private abTests: Map<string, ABTest> = new Map();

  // Notifications
  async createNotification(notification: Notification): Promise<Notification> {
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async updateNotification(id: string, updates: Partial<Notification>): Promise<Notification | null> {
    const notification = this.notifications.get(id);
    if (!notification) return null;

    const updated = { ...notification, ...updates, updatedAt: new Date() };
    this.notifications.set(id, updated);
    return updated;
  }

  async getNotificationsByUser(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
    
    return userNotifications;
  }

  async getNotificationsByStatus(status: string, limit: number = 100): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.status === status)
      .slice(0, limit);
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Templates
  async createTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.templates.set(template.id, template);
    return template;
  }

  async getTemplate(id: string): Promise<NotificationTemplate | null> {
    return this.templates.get(id) || null;
  }

  async getTemplateByName(name: string, type: string, channel: string, language: string): Promise<NotificationTemplate | null> {
    return Array.from(this.templates.values())
      .find(t => t.name === name && t.type === type && t.channel === channel && t.language === language) || null;
  }

  async updateTemplate(id: string, updates: Partial<NotificationTemplate>): Promise<NotificationTemplate | null> {
    const template = this.templates.get(id);
    if (!template) return null;

    const updated = { ...template, ...updates, updatedAt: new Date() };
    this.templates.set(id, updated);
    return updated;
  }

  async getTemplatesByType(type: string, channel: string, language: string): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values())
      .filter(t => t.type === type && t.channel === channel && t.language === language && t.isActive);
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  // Preferences
  async createPreferences(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    this.preferences.set(preferences.userId, preferences);
    return preferences;
  }

  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.get(userId) || null;
  }

  async updatePreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences | null> {
    const preferences = this.preferences.get(userId);
    if (!preferences) return null;

    const updated = { ...preferences, ...updates, updatedAt: new Date() };
    this.preferences.set(userId, updated);
    return updated;
  }

  async deletePreferences(userId: string): Promise<boolean> {
    return this.preferences.delete(userId);
  }

  // Push Subscriptions
  async createSubscription(subscription: PushSubscription): Promise<PushSubscription> {
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async getSubscription(id: string): Promise<PushSubscription | null> {
    return this.subscriptions.get(id) || null;
  }

  async getSubscriptionsByUser(userId: string): Promise<PushSubscription[]> {
    return Array.from(this.subscriptions.values())
      .filter(s => s.userId === userId && s.isActive);
  }

  async updateSubscription(id: string, updates: Partial<PushSubscription>): Promise<PushSubscription | null> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) return null;

    const updated = { ...subscription, ...updates, updatedAt: new Date() };
    this.subscriptions.set(id, updated);
    return updated;
  }

  async deleteSubscription(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  // Delivery Tracking
  async createDeliveryTracking(tracking: DeliveryTracking): Promise<DeliveryTracking> {
    this.deliveryTracking.set(tracking.id, tracking);
    return tracking;
  }

  async getDeliveryTracking(id: string): Promise<DeliveryTracking | null> {
    return this.deliveryTracking.get(id) || null;
  }

  async getDeliveryTrackingByNotification(notificationId: string): Promise<DeliveryTracking[]> {
    return Array.from(this.deliveryTracking.values())
      .filter(t => t.notificationId === notificationId);
  }

  async updateDeliveryTracking(id: string, updates: Partial<DeliveryTracking>): Promise<DeliveryTracking | null> {
    const tracking = this.deliveryTracking.get(id);
    if (!tracking) return null;

    const updated = { ...tracking, ...updates, updatedAt: new Date() };
    this.deliveryTracking.set(id, updated);
    return updated;
  }

  // Scheduled Notifications
  async createScheduledNotification(scheduled: ScheduledNotification): Promise<ScheduledNotification> {
    this.scheduledNotifications.set(scheduled.id, scheduled);
    return scheduled;
  }

  async getScheduledNotification(id: string): Promise<ScheduledNotification | null> {
    return this.scheduledNotifications.get(id) || null;
  }

  async getScheduledNotificationsByUser(userId: string): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values())
      .filter(s => s.userId === userId);
  }

  async getScheduledNotificationsForTime(time: Date): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values())
      .filter(s => s.status === 'ACTIVE' && s.scheduledAt <= time);
  }

  async updateScheduledNotification(id: string, updates: Partial<ScheduledNotification>): Promise<ScheduledNotification | null> {
    const scheduled = this.scheduledNotifications.get(id);
    if (!scheduled) return null;

    const updated = { ...scheduled, ...updates, updatedAt: new Date() };
    this.scheduledNotifications.set(id, updated);
    return updated;
  }

  async deleteScheduledNotification(id: string): Promise<boolean> {
    return this.scheduledNotifications.delete(id);
  }

  // Users
  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async getUser(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return Array.from(this.users.values())
      .find(u => u.email === email) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updated = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  // A/B Tests
  async createABTest(abTest: ABTest): Promise<ABTest> {
    this.abTests.set(abTest.id, abTest);
    return abTest;
  }

  async getABTest(id: string): Promise<ABTest | null> {
    return this.abTests.get(id) || null;
  }

  async getActiveABTests(): Promise<ABTest[]> {
    return Array.from(this.abTests.values())
      .filter(t => t.isActive && t.startDate <= new Date() && (!t.endDate || t.endDate > new Date()));
  }

  async updateABTest(id: string, updates: Partial<ABTest>): Promise<ABTest | null> {
    const abTest = this.abTests.get(id);
    if (!abTest) return null;

    const updated = { ...abTest, ...updates, updatedAt: new Date() };
    this.abTests.set(id, updated);
    return updated;
  }

  async deleteABTest(id: string): Promise<boolean> {
    return this.abTests.delete(id);
  }

  // Analytics
  async getNotificationStats(startDate: Date, endDate: Date): Promise<any> {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.createdAt >= startDate && n.createdAt <= endDate);

    const totalSent = notifications.length;
    const totalDelivered = notifications.filter(n => n.status === 'DELIVERED' || n.status === 'OPENED' || n.status === 'CLICKED').length;
    const totalOpened = notifications.filter(n => n.status === 'OPENED' || n.status === 'CLICKED').length;
    const totalClicked = notifications.filter(n => n.status === 'CLICKED').length;
    const totalFailed = notifications.filter(n => n.status === 'FAILED').length;

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalFailed,
      deliveryRate: totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0,
      openRate: totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0,
      clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0,
      failureRate: totalSent > 0 ? (totalFailed / totalSent) * 100 : 0
    };
  }

  // Cleanup old data
  async cleanupOldData(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Clean up old notifications
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.createdAt < cutoffDate) {
        this.notifications.delete(id);
      }
    }

    // Clean up old delivery tracking
    for (const [id, tracking] of this.deliveryTracking.entries()) {
      if (tracking.createdAt < cutoffDate) {
        this.deliveryTracking.delete(id);
      }
    }
  }
}

// Export singleton instance
export const storage = new InMemoryStorage();

// Helper functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default storage;
