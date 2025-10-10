"use client";

import React, { useState, useEffect } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/stores';

import type { ToastType, ToastData } from '@/types';

interface ToastProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const getToastIcon = (type: ToastType) => {
  const iconClass = "w-5 h-5";
  switch (type) {
    case 'success':
      return <CheckCircle className={`${iconClass} text-success`} />;
    case 'error':
      return <AlertCircle className={`${iconClass} text-error`} />;
    case 'warning':
      return <AlertTriangle className={`${iconClass} text-warning`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-primary`} />;
  }
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.duration]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onRemove(toast.id);
    }
    setOpen(isOpen);
  };

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      className="
        fixed top-6 right-6 max-w-[400px] w-full bg-white border-base p-4 z-50
        flex items-start gap-3
        data-[state=open]:animate-slide-in-right
        data-[state=closed]:animate-fade-out
      "
    >
      <div className="flex-shrink-0 mt-0.5">
        {getToastIcon(toast.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <ToastPrimitive.Title className="body text-sm font-medium text-black">
          {toast.title}
        </ToastPrimitive.Title>
        {toast.description && (
          <ToastPrimitive.Description className="body text-sm text-gray-600 mt-1">
            {toast.description}
          </ToastPrimitive.Description>
        )}
      </div>
      
      <ToastPrimitive.Close
        className="
          flex-shrink-0 w-5 h-5 flex items-center justify-center
          hover:border-strong rounded-sm
          focus:outline-none focus:border-2 focus:border-black
          transition-colors duration-200
        "
        aria-label="Close toast"
      >
        <X className="w-4 h-4" strokeWidth={1.5} />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
};

// Toast Provider and Context
interface ToastContextType {
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, addToast, removeToast } = useUIStore();

  const contextValue: ToastContextType = {
    addToast: (toast: Omit<ToastData, 'id'>) => {
      addToast({
        type: toast.type,
        title: toast.title,
        description: toast.description,
        duration: toast.duration,
      });
    },
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider>
        {children}
        <div className="fixed top-6 right-6 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
