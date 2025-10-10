"use client";

import React from 'react';
import Link from 'next/link';
import { BookOpen, BarChart3, Users, User } from 'lucide-react';

interface BottomNavigationProps {
  currentPath?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPath }) => {
  const navItems = [
    {
      id: 'learn',
      label: 'Learn',
      href: '/learn',
      icon: BookOpen,
    },
    {
      id: 'progress',
      label: 'Progress',
      href: '/progress',
      icon: BarChart3,
    },
    {
      id: 'community',
      label: 'Community',
      href: '/community',
      icon: Users,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-black z-40">
      <div className="flex h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.href;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center min-h-touch ${
                isActive ? 'text-black' : 'text-gray-600'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
