"use client";

import React from 'react';
import { Bell, Settings, User, Flame } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: number;
}

interface QuickActionsProps {
  actions: QuickAction[];
  streak?: number;
  className?: string;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  streak,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {streak && streak > 0 && (
        <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
          <Flame className="w-4 h-4" />
          <span>{streak}</span>
        </div>
      )}
      
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label={action.label}
        >
          {action.icon}
          {action.badge && action.badge > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {action.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export const CommonQuickActions = {
  notifications: (count: number = 0): QuickAction => ({
    id: 'notifications',
    icon: <Bell className="w-5 h-5" />,
    label: 'Notifications',
    href: '/notifications',
    badge: count
  }),
  
  settings: (): QuickAction => ({
    id: 'settings',
    icon: <Settings className="w-5 h-5" />,
    label: 'Settings',
    href: '/settings'
  }),
  
  profile: (): QuickAction => ({
    id: 'profile',
    icon: <User className="w-5 h-5" />,
    label: 'Profile',
    href: '/profile'
  })
};