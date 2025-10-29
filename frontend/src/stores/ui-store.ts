import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Notification, Toast, Modal, LoadingState } from '@/types';

interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // Toast messages
  toasts: Toast[];
  
  // Modals
  modals: Modal[];
  
  // Loading states
  globalLoading: LoadingState;
  
  // Sidebar and navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  
  // Search and filters
  searchOpen: boolean;
  
  // Error states
  globalError: string | null;
}

interface UIActions {
  // Theme actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  // Notification actions
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: LoadingState) => void;
  clearGlobalLoading: () => void;
  
  // Navigation actions
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  
  // Error actions
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;
  
  // Utility actions
  resetUI: () => void;
}

type UIStore = UIState & UIActions;

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'system',
      fontSize: 'medium',
      notifications: [],
      unreadCount: 0,
      toasts: [],
      modals: [],
      globalLoading: { isLoading: false },
      sidebarOpen: false,
      mobileMenuOpen: false,
      searchOpen: false,
      globalError: null,

      // Theme actions
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),

      // Notification actions
      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.isRead).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) => set((state) => {
        const newNotification = { ...notification, id: generateId() };
        const unreadCount = notification.isRead ? state.unreadCount : state.unreadCount + 1;
        return {
          notifications: [newNotification, ...state.notifications],
          unreadCount,
        };
      }),

      markAsRead: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        if (!notification || notification.isRead) return state;
        
        return {
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }),

      markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0,
      })),

      removeNotification: (id) => set((state) => {
        const notification = state.notifications.find(n => n.id === id);
        const wasUnread = notification && !notification.isRead;
        
        return {
          notifications: state.notifications.filter(n => n.id !== id),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      }),

      clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

      // Toast actions
      addToast: (toast) => set((state) => {
        const newToast = { ...toast, id: generateId() };
        return {
          toasts: [...state.toasts, newToast],
        };
      }),

      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id),
      })),

      clearToasts: () => set({ toasts: [] }),

      // Modal actions
      openModal: (modal) => set((state) => {
        const newModal = { ...modal, id: generateId(), isOpen: true };
        return {
          modals: [...state.modals, newModal],
        };
      }),

      closeModal: (id) => set((state) => ({
        modals: state.modals.map(m =>
          m.id === id ? { ...m, isOpen: false } : m
        ),
      })),

      closeAllModals: () => set({ modals: [] }),

      // Loading actions
      setGlobalLoading: (loading) => set({ globalLoading: loading }),
      clearGlobalLoading: () => set({ globalLoading: { isLoading: false } }),

      // Navigation actions
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),

      // Error actions
      setGlobalError: (globalError) => set({ globalError }),
      clearGlobalError: () => set({ globalError: null }),

      // Utility actions
      resetUI: () => set({
        theme: 'system',
        fontSize: 'medium',
        notifications: [],
        unreadCount: 0,
        toasts: [],
        modals: [],
        globalLoading: { isLoading: false },
        sidebarOpen: false,
        mobileMenuOpen: false,
        searchOpen: false,
        globalError: null,
      }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Selectors for better performance
export const useUI = () => useUIStore((state) => ({
  theme: state.theme,
  fontSize: state.fontSize,
  sidebarOpen: state.sidebarOpen,
  mobileMenuOpen: state.mobileMenuOpen,
  searchOpen: state.searchOpen,
  globalLoading: state.globalLoading,
  globalError: state.globalError,
}));

export const useUIActions = () => useUIStore((state) => ({
  setTheme: state.setTheme,
  setFontSize: state.setFontSize,
  setSidebarOpen: state.setSidebarOpen,
  setMobileMenuOpen: state.setMobileMenuOpen,
  setSearchOpen: state.setSearchOpen,
  setGlobalLoading: state.setGlobalLoading,
  clearGlobalLoading: state.clearGlobalLoading,
  setGlobalError: state.setGlobalError,
  clearGlobalError: state.clearGlobalError,
  resetUI: state.resetUI,
}));

export const useNotifications = () => useUIStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
}));

export const useNotificationActions = () => useUIStore((state) => ({
  setNotifications: state.setNotifications,
  addNotification: state.addNotification,
  markAsRead: state.markAsRead,
  markAllAsRead: state.markAllAsRead,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}));

export const useToasts = () => useUIStore((state) => state.toasts);

export const useToastActions = () => useUIStore((state) => ({
  addToast: state.addToast,
  removeToast: state.removeToast,
  clearToasts: state.clearToasts,
}));

export const useModals = () => useUIStore((state) => state.modals);

export const useModalActions = () => useUIStore((state) => ({
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
}));
