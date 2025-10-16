"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Settings, Clock, Play, BarChart, Activity } from 'lucide-react';

interface PushNotificationSystemProps {
  userId: string;
  className?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: 'reminder' | 'achievement' | 'streak' | 'goal' | 'social' | 'system';
  title: string;
  body: string;
  icon: string;
  sound: string;
  priority: 'low' | 'normal' | 'high';
  category: string;
  actions: NotificationAction[];
  schedule: {
    frequency: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string;
    days: string[];
    timezone: string;
  };
  conditions: {
    enabled: boolean;
    minStreak: number;
    maxStreak: number;
    timeRange: {
      start: string;
      end: string;
    };
    userLevel: {
      min: number;
      max: number;
    };
  };
}

interface NotificationAction {
  id: string;
  title: string;
  action: string;
  icon: string;
  destructive: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  preview: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  categories: {
    reminders: boolean;
    achievements: boolean;
    streaks: boolean;
    goals: boolean;
    social: boolean;
    system: boolean;
  };
  frequency: {
    maxPerDay: number;
    minInterval: number;
    batchNotifications: boolean;
  };
}

interface NotificationHistory {
  id: string;
  template: string;
  title: string;
  body: string;
  type: string;
  sent: string;
  delivered: string;
  opened: string;
  clicked: string;
  dismissed: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'dismissed' | 'failed';
  device: 'mobile' | 'tablet' | 'desktop';
  userAction: string;
  engagement: number;
}

