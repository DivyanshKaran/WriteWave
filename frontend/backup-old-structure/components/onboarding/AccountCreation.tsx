"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AccessibleButton, AccessibleInput } from '@/components/accessibility';

interface AccountCreationProps {
  onNext: (accountData: AccountData) => void;
  onSkip: () => void;
  className?: string;
}

interface AccountData {
  name: string;
  email: string;
  password: string;
  method: 'email' | 'google' | 'apple' | 'guest';
}

export const AccountCreation: React.FC<AccountCreationProps> = ({ onNext, onSkip, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext({ ...formData, method: 'email' });
    }
  };

  const handleSocialLogin = (method: 'google' | 'apple') => {
    onNext({ ...formData, method });
  };

  const handleGuestMode = () => {
    onNext({ ...formData, method: 'guest' });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#DC143C';
    if (passwordStrength < 75) return '#FF9500';
    return '#00A86B';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    return 'Strong';
  };

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-md w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 4 of 4</p>
          <div className="w-full bg-gray-200 h-2 mt-2">
            <div className="bg-black h-2 w-full"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-2xl font-bold">Create your account</h2>
          <p className="body text-base text-gray-600">
            Save your progress and sync across devices
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <AccessibleInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
          />

          <AccessibleInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />

          <div className="space-y-2">
            <AccessibleInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={errors.password}
              required
            />
            
            {formData.password && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Password strength</span>
                  <span 
                    className="font-medium"
                    style={{ color: getPasswordStrengthColor() }}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-1">
                  <div 
                    className="h-1 transition-all duration-300"
                    style={{ 
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor()
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Privacy Note */}
          <div className="text-xs text-gray-500 text-center">
            We&apos;ll never share your email with third parties
          </div>

          {/* Submit Button */}
          <AccessibleButton
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
          >
            Create Account
          </AccessibleButton>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="space-y-3">
          <AccessibleButton
            onClick={() => handleSocialLogin('google')}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg">🔍</span>
              Continue with Google
            </div>
          </AccessibleButton>

          <AccessibleButton
            onClick={() => handleSocialLogin('apple')}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-lg">🍎</span>
              Continue with Apple
            </div>
          </AccessibleButton>
        </div>

        {/* Guest Mode */}
        <div className="text-center space-y-4">
          <AccessibleButton
            onClick={handleGuestMode}
            variant="tertiary"
            className="w-full"
          >
            Skip for now - try as guest
          </AccessibleButton>
          
          <p className="text-xs text-gray-500">
            You can create an account later to save your progress
          </p>
        </div>
      </div>
    </div>
  );
};
