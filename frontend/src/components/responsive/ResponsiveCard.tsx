"use client";

import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  swipeActions?: Array<{
    label: string;
    action: () => void;
    color?: 'primary' | 'secondary' | 'destructive';
  }>;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  onClick,
  swipeActions
}) => {
  return (
    <div 
      className={`
        w-full bg-white border-base
        mobile:mx-4 mobile:mb-4
        tablet:mx-0 tablet:mb-6
        desktop:mx-0 desktop:mb-6
        ${onClick ? 'cursor-pointer hover:border-strong' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="p-4 mobile:p-4 tablet:p-6 desktop:p-6">
        {children}
      </div>
    </div>
  );
};

// Grid layouts for different screen sizes
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  className?: string;
}> = ({ 
  children, 
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: 'gap-4', tablet: 'gap-6', desktop: 'gap-6' },
  className = ''
}) => {
  const getGridClasses = () => {
    const mobileCols = columns.mobile || 1;
    const tabletCols = columns.tablet || 2;
    const desktopCols = columns.desktop || 3;
    
    return `
      grid
      mobile:grid-cols-${mobileCols}
      tablet:grid-cols-${tabletCols}
      desktop:grid-cols-${desktopCols}
      ${gap.mobile || 'gap-4'}
      tablet:${gap.tablet || 'gap-6'}
      desktop:${gap.desktop || 'gap-6'}
    `;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {children}
    </div>
  );
};
