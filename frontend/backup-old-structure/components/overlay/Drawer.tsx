"use client";

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onOpenChange,
  title,
  children,
  footer,
  className = ''
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content
          className={`
            fixed top-0 right-0 h-full w-full md:w-[480px] bg-white border-l border-black z-50
            flex flex-col
            focus:outline-none
            ${className}
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-black">
            {title && (
              <Dialog.Title className="heading text-xl font-bold text-black">
                {title}
              </Dialog.Title>
            )}
            <Dialog.Close
              className="
                w-8 h-8 flex items-center justify-center
                hover:border-strong rounded-sm
                focus:outline-none focus:border-2 focus:border-black
                transition-colors duration-200
              "
              aria-label="Close drawer"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="border-t border-black p-4">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
