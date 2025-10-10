import React from 'react';

interface CheckboxProps {
  id?: string;
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
}

const CheckIcon: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  name,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  required = false,
  label,
  className = ''
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <input
          id={checkboxId}
          name={name}
          type="checkbox"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="sr-only"
        />
        <label
          htmlFor={checkboxId}
          className={`
            w-5 h-5 border-2 border-black cursor-pointer flex items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-strong'}
            ${checked ? 'bg-black' : 'bg-white'}
            transition-colors duration-200
          `}
        >
          {checked && <CheckIcon />}
        </label>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className={`body text-sm ml-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