export const PushNotificationSystem: React.FC<PushNotificationSystemProps> = ({
  userId,
  className = ''
}) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    badge: true,
    preview: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00'
    },
    categories: {
      reminders: true,
      achievements: true,
      streaks: true,
      goals: true,
      social: true,
      system: true
    },
    frequency: {
      maxPerDay: 10,
      minInterval: 30,
      batchNotifications: true
    }
  });
  
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'templates' | 'settings' | 'history' | 'test'>('overview');
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  // Mock notification templates
  const mockTemplates: NotificationTemplate[] = [
    {
      id: 'template-1',
      name: 'Daily Reminder',
      description: 'Remind user to practice daily',
      type: 'reminder',
      title: 'Time to practice!',
      body: 'Keep your streak going with 10 minutes of practice',
      icon: '📚',
      sound: 'default',
      priority: 'normal',
      category: 'reminders',
      actions: [
        { id: 'practice', title: 'Practice Now', action: 'practice', icon: '📖', destructive: false },
        { id: 'later', title: 'Remind Later', action: 'snooze', icon: '⏰', destructive: false }
      ],
      schedule: {
        frequency: 'daily',
        time: '09:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        timezone: 'UTC'
      },
      conditions: {
        enabled: true,
        minStreak: 0,
        maxStreak: 365,
        timeRange: { start: '08:00', end: '22:00' },
        userLevel: { min: 1, max: 100 }
      }
    },
    {
      id: 'template-2',
      name: 'Achievement Unlocked',
      description: 'Celebrate user achievements',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      body: 'You\'ve completed 100 characters! 🎉',
      icon: '🏆',
      sound: 'achievement',
      priority: 'high',
      category: 'achievements',
      actions: [
        { id: 'view', title: 'View Achievement', action: 'view', icon: '👀', destructive: false },
        { id: 'share', title: 'Share', action: 'share', icon: '📤', destructive: false }
      ],
      schedule: {
        frequency: 'once',
        time: '12:00',
        days: [],
        timezone: 'UTC'
      },
      conditions: {
        enabled: true,
        minStreak: 0,
        maxStreak: 365,
        timeRange: { start: '08:00', end: '22:00' },
        userLevel: { min: 1, max: 100 }
      }
    }
  ];

  // Mock notification history
  const mockHistory: NotificationHistory[] = [
    {
      id: 'history-1',
      template: 'template-1',
      title: 'Time to practice!',
      body: 'Keep your streak going with 10 minutes of practice',
      type: 'reminder',
      sent: '2024-01-14T09:00:00Z',
      delivered: '2024-01-14T09:00:05Z',
      opened: '2024-01-14T09:15:00Z',
      clicked: '2024-01-14T09:15:30Z',
      dismissed: '',
      status: 'clicked',
      device: 'mobile',
      userAction: 'practice',
      engagement: 95
    }
  ];

  useEffect(() => {
    const loadNotificationData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check notification permission
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission);
      }
      
      setTemplates(mockTemplates);
      setHistory(mockHistory);
      setIsLoading(false);
    };

    loadNotificationData();
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
    }
  };

  const sendTestNotification = (templateId: string) => {
    if (permissionStatus !== 'granted') {
      requestPermission();
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const notification = new Notification(template.title, {
      body: template.body,
      icon: template.icon,
      badge: template.icon,
      tag: template.id,
      requireInteraction: template.priority === 'high',
      actions: template.actions.map(action => ({
        action: action.action,
        title: action.title,
        icon: action.icon
      }))
    });

    notification.onclick = () => {
      console.log('Notification clicked');
      notification.close();
    };

    // Log test notification
    const testHistory: NotificationHistory = {
      id: `test-${Date.now()}`,
      template: templateId,
      title: template.title,
      body: template.body,
      type: template.type,
      sent: new Date().toISOString(),
      delivered: new Date().toISOString(),
      opened: '',
      clicked: '',
      dismissed: '',
      status: 'sent',
      device: 'desktop',
      userAction: '',
      engagement: 0
    };

    setHistory(prev => [testHistory, ...prev.slice(0, 9)]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'streak': return <Flame className="w-5 h-5 text-orange-500" />;
      case 'goal': return <Target className="w-5 h-5 text-green-500" />;
      case 'social': return <Users className="w-5 h-5 text-purple-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-blue-600 bg-blue-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'opened': return 'text-yellow-600 bg-yellow-50';
      case 'clicked': return 'text-purple-600 bg-purple-50';
      case 'dismissed': return 'text-gray-600 bg-gray-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'granted': return 'text-green-600 bg-green-50';
      case 'denied': return 'text-red-600 bg-red-50';
      case 'default': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Loading notification system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="heading text-3xl font-bold text-gray-900">Push Notification System</h2>
          <p className="body text-gray-600">
            Manage push notifications and user engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPermissionColor(permissionStatus)}`}>
            {permissionStatus === 'granted' ? <Bell className="w-4 h-4 mr-1" /> : <BellOff className="w-4 h-4 mr-1" />}
            {permissionStatus}
          </div>
          {permissionStatus !== 'granted' && (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart },
          { id: 'templates', label: 'Templates', icon: Bell },
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'history', label: 'History', icon: Clock },
          { id: 'test', label: 'Test', icon: Play }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedView(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              selectedView === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Bell className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-500">Status</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-xs text-gray-600">Notifications</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-xs text-gray-500">Templates</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {templates.length}
              </div>
              <div className="text-xs text-gray-600">Available</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-green-500" />
                <span className="text-xs text-gray-500">Sent Today</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {history.filter(h => new Date(h.sent).toDateString() === new Date().toDateString()).length}
              </div>
              <div className="text-xs text-gray-600">Notifications</div>
            </div>
            
            <div className="bg-white border-base rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-5 h-5 text-purple-500" />
                <span className="text-xs text-gray-500">Engagement</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {Math.round(history.reduce((acc, h) => acc + h.engagement, 0) / history.length) || 0}%
              </div>
              <div className="text-xs text-gray-600">Average</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setSelectedView('templates')}
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center"
              >
                <Bell className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-700">Manage Templates</span>
              </button>
              
              <button
                onClick={() => setSelectedView('settings')}
                className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center"
              >
                <Settings className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-700">Settings</span>
              </button>
              
              <button
                onClick={() => setSelectedView('history')}
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center"
              >
                <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-700">View History</span>
              </button>
              
              <button
                onClick={() => setSelectedView('test')}
                className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center"
              >
                <Play className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <span className="text-sm font-medium text-orange-700">Test Notifications</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {selectedView === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Notification Templates</h3>
            <div className="space-y-4">
              {templates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="p-4 border-base rounded-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getTypeIcon(template.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                      <span className="text-sm text-gray-600 capitalize">{template.type}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="font-medium text-gray-900 mb-2">Preview</h5>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{template.icon}</span>
                        <span className="font-medium text-gray-900">{template.title}</span>
                      </div>
                      <p className="text-sm text-gray-600">{template.body}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Frequency: {template.schedule.frequency}
                      </span>
                      <span className="text-sm text-gray-600">
                        Time: {template.schedule.time}
                      </span>
                      <span className="text-sm text-gray-600">
                        Actions: {template.actions.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 border-base rounded text-sm hover:border-primary hover:bg-primary/5 transition-colors">
                        Edit
                      </button>
                      <button
                        onClick={() => sendTestNotification(template.id)}
                        className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark transition-colors"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {selectedView === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="font-medium">Enable Notifications</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">Receive push notifications</p>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.sound}
                    onChange={(e) => setSettings(prev => ({ ...prev, sound: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="font-medium">Sound</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">Play sound for notifications</p>
              </div>
              
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.vibration}
                    onChange={(e) => setSettings(prev => ({ ...prev, vibration: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="font-medium">Vibration</span>
                </label>
                <p className="text-sm text-gray-600 ml-6">Vibrate for notifications</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notification Categories</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(settings.categories).map(([key, value]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          categories: { ...prev.categories, [key]: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{key}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Quiet Hours</h4>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.quietHours.enabled}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: e.target.checked }
                      }))}
                      className="rounded"
                    />
                    <span className="text-sm">Enable quiet hours</span>
                  </label>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, start: e.target.value }
                      }))}
                      className="px-2 py-1 border-base rounded text-sm"
                    />
                    <span className="text-sm text-gray-600">to</span>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, end: e.target.value }
                      }))}
                      className="px-2 py-1 border-base rounded text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {selectedView === 'history' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Notification History</h3>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div key={item.id} className="flex items-center justify-between p-3 border-base rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(item.type)}
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.body}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(item.sent).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Tab */}
      {selectedView === 'test' && (
        <div className="space-y-6">
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Test Notifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => sendTestNotification(template.id)}
                  className="p-4 border-base rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(template.type)}
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{template.icon}</span>
                    <span className="text-sm font-medium">{template.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
