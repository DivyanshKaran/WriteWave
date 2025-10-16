"use client";

import React from 'react';
import Link from 'next/link';

interface MonochromeAppShellProps {
  children: React.ReactNode;
  current?: string;
}

const nav = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'learn', label: 'Learn', href: '/learn' },
  { id: 'progress', label: 'Progress', href: '/progress' },
  { id: 'community', label: 'Community', href: '/community' },
];

export default function MonochromeAppShell({ children, current = 'home' }: MonochromeAppShellProps) {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-black/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 border border-black flex items-center justify-center">
              <span className="text-xs font-semibold">WW</span>
            </div>
            <span className="font-semibold tracking-wide">WriteWave</span>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            {nav.map(item => (
              <Link
                key={item.id}
                href={item.href}
                className={`px-3 py-2 text-sm ${current === item.id ? 'bg-black text-white' : 'hover:bg-black hover:text-white'} transition-colors`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main id="main-content" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-black/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between text-sm">
          <span>© {new Date().getFullYear()} WriteWave</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}


