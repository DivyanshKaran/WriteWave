"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: (actionId: string) => void;
  title?: string;
  actions: ActionItem[];
  className?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  isOpen,
  onClose,
  onAction,
  title,
  actions,
  className = '',
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleActionClick = (actionId: string) => {
    onAction(actionId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />
          
          {/* Action Sheet */}
          <motion.div
            className={`w-full bg-white rounded-t-lg shadow-lg ${className}`}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Title */}
            {title && (
              <div className="px-4 pb-4 border-b border-gray-200">
                <h3 className="heading text-lg font-semibold text-center">{title}</h3>
              </div>
            )}
            
            {/* Actions */}
            <div className="px-4 py-4">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  disabled={action.disabled}
                  className={`
                    w-full py-4 px-4 text-left border-b border-gray-200 last:border-b-0
                    hover:bg-gray-50 active:bg-gray-100
                    ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    ${action.destructive ? 'text-red-600' : 'text-black'}
                  `}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    {action.icon && (
                      <span className="text-xl">{action.icon}</span>
                    )}
                    <span className="text-base font-medium">{action.label}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            {/* Cancel Button */}
            <div className="px-4 pb-4">
              <motion.button
                onClick={onClose}
                className="w-full py-4 px-4 text-center bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 active:bg-gray-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: actions.length * 0.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
