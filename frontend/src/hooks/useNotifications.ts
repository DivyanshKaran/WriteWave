import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'achievement' | 'message' | 'reply' | 'like' | 'follow' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

/**
 * Hook for managing notifications
 */
export function useNotifications(): NotificationState & NotificationActions {
  const [state, setState] = useState<NotificationState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
  });

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await apiClient.get('/notifications');
      const notifications = response.data;
      
      const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;
      
      setState({
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch notifications',
      }));
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === id 
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark all notifications as read');
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      
      setState(prev => {
        const notification = prev.notifications.find(n => n.id === id);
        const wasUnread = notification && !notification.isRead;
        
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, prev.unreadCount - 1) : prev.unreadCount,
        };
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await apiClient.delete('/notifications/clear-all');
      
      setState({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to clear all notifications');
    }
  }, []);

  // Subscribe to real-time notifications
  const subscribeToNotifications = useCallback(() => {
    // This would typically use WebSocket or Server-Sent Events
    // For now, we'll use polling
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = useCallback(() => {
    // Clear any polling intervals
    // In a real implementation, this would close WebSocket connections
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    ...state,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  };
}
