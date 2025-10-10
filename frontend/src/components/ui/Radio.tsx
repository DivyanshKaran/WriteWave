import React from 'react';

interface RadioProps {
  id?: string;
  name: string;
  value: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  className?: string;
}

const RadioIcon: React.FC = () => (
  <div className="w-2 h-2 bg-white rounded-sm" />
);

export const Radio: React.FC<RadioProps> = ({
  id,
  name,
  value,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  required = false,
  label,
  className = ''
}) => {
  const radioId = id || `radio-${name}-${value}`;

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <input
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className="sr-only"
        />
        <label
          htmlFor={radioId}
          className={`
            w-5 h-5 border-2 border-black cursor-pointer flex items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-strong'}
            ${checked ? 'bg-black' : 'bg-white'}
            transition-colors duration-200
          `}
        >
          {checked && <RadioIcon />}
        </label>
      </div>
      {label && (
        <label
          htmlFor={radioId}
          className={`body text-sm ml-2 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </label>
      )}
    </div>
  );
};
