"use client";

import React, { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  options: SelectOption[];
  className?: string;
}

const DropdownArrow: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5"
    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

export const Select: React.FC<SelectProps> = ({
  name,
  placeholder = 'Select an option',
  value,
  defaultValue,
  onChange,
  disabled = false,
  required = false,
  options,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  // Update selected label when value changes
  useEffect(() => {
    const option = options.find(opt => opt.value === selectedValue);
    setSelectedLabel(option?.label || '');
  }, [selectedValue, options]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    
    setSelectedValue(option.value);
    setSelectedLabel(option.label);
    onChange?.(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <div
        className={`
          w-full h-12 px-4 body text-base
          border-base bg-white text-black
          flex items-center justify-between cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-strong focus:border-2 focus:border-black'}
          focus:outline-none transition-colors duration-200
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="select-listbox"
      >
        <span className={selectedValue ? 'text-black' : 'text-gray-600'}>
          {selectedLabel || placeholder}
        </span>
        <DropdownArrow isOpen={isOpen} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border-base shadow-lg">
          <ul id="select-listbox" role="listbox" className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className={`
                  h-10 px-4 body text-base flex items-center cursor-pointer
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}
                  ${option.value === selectedValue ? 'bg-gray-50' : ''}
                  transition-colors duration-150
                `}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={option.value === selectedValue}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedValue}
        required={required}
      />
    </div>
  );
};
