"use client";

import React, { useState } from 'react';
import { Label, Input, Button, Checkbox } from '@/components/ui';
import Link from 'next/link';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string; remember: boolean }) => void;
  loading?: boolean;
  error?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading = false, error }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, remember: e.target.checked }));
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Logo */}
      <div className="w-16 h-16 border-base flex items-center justify-center mx-auto mb-8">
        <span className="heading text-2xl font-bold">WW</span>
      </div>

      {/* Heading */}
      <h1 className="heading text-3xl font-bold text-center mb-8">
        Welcome back
      </h1>

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
            value={formData.email}
            onChange={handleInputChange('email')}
            state={errors.email ? 'error' : 'default'}
            errorMessage={errors.email}
          />
        </div>

        <div>
          <Label htmlFor="password" required>Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            state={errors.password ? 'error' : 'default'}
            errorMessage={errors.password}
          />
        </div>

        <div className="flex items-center">
          <Checkbox
            id="remember"
            checked={formData.remember}
            onChange={handleCheckboxChange}
            label="Remember me"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      {/* Forgot Password Link */}
      <div className="mt-6 text-center">
        <Link href="/reset-password" className="body text-sm text-gray-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      {/* OAuth Buttons */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <OAuthButton provider="google" />
          <OAuthButton provider="apple" />
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="mt-8 text-center">
        <p className="body text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

const OAuthButton: React.FC<{ provider: 'google' | 'apple' }> = ({ provider }) => {
  const getProviderInfo = () => {
    switch (provider) {
      case 'google':
        return {
          label: 'Continue with Google',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          ),
        };
      case 'apple':
        return {
          label: 'Continue with Apple',
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          ),
        };
    }
  };

  const { label, icon } = getProviderInfo();

  return (
    <button
      type="button"
      className="w-full h-12 px-4 bg-white text-black border-base hover:border-strong flex items-center justify-center gap-3"
    >
      {icon}
      <span className="body text-base font-medium">{label}</span>
    </button>
  );
};
