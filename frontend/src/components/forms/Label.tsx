import React from 'react';

interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export const Label: React.FC<LabelProps> = ({ 
  children, 
  htmlFor, 
  required = false, 
  className = '' 
}) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`body text-xs font-medium uppercase tracking-widest text-gray-800 block mb-2 ${className}`}
    >
      {children}
      {required && <span className="ml-1">*</span>}
    </label>
  );
};
