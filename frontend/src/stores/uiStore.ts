// UI Store - Modals, Toasts, Theme, and UI State
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState, Toast, Modal } from '@/types';

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: 'system',
      language: 'en',
      sidebarCollapsed: false,
      modals: [],
      activeModal: null,
      toasts: [],
      globalLoading: false,
      pageLoading: false,
      currentPage: '',
      breadcrumbs: [],
      formErrors: {},
      formSubmitting: {},

      // Theme actions
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else if (theme === 'light') {
            root.classList.remove('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              root.classList.add('dark');
            } else {
              root.classList.remove('dark');
            }
          }
        }
      },

      setLanguage: (language: 'en' | 'ja') => {
        set({ language });
      },

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },

      // Modal actions
      openModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newModal: Modal = {
          ...modal,
          id,
          isOpen: true,
        };
        
        set(state => ({
          modals: [...state.modals, newModal],
          activeModal: id,
        }));
        
        return id;
      },

      closeModal: (id: string) => {
        set(state => ({
          modals: state.modals.map(modal =>
            modal.id === id ? { ...modal, isOpen: false } : modal
          ),
          activeModal: state.activeModal === id ? null : state.activeModal,
        }));
        
        // Remove modal after animation
        setTimeout(() => {
          set(state => ({
            modals: state.modals.filter(modal => modal.id !== id),
          }));
        }, 300);
      },

      closeAllModals: () => {
        set(state => ({
          modals: state.modals.map(modal => ({ ...modal, isOpen: false })),
          activeModal: null,
        }));
        
        // Remove all modals after animation
        setTimeout(() => {
          set({ modals: [] });
        }, 300);
      },

      // Toast actions
      addToast: (toast: Omit<Toast, 'id' | 'isVisible'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: Toast = {
          ...toast,
          id,
          isVisible: true,
        };
        
        set(state => ({
          toasts: [...state.toasts, newToast],
        }));
        
        // Auto-remove toast after duration
        const duration = toast.duration || 5000;
        setTimeout(() => {
          get().hideToast(id);
        }, duration);
        
        return id;
      },

      removeToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.filter(toast => toast.id !== id),
        }));
      },

      hideToast: (id: string) => {
        set(state => ({
          toasts: state.toasts.map(toast =>
            toast.id === id ? { ...toast, isVisible: false } : toast
          ),
        }));
        
        // Remove toast after animation
        setTimeout(() => {
          get().removeToast(id);
        }, 300);
      },

      clearAllToasts: () => {
        set({ toasts: [] });
      },

      // Loading actions
      setGlobalLoading: (loading: boolean) => {
        set({ globalLoading: loading });
      },

      setPageLoading: (loading: boolean) => {
        set({ pageLoading: loading });
      },

      // Navigation actions
      setCurrentPage: (page: string) => {
        set({ currentPage: page });
      },

      setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => {
        set({ breadcrumbs });
      },

      // Form actions
      setFormError: (formId: string, field: string, error: string) => {
        set(state => ({
          formErrors: {
            ...state.formErrors,
            [formId]: {
              ...state.formErrors[formId],
              [field]: [...((state.formErrors[formId] as any)?.[field] || []), error],
            },
          },
        }));
      },

      clearFormError: (formId: string, field: string) => {
        set(state => {
          const newFormErrors = { ...state.formErrors };
          if (newFormErrors[formId]) {
            newFormErrors[formId] = { ...newFormErrors[formId] };
            delete (newFormErrors[formId] as any)[field];
          }
          return { formErrors: newFormErrors };
        });
      },

      clearFormErrors: (formId: string) => {
        set(state => {
          const newFormErrors = { ...state.formErrors };
          delete newFormErrors[formId];
          return { formErrors: newFormErrors };
        });
      },

      setFormSubmitting: (formId: string, submitting: boolean) => {
        set(state => ({
          formSubmitting: {
            ...state.formSubmitting,
            [formId]: submitting,
          },
        }));
      },

      // Reset UI state
      resetUI: () => {
        set({
          modals: [],
          activeModal: null,
          toasts: [],
          globalLoading: false,
          pageLoading: false,
          currentPage: '',
          breadcrumbs: [],
          formErrors: {},
          formSubmitting: {},
        });
      },
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);
