"use client";

import React from 'react';

interface ToggleProps {
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

export const Toggle: React.FC<ToggleProps> = ({
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
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <input
          id={toggleId}
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
          htmlFor={toggleId}
          className={`
            w-11 h-6 border border-black cursor-pointer relative block
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${checked ? 'border-primary' : 'bg-white'}
            transition-all duration-200 ease-in-out
          `}
        >
          <span
            className={`
              absolute top-0.5 left-0.5 w-5 h-5 bg-black transition-transform duration-200 ease-in-out
              ${checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </label>
      </div>
      {label && (
        <label
          htmlFor={toggleId}
          className={`body text-sm ml-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
