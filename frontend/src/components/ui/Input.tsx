import React from 'react';

export type InputState = 'default' | 'error' | 'success';

interface InputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  state?: InputState;
  errorMessage?: string;
  className?: string;
}

const getBorderClass = (state: InputState, disabled: boolean) => {
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

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
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
  className = ''
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        className={`
          w-full h-12 px-4 body text-base
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
