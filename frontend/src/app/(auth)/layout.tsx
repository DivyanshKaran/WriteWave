"use client";

import React from 'react';

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
		<div className="min-h-[calc(100vh-64px-96px)] flex items-center justify-center">
			<div className="w-full max-w-xl border border-black p-8">
        {children}
      </div>
    </div>
  );
}


