"use client";

import React, { useState, useCallback } from 'react';
import { A11Y_CONSTANTS } from '@/lib/accessibility/constants';
import { FormAnnouncement } from './LiveRegion';

interface AccessibleFormProps {
  children: React.ReactNode;
  onSubmit?: (data: FormData) => void;
  className?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit?.(formData);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      noValidate
    >
      <FormAnnouncement errors={errors} />
      {children}
    </form>
  );
};

// Accessible form field wrapper
interface AccessibleFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  required = false,
  error,
  helpText,
  children,
  className = ''
}) => {
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helpText && helpId].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="text-error ml-1" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600">
          {helpText}
        </p>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-required': required,
          'aria-invalid': hasError,
          'aria-describedby': describedBy || undefined,
          className: `${A11Y_CONSTANTS.FOCUS_RING} ${hasError ? 'border-error' : 'border-base'}`,
        } as React.HTMLAttributes<HTMLElement>)}
      </div>
      
      {error && (
        <p
          id={errorId}
          className="text-sm text-error"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible input component
interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <AccessibleField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
    >
      <input
        {...props}
        className={`w-full px-3 py-2 border rounded-md ${className}`}
      />
    </AccessibleField>
  );
};

// Accessible textarea component
interface AccessibleTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const AccessibleTextarea: React.FC<AccessibleTextareaProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  return (
    <AccessibleField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
    >
      <textarea
        {...props}
        className={`w-full px-3 py-2 border rounded-md resize-vertical ${className}`}
      />
    </AccessibleField>
  );
};

// Accessible select component
interface AccessibleSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  className?: string;
}

export const AccessibleSelect: React.FC<AccessibleSelectProps> = ({
  label,
  required = false,
  error,
  helpText,
  options,
  className = '',
  ...props
}) => {
  return (
    <AccessibleField
      label={label}
      required={required}
      error={error}
      helpText={helpText}
    >
      <select
        {...props}
        className={`w-full px-3 py-2 border rounded-md ${className}`}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </AccessibleField>
  );
};

// Accessible checkbox component
interface AccessibleCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export const AccessibleCheckbox: React.FC<AccessibleCheckboxProps> = ({
  label,
  required = false,
  error,
  helpText,
  className = '',
  ...props
}) => {
  const fieldId = React.useId();
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const hasError = Boolean(error);
  const describedBy = [hasError && errorId, helpText && helpId].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-start">
        <input
          {...props}
          id={fieldId}
          type="checkbox"
          className={`mt-1 ${A11Y_CONSTANTS.FOCUS_RING}`}
          aria-required={required}
          aria-invalid={hasError}
          aria-describedby={describedBy || undefined}
        />
        <label
          htmlFor={fieldId}
          className="ml-2 text-sm font-medium text-gray-700"
        >
          {label}
          {required && (
            <span className="text-error ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      </div>
      
      {helpText && (
        <p id={helpId} className="text-sm text-gray-600 ml-6">
          {helpText}
        </p>
      )}
      
      {error && (
        <p
          id={errorId}
          className="text-sm text-error ml-6"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible button component
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-black text-white hover:bg-gray-800';
      case 'secondary':
        return 'bg-white text-black border-base hover:border-strong';
      case 'tertiary':
        return 'text-black hover:underline';
      case 'destructive':
        return 'bg-error text-white hover:bg-red-600';
      default:
        return 'bg-black text-white hover:bg-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2 text-base';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-md
        transition-colors duration-150
        ${A11Y_CONSTANTS.FOCUS_RING}
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      aria-disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="sr-only">Loading</span>
          <span className="animate-spin mr-2">⟳</span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};
