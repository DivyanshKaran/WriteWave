"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_DURATION, ANIMATION_EASING } from './AnimationConstants';

interface TabAnimationProps {
  activeTab: string;
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabAnimation: React.FC<TabAnimationProps> = ({
  activeTab,
  tabs,
  onTabChange,
  className = ''
}) => {
  const activeTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  return (
    <div className={className}>
      {/* Tab Headers */}
      <div className="relative border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-4 px-1 text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'text-black'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              
              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                  transition={{
                    duration: ANIMATION_DURATION.FAST / 1000,
                    ease: ANIMATION_EASING.EASE_IN_OUT,
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{
            duration: ANIMATION_DURATION.FAST / 1000,
            ease: ANIMATION_EASING.EASE_OUT,
          }}
        >
          {tabs[activeTabIndex]?.content}
        </motion.div>
      </div>
    </div>
  );
};

// Simple tab switcher without content
export const TabSwitcher: React.FC<{
  activeTab: string;
  tabs: Array<{ id: string; label: string }>;
  onTabChange: (tabId: string) => void;
  className?: string;
}> = ({ activeTab, tabs, onTabChange, className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative py-4 px-1 text-sm font-medium transition-colors duration-150 ${
              activeTab === tab.id
                ? 'text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            
            {/* Active indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                transition={{
                  duration: ANIMATION_DURATION.FAST / 1000,
                  ease: ANIMATION_EASING.EASE_IN_OUT,
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
