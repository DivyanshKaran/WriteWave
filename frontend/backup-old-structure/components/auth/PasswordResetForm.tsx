"use client";

import React, { useState } from 'react';
import { Label, Input, Button } from '@/components/ui';

interface PasswordResetFormProps {
  onSubmit: (email: string) => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
}

export const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ 
  onSubmit, 
  loading = false, 
  error,
  success = false 
}) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[400px] mx-auto text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 border-base bg-success bg-opacity-10 flex items-center justify-center mx-auto mb-8">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="heading text-3xl font-bold mb-4">
          Check your email
        </h1>

        {/* Description */}
        <p className="body text-base text-gray-600 mb-8">
          We&apos;ve sent a password reset link to <strong>{email}</strong>. 
          Click the link in the email to reset your password.
        </p>

        {/* Action */}
        <Button 
          onClick={() => window.location.href = '/login'}
          className="w-full"
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Logo */}
      <div className="w-16 h-16 border-base flex items-center justify-center mx-auto mb-8">
        <span className="heading text-2xl font-bold">WW</span>
      </div>

      {/* Heading */}
      <h1 className="heading text-3xl font-bold text-center mb-4">
        Reset your password
      </h1>

      {/* Description */}
      <p className="body text-base text-gray-600 text-center mb-8">
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border-base bg-error bg-opacity-10">
          <p className="body text-sm text-error">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            state={errors.email ? 'error' : 'default'}
            errorMessage={errors.email}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          Send reset link
        </Button>
      </form>

      {/* Back to Login Link */}
      <div className="mt-6 text-center">
        <a href="/login" className="body text-sm text-gray-600 hover:underline">
          Back to login
        </a>
      </div>
    </div>
  );
};
