"use client";

import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  valueProp?: {
    statistic: string;
    tagline: string;
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, valueProp }) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 bg-white">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Right Side - Value Prop */}
      {valueProp && (
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:bg-black lg:px-8">
          <div className="text-center text-white">
            <div className="heading text-5xl font-bold mb-4">
              {valueProp.statistic}
            </div>
            <div className="heading text-xl">
              {valueProp.tagline}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
