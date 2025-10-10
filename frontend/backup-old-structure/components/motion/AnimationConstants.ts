// Animation constants for surgical precision
export const ANIMATION_DURATION = {
  FAST: 150,      // Small, expected changes
  MODERATE: 300,  // Page transitions
  SLOW: 400,      // Complex animations
  VERY_SLOW: 500, // Scroll behaviors
} as const;

export const ANIMATION_EASING = {
  EASE_IN_OUT: 'easeInOut',
  EASE_OUT: 'easeOut',
  EASE_IN: 'easeIn',
  LINEAR: 'linear',
} as const;

export const ANIMATION_DELAYS = {
  STAGGER: 50,    // Stagger between elements
  CASCADE: 100,   // Cascade animations
} as const;

// Transform values for precise animations
export const TRANSFORM_VALUES = {
  SCALE_PRESS: 0.98,
  SCALE_HOVER: 1.02,
  SCALE_MODAL_ENTRANCE: 0.95,
  TRANSLATE_PAGE: 8,
  TRANSLATE_TOAST: 24,
  TRANSLATE_DROPDOWN: 8,
  SHAKE_DISTANCE: 4,
} as const;

// Shadow values for lift effects
export const SHADOW_VALUES = {
  CARD_HOVER: '0 2px 8px rgba(0,0,0,0.08)',
  CARD_DEFAULT: '0 1px 3px rgba(0,0,0,0.05)',
} as const;

// Opacity values
export const OPACITY_VALUES = {
  HIDDEN: 0,
  VISIBLE: 1,
  DISABLED: 0.6,
} as const;
