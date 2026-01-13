import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/lib/api-client";
import { NotificationSchema } from "@/types/schemas";
import { useAuthStore } from "@/stores/auth-store";

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
  type: "achievement" | "message" | "reply" | "like" | "follow" | "system";
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Query hook for fetching notifications with TanStack Query
export function useNotificationsQuery(userId: string, params?: any) {
  return useQuery({
    queryKey: ["notifications", userId, params || {}],
    queryFn: async () => {
      const res = await notificationService.getNotifications(userId, params);
      const arr = Array.isArray(res.data) ? res.data : [];
      return arr
        .map((n: any) => {
          const parsed = NotificationSchema.safeParse(n);
          return parsed.success ? parsed.data : null;
        })
        .filter(Boolean);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const res = await notificationService.markAsRead(id);
      return res.data;
    },
    onSuccess: (_data, _vars, _ctx) => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

/**
 * Hook for managing notifications with local state
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      const response = await notificationService.getNotifications(userId);
      const notifications = response.data;

      const unreadCount = notifications.filter(
        (n: Notification) => !n.isRead
      ).length;

      setState({
        notifications,
        unreadCount,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to fetch notifications",
      }));
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await notificationService.markAsRead(id);

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } catch (error: any) {
      throw new Error(error.message || "Failed to mark notification as read");
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setState((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        })),
        unreadCount: 0,
      }));
    } catch (error: any) {
      throw new Error(
        error.message || "Failed to mark all notifications as read"
      );
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationService.deleteNotification(id);

      setState((prev) => {
        const notification = prev.notifications.find((n) => n.id === id);
        const wasUnread = notification && !notification.isRead;

        return {
          ...prev,
          notifications: prev.notifications.filter((n) => n.id !== id),
          unreadCount: wasUnread
            ? Math.max(0, prev.unreadCount - 1)
            : prev.unreadCount,
        };
      });
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete notification");
    }
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        throw new Error("User not authenticated");
      }
      await notificationService.clearAllNotifications(userId);

      setState({
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      throw new Error(error.message || "Failed to clear all notifications");
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
