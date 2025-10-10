"use client";

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onOpenChange,
  title,
  children,
  actions,
  className = ''
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-60 z-50" />
        <Dialog.Content
          className={`
            fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
            max-w-[540px] w-full mx-4 bg-white border-base p-8 z-50
            focus:outline-none
            ${className}
          `}
        >
          <div className="flex items-start justify-between mb-2">
            {title && (
              <Dialog.Title className="heading text-2xl font-bold text-black">
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
              aria-label="Close modal"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </Dialog.Close>
          </div>
          
          <div className="mb-6">
            {children}
          </div>
          
          {actions && (
            <div className="flex justify-end gap-4">
              {actions}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
