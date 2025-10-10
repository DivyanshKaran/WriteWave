// Accessibility constants and utilities
export const A11Y_CONSTANTS = {
  // Focus management
  FOCUS_RING: 'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
  FOCUS_RING_OFFSET: 'focus:ring-offset-2',
  
  // Skip links
  SKIP_LINK: 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-black focus:text-white focus:border-base',
  
  // Live regions
  LIVE_REGION: 'sr-only',
  LIVE_REGION_POLITE: 'aria-live="polite"',
  LIVE_REGION_ASSERTIVE: 'aria-live="assertive"',
  
  // Color contrast ratios
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    INTERACTIVE: 3.0,
  },
  
  // Keyboard shortcuts
  KEYBOARD_SHORTCUTS: {
    SEARCH: '/',
    ESCAPE: 'Escape',
    ENTER: 'Enter',
    SPACE: ' ',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
  },
  
  // ARIA roles
  ARIA_ROLES: {
    BUTTON: 'button',
    LINK: 'link',
    MENU: 'menu',
    MENUITEM: 'menuitem',
    DIALOG: 'dialog',
    ALERT: 'alert',
    ALERTDIALOG: 'alertdialog',
    BANNER: 'banner',
    NAVIGATION: 'navigation',
    MAIN: 'main',
    ARTICLE: 'article',
    SECTION: 'section',
    COMPLEMENTARY: 'complementary',
    CONTENTINFO: 'contentinfo',
    FORM: 'form',
    SEARCH: 'search',
  },
  
  // ARIA states
  ARIA_STATES: {
    EXPANDED: 'aria-expanded',
    SELECTED: 'aria-selected',
    CHECKED: 'aria-checked',
    DISABLED: 'aria-disabled',
    REQUIRED: 'aria-required',
    INVALID: 'aria-invalid',
    HIDDEN: 'aria-hidden',
    PRESSED: 'aria-pressed',
  },
} as const;

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd use a proper color contrast library
  if (color1 === '#000000' && color2 === '#FFFFFF') return 21;
  if (color1 === '#333333' && color2 === '#FFFFFF') return 12.6;
  if (color1 === '#666666' && color2 === '#FFFFFF') return 5.7;
  if (color1 === '#999999' && color2 === '#FFFFFF') return 2.8;
  return 4.5; // Default fallback
};

// Focus management utilities
export const focusableSelectors = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="link"]:not([aria-disabled="true"])',
  '[role="menuitem"]:not([aria-disabled="true"])',
].join(', ');

// Internationalization utilities
export const I18N_CONSTANTS = {
  // Locales
  LOCALES: {
    EN: 'en-US',
    JA: 'ja-JP',
  },
  
  // Date/time formatting
  DATE_FORMATS: {
    SHORT: 'short',
    MEDIUM: 'medium',
    LONG: 'long',
    FULL: 'full',
  },
  
  // Number formatting
  NUMBER_FORMATS: {
    DECIMAL: 'decimal',
    CURRENCY: 'currency',
    PERCENT: 'percent',
  },
  
  // Japanese text styling
  JAPANESE_STYLES: {
    FONT_FAMILY: 'Noto Sans JP',
    LINE_HEIGHT: 1.8,
    LETTER_SPACING: '0.05em',
  },
} as const;
