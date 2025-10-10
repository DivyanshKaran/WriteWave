// Internationalization utilities
import { I18N_CONSTANTS } from '@/lib/constants';

// Locale detection
export const getLocale = (): string => {
  if (typeof window !== 'undefined') {
    return navigator.language || I18N_CONSTANTS.LOCALES.EN;
  }
  return I18N_CONSTANTS.LOCALES.EN;
};

// Date formatting
export const formatDate = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale: string = getLocale()
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// Number formatting
export const formatNumber = (
  number: number,
  locale: string = getLocale(),
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat(locale, options).format(number);
};

// Currency formatting
export const formatCurrency = (
  amount: number,
  locale: string = getLocale(),
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  locale: string = getLocale(),
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    ...options,
  }).format(value);
};

// Japanese text utilities
export const isJapaneseText = (text: string): boolean => {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
};

export const getJapaneseStyles = () => {
  return {
    fontFamily: I18N_CONSTANTS.JAPANESE_STYLES.FONT_FAMILY,
    lineHeight: I18N_CONSTANTS.JAPANESE_STYLES.LINE_HEIGHT,
    letterSpacing: I18N_CONSTANTS.JAPANESE_STYLES.LETTER_SPACING,
  };
};

// RTL support
export const isRTLLocale = (locale: string): boolean => {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.some(rtlLocale => locale.startsWith(rtlLocale));
};

export const getDirection = (locale: string = getLocale()): 'ltr' | 'rtl' => {
  return isRTLLocale(locale) ? 'rtl' : 'ltr';
};

// Translation keys (placeholder for future i18n implementation)
export const TRANSLATION_KEYS = {
  // Navigation
  NAV: {
    LEARN: 'nav.learn',
    PROGRESS: 'nav.progress',
    COMMUNITY: 'nav.community',
    PROFILE: 'nav.profile',
  },
  
  // Common actions
  ACTIONS: {
    SAVE: 'actions.save',
    CANCEL: 'actions.cancel',
    DELETE: 'actions.delete',
    EDIT: 'actions.edit',
    CLOSE: 'actions.close',
    SUBMIT: 'actions.submit',
  },
  
  // Form labels
  FORMS: {
    EMAIL: 'forms.email',
    PASSWORD: 'forms.password',
    NAME: 'forms.name',
    CONFIRM_PASSWORD: 'forms.confirmPassword',
  },
  
  // Messages
  MESSAGES: {
    SUCCESS: 'messages.success',
    ERROR: 'messages.error',
    LOADING: 'messages.loading',
    NO_DATA: 'messages.noData',
  },
  
  // Accessibility
  A11Y: {
    SKIP_TO_CONTENT: 'a11y.skipToContent',
    SKIP_TO_NAV: 'a11y.skipToNav',
    REQUIRED_FIELD: 'a11y.requiredField',
    ERROR_MESSAGE: 'a11y.errorMessage',
  },
} as const;

// Placeholder translation function
export const t = (key: string, params?: Record<string, string | number>): string => {
  // In a real implementation, this would use a translation library
  // For now, return the key as a fallback
  return key;
};
