"use client";

import React from 'react';
import { A11Y_CONSTANTS } from '@/lib/constants';

interface SkipLinksProps {
  links?: Array<{
    href: string;
    label: string;
  }>;
}

export const SkipLinks: React.FC<SkipLinksProps> = ({ 
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#navigation', label: 'Skip to navigation' },
    { href: '#search', label: 'Skip to search' },
  ]
}) => {
  return (
    <div className="sr-only focus-within:not-sr-only">
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className={A11Y_CONSTANTS.SKIP_LINK}
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(link.href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
              (target as HTMLElement).focus();
            }
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

// Individual skip link component
export const SkipLink: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
}> = ({ href, children, className = '' }) => {
  return (
    <a
      href={href}
      className={`${A11Y_CONSTANTS.SKIP_LINK} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          (target as HTMLElement).focus();
        }
      }}
    >
      {children}
    </a>
  );
};
