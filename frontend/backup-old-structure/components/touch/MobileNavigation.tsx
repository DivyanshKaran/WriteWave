"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  href?: string;
}

interface MobileNavigationProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  items,
  activeTab,
  onTabChange,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { y } = useSpring({
    y: isVisible ? 0 : 100,
    config: { tension: 300, friction: 30 },
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide nav
        setIsVisible(false);
      } else {
        // Scrolling up - show nav
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <animated.div
      style={{ y }}
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 ${className}`}
    >
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`
              flex flex-col items-center justify-center px-3 py-2 min-h-[56px]
              ${activeTab === item.id ? 'text-black' : 'text-gray-500'}
              hover:text-black transition-colors duration-200
            `}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <span className="text-2xl">{item.icon}</span>
              {item.badge && item.badge > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.div>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{item.label}</span>
            
            {/* Active indicator */}
            <AnimatePresence>
              {activeTab === item.id && (
                <motion.div
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </animated.div>
  );
};

// Hamburger Menu Component
interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  children,
  className = '',
}) => {
  const { x } = useSpring({
    x: isOpen ? 0 : -320,
    config: { tension: 300, friction: 30 },
  });

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={onToggle}
        className="w-10 h-10 flex items-center justify-center border-base hover:border-strong"
        aria-label="Toggle navigation menu"
      >
        <div className="w-6 h-6 flex flex-col justify-between">
          <motion.div
            className="w-full h-0.5 bg-black"
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="w-full h-0.5 bg-black"
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          />
          <motion.div
            className="w-full h-0.5 bg-black"
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            
            {/* Menu */}
            <animated.div
              style={{ x }}
              className={`absolute left-0 top-0 h-full w-80 max-w-[80vw] bg-white shadow-lg ${className}`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </animated.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
