import React from 'react';

export type TextareaState = 'default' | 'error' | 'success';

interface TextareaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  required?: boolean;
  state?: TextareaState;
  errorMessage?: string;
  rows?: number;
  minHeight?: string;
  className?: string;
}

const getBorderClass = (state: TextareaState, disabled: boolean) => {
  if (disabled) return 'border-gray-200';
  switch (state) {
    case 'error':
      return 'border-error border-2';
    case 'success':
      return 'border-success border-2';
    default:
      return 'border-base hover:border-strong focus:border-2 focus:border-black';
  }
};

export const Textarea: React.FC<TextareaProps> = ({
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  state = 'default',
  errorMessage,
  rows = 4,
  minHeight = '120px',
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        rows={rows}
        style={{ minHeight }}
        className={`
          w-full px-4 py-4 body text-base resize-y
          ${getBorderClass(state, disabled)}
          ${disabled ? 'bg-gray-50 text-gray-600' : 'bg-white text-black'}
          placeholder:text-gray-600
          focus:outline-none
          transition-colors duration-200
        `}
      />
      {state === 'error' && errorMessage && (
        <p className="body text-xs text-error">{errorMessage}</p>
      )}
    </div>
  );
};
