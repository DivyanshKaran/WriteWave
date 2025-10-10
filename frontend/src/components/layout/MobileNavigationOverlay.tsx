"use client";

import React from 'react';
import { X } from 'lucide-react';

interface MobileNavigationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: Array<{ id: string; label: string; href: string }>;
}

export const MobileNavigationOverlay: React.FC<MobileNavigationOverlayProps> = ({
  isOpen,
  onClose,
  navigation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white animate-slide-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-black">
        <div className="w-12 h-12 border-base flex items-center justify-center">
          <span className="heading text-xl font-bold">WW</span>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center border-base hover:border-strong"
          aria-label="Close navigation"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                className="block w-full h-14 px-4 flex items-center text-lg font-medium text-black hover:bg-gray-50 border-base"
                onClick={onClose}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Additional Mobile Actions */}
      <div className="px-4 py-6 border-t border-gray-200">
        <div className="space-y-2">
          <a
            href="/profile"
            className="block w-full h-14 px-4 flex items-center text-lg font-medium text-black hover:bg-gray-50 border-base"
            onClick={onClose}
          >
            Profile
          </a>
          <a
            href="/settings"
            className="block w-full h-14 px-4 flex items-center text-lg font-medium text-black hover:bg-gray-50 border-base"
            onClick={onClose}
          >
            Settings
          </a>
        </div>
      </div>
    </div>
  );
};
