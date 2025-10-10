"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  children,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`
      fixed left-0 top-0 h-full bg-white border-r border-black z-30
      transition-all duration-300 ease-in-out
      mobile:hidden
      tablet:block
      desktop:block
      ${isCollapsed ? 'w-16' : 'w-70'}
      ${className}
    `}>
      {/* Collapse Toggle */}
      <div className="flex justify-end p-4 border-b border-gray-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 flex items-center justify-center border-base hover:border-strong"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight size={16} strokeWidth={1.5} />
          ) : (
            <ChevronLeft size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Content */}
      <div className={`p-4 ${isCollapsed ? 'hidden' : 'block'}`}>
        {children}
      </div>

      {/* Collapsed Content */}
      {isCollapsed && (
        <div className="p-2">
          {/* Icon-only navigation items would go here */}
          <div className="space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      )}
    </div>
  );
};
