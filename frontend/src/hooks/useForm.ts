import { useState, useCallback, useEffect } from 'react';
import { z } from 'zod';

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormActions<T> {
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  setTouchedAll: (touched: boolean) => void;
  reset: () => void;
  submit: () => Promise<void>;
}

/**
 * Enhanced form handling hook with validation
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationSchema?: z.ZodSchema<T>,
  onSubmit?: (values: T) => Promise<void> | void
): FormState<T> & FormActions<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validateForm = useCallback(() => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0 && validateForm();
  }, [errors, validateForm]);

  // Validate single field
  const validateField = useCallback((field: keyof T) => {
    if (!validationSchema) return;

    try {
      const fieldSchema = validationSchema.shape[field as string];
      if (fieldSchema) {
        fieldSchema.parse(values[field]);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [field]: error.errors[0]?.message || 'Invalid value',
        }));
      }
    }
  }, [values, validationSchema]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setValuesPartial = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const setErrorsPartial = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrors(prev => ({ ...prev, ...newErrors }));
  }, []);

  const setTouchedField = useCallback((field: keyof T, touchedValue: boolean) => {
    setTouched(prev => ({ ...prev, [field]: touchedValue }));
    
    // Validate field when it's touched
    if (touchedValue) {
      validateField(field);
    }
  }, [validateField]);

  const setTouchedAll = useCallback((touchedValue: boolean) => {
    const newTouched: Partial<Record<keyof T, boolean>> = {};
    Object.keys(values).forEach(key => {
      newTouched[key as keyof T] = touchedValue;
    });
    setTouched(newTouched);
    
    // Validate all fields when touched
    if (touchedValue) {
      validateForm();
    }
  }, [values, validateForm]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    setTouchedAll(true);
    
    // Validate form
    const isFormValid = validateForm();
    
    if (isFormValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  }, [values, onSubmit, validateForm, setTouchedAll]);

  // Auto-validate on value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(touched).length > 0) {
        validateForm();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [values, touched, validateForm]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues: setValuesPartial,
    setError,
    setErrors: setErrorsPartial,
    setTouched: setTouchedField,
    setTouchedAll,
    reset,
    submit,
  };
}
