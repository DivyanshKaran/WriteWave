"use client";

import React from 'react';
import { Button } from '@/components/ui';

interface EmailVerificationProps {
  status: 'pending' | 'success' | 'expired';
  email?: string;
  onResend?: () => void;
  loading?: boolean;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ 
  status, 
  email, 
  onResend, 
  loading = false 
}) => {
  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          ),
          title: 'Verify your email',
          description: `We've sent a verification link to ${email}. Please check your email and click the link to verify your account.`,
          action: onResend ? (
            <Button variant="tertiary" onClick={onResend} loading={loading}>
              Resend verification email
            </Button>
          ) : null,
        };
      case 'success':
        return {
          icon: (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          ),
          title: 'Email verified!',
          description: 'Your email has been successfully verified. You can now access all features of WriteWave.',
          action: (
            <Button onClick={() => window.location.href = '/login'}>
              Continue to Login
            </Button>
          ),
        };
      case 'expired':
        return {
          icon: (
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
          ),
          title: 'Verification link expired',
          description: 'The verification link has expired. Please request a new verification email.',
          action: onResend ? (
            <Button onClick={onResend} loading={loading}>
              Send new verification email
            </Button>
          ) : null,
        };
    }
  };

  const { icon, title, description, action } = getStatusInfo();

  return (
    <div className="w-full max-w-[400px] mx-auto text-center">
      {/* Logo */}
      <div className="w-16 h-16 border-base flex items-center justify-center mx-auto mb-8">
        <span className="heading text-2xl font-bold">WW</span>
      </div>

      {/* Status Icon */}
      <div className="w-16 h-16 flex items-center justify-center mx-auto mb-8 text-black">
        {icon}
      </div>

      {/* Heading */}
      <h1 className="heading text-3xl font-bold mb-4">
        {title}
      </h1>

      {/* Description */}
      <p className="body text-base text-gray-600 mb-8">
        {description}
      </p>

      {/* Action */}
      {action && (
        <div className="space-y-4">
          {action}
          {status === 'pending' && (
            <a href="/login" className="body text-sm text-gray-600 hover:underline block">
              Back to login
            </a>
          )}
        </div>
      )}
    </div>
  );
};
