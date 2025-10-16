// Form validation utilities
import type { ValidationRule, ValidationResult } from '@/types';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Japanese character validation
export const validateJapaneseCharacter = (character: string): boolean => {
  // Check if it's a single Japanese character (Hiragana, Katakana, or Kanji)
  const japaneseRegex = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]$/;
  return japaneseRegex.test(character);
};

// Stroke order validation
export const validateStrokeOrder = (strokes: string[]): boolean => {
  // Basic validation - each stroke should be a valid SVG path
  const svgPathRegex = /^[MmLlHhVvCcSsQqTtAaZz\s\d.,-]+$/;
  return strokes.every(stroke => svgPathRegex.test(stroke));
};

// Generic field validation
export const validateField = (value: unknown, rules: ValidationRule): ValidationResult => {
  const errors: string[] = [];
  
  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push('This field is required');
    return { isValid: false, errors };
  }
  
  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }
  
  // Min length validation
  if (rules.minLength && value.toString().length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }
  
  // Max length validation
  if (rules.maxLength && value.toString().length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }
  
  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.toString())) {
    errors.push('Invalid format');
  }
  
  // Custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Form validation
export const validateForm = (data: Record<string, unknown>, rules: Record<string, ValidationRule>): ValidationResult => {
  const errors: string[] = [];
  let isValid = true;
  
  Object.entries(rules).forEach(([field, rule]) => {
    const result = validateField(data[field], rule);
    if (!result.isValid) {
      isValid = false;
      errors.push(...result.errors.map(error => `${field}: ${error}`));
    }
  });
  
  return { isValid, errors };
};
