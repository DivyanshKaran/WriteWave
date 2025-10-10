"use client";

import React from 'react';
import { X } from 'lucide-react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60">
      <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-lg animate-slide-up mobile:rounded-none">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
            <h2 className="heading text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center"
              aria-label="Close modal"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>
        )}

        {/* Content */}
        <div className={`max-h-[80vh] overflow-y-auto ${className}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
