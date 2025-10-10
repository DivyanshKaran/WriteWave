"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING, TRANSFORM_VALUES, OPACITY_VALUES } from './AnimationConstants';

interface ModalAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const ModalAnimation: React.FC<ModalAnimationProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: ANIMATION_DURATION.FAST / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ 
              opacity: OPACITY_VALUES.HIDDEN,
              scale: TRANSFORM_VALUES.SCALE_MODAL_ENTRANCE 
            }}
            animate={{ 
              opacity: OPACITY_VALUES.VISIBLE,
              scale: 1 
            }}
            exit={{ 
              opacity: OPACITY_VALUES.HIDDEN,
              scale: TRANSFORM_VALUES.SCALE_MODAL_ENTRANCE 
            }}
            transition={{
              duration: ANIMATION_DURATION.FAST / 1000,
              ease: ANIMATION_EASING.EASE_OUT,
            }}
            className={`bg-white border-base max-w-md w-full ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Drawer animation (slides from right)
export const DrawerAnimation: React.FC<ModalAnimationProps> = ({
  isOpen,
  onClose,
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: ANIMATION_DURATION.FAST / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
          className="fixed inset-0 z-50 bg-black bg-opacity-60"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: ANIMATION_DURATION.MODERATE / 1000,
              ease: ANIMATION_EASING.EASE_OUT,
            }}
            className={`bg-white border-l border-black h-full w-full max-w-md ml-auto ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
