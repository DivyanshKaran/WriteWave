// UI Types - Toast, Modal, Theme, and UI-related types

// Toast Types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  isVisible: boolean;
}

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Modal Types
export interface Modal {
  id: string;
  type: 'confirm' | 'info' | 'form' | 'custom';
  title: string;
  content: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  isOpen: boolean;
}

// UI State
export interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ja';
  sidebarCollapsed: boolean;
  
  // Modals
  modals: Modal[];
  activeModal: string | null;
  
  // Toasts
  toasts: Toast[];
  
  // Loading states
  globalLoading: boolean;
  pageLoading: boolean;
  
  // Navigation state
  currentPage: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  
  // Form states
  formErrors: Record<string, Record<string, string[]>>;
  formSubmitting: Record<string, boolean>;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLanguage: (language: 'en' | 'ja') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Modal actions
  openModal: (modal: Omit<Modal, 'id' | 'isOpen'>) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id' | 'isVisible'>) => string;
  removeToast: (id: string) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setPageLoading: (loading: boolean) => void;
  
  // Navigation actions
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href: string }>) => void;
  
  // Form actions
  setFormError: (formId: string, field: string, error: string) => void;
  clearFormError: (formId: string, field: string) => void;
  clearFormErrors: (formId: string) => void;
  setFormSubmitting: (formId: string, submitting: boolean) => void;
  
  // Utility actions
  resetUI: () => void;
}

// Validation Types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Form Types
export interface FormState {
  values: Record<string, unknown>;
  errors: Record<string, string[]>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  children?: NavigationItem[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

// Layout Types
export interface LayoutConfig {
  sidebar: {
    collapsed: boolean;
    width: number;
    minWidth: number;
    maxWidth: number;
  };
  header: {
    height: number;
    sticky: boolean;
  };
  footer: {
    height: number;
    sticky: boolean;
  };
  content: {
    padding: number;
    maxWidth: number;
  };
}

// Theme Types
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Animation Types
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

// Responsive Types
export interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// Accessibility Types
export interface AccessibilityConfig {
  focusRing: string;
  skipLink: string;
  liveRegion: string;
  contrastRatio: {
    normal: number;
    large: number;
    interactive: number;
  };
  keyboardShortcuts: Record<string, string>;
  ariaRoles: Record<string, string>;
  ariaStates: Record<string, string>;
}

// Performance Types
export interface PerformanceMetrics {
  touchLatency: number;
  scrollFPS: number;
  memoryUsage: number;
}

// Error Types
export interface UIError {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  details?: string;
  timestamp: string;
  dismissed: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Loading Types
export interface LoadingState {
  global: boolean;
  page: boolean;
  component: Record<string, boolean>;
  form: Record<string, boolean>;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'achievement' | 'streak' | 'lesson_reminder' | 'community' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}
