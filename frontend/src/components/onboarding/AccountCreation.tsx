"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccessibleButton, AccessibleInput } from '@/components/accessibility';
import { Eye, EyeOff, Shield, Lock, User, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
  avatar?: string;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    analytics: boolean;
  };
}

export const AccountCreation: React.FC<AccountCreationProps> = ({ onNext, onSkip, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'google' | 'apple' | 'guest' | null>(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    marketing: false,
    analytics: true,
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return Math.min(strength, 100);
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
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 50) {
      newErrors.password = 'Password is too weak';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setSelectedMethod('email');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onNext({ 
        ...formData, 
        method: 'email',
        preferences 
      });
    }
  };

  const handleSocialLogin = async (method: 'google' | 'apple') => {
    setIsLoading(true);
    setSelectedMethod(method);
    
    // Simulate social login
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onNext({ 
      ...formData, 
      method,
      preferences,
      avatar: method === 'google' ? '/avatars/google.png' : '/avatars/apple.png'
    });
  };

  const handleGuestMode = () => {
    setSelectedMethod('guest');
    onNext({ 
      ...formData, 
      method: 'guest',
      preferences: { notifications: false, marketing: false, analytics: false }
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'text-red-600 bg-red-50';
    if (passwordStrength < 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Medium';
    return 'Strong';
  };

  const getPasswordRequirements = () => {
    const password = formData.password;
    return [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'One lowercase letter', met: /[a-z]/.test(password) },
      { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'One number', met: /[0-9]/.test(password) },
      { text: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 ${className}`}>
      <div className="max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Step 4 of 4 • Account Creation</p>
          <div className="w-full bg-gray-200 h-2 mt-2 rounded-full">
            <div className="bg-primary h-2 rounded-full w-full transition-all duration-300"></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="heading text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="body text-lg text-gray-600 max-w-xl mx-auto">
            Save your progress, sync across devices, and join thousands of Japanese learners
          </p>
        </div>

        {/* Account Creation Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Form */}
          <div className="bg-white border-base rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Create with Email</h3>
                <p className="text-sm text-gray-600">Full control over your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Password Strength */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Password strength</span>
                      <span className={`font-medium ${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength < 50 ? 'bg-red-500' : 
                          passwordStrength < 75 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                    
                    {/* Password Requirements */}
                    <div className="space-y-1">
                      {getPasswordRequirements().map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          {req.met ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-gray-300" />
                          )}
                          <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Privacy Preferences */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-medium text-gray-700">Privacy Preferences</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'notifications', label: 'Learning reminders and progress updates', default: true },
                      { key: 'marketing', label: 'Product updates and tips (optional)', default: false },
                      { key: 'analytics', label: 'Help improve WriteWave with usage data', default: true },
                    ].map((pref) => (
                      <label key={pref.key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[pref.key as keyof typeof preferences]}
                          onChange={(e) => setPreferences(prev => ({
                            ...prev,
                            [pref.key]: e.target.checked
                          }))}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-xs text-gray-600">{pref.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <AccessibleButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && selectedMethod === 'email' ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </AccessibleButton>
              </form>
            </div>
          </div>

          {/* Social Login Options */}
          <div className="space-y-6">
            {/* Social Login */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Quick Sign Up</h3>
                <p className="text-sm text-gray-600">Use your existing account</p>
              </div>

              <div className="space-y-3">
                <AccessibleButton
                  onClick={() => handleSocialLogin('google')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && selectedMethod === 'google' ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">G</span>
                      </div>
                      <span>Continue with Google</span>
                    </div>
                  )}
                </AccessibleButton>

                <AccessibleButton
                  onClick={() => handleSocialLogin('apple')}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading && selectedMethod === 'apple' ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
                        <span className="text-white text-xs">🍎</span>
                      </div>
                      <span>Continue with Apple</span>
                    </div>
                  )}
                </AccessibleButton>
              </div>
            </div>

            {/* Guest Mode */}
            <div className="bg-white border-base rounded-lg p-6 shadow-sm">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Try as Guest</h3>
                  <p className="text-sm text-gray-600">Explore without creating an account</p>
                </div>
                
                <AccessibleButton
                  onClick={handleGuestMode}
                  variant="tertiary"
                  className="w-full"
                  disabled={isLoading}
                >
                  Start Learning Now
                </AccessibleButton>
                
                <p className="text-xs text-gray-500">
                  You can create an account later to save your progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="text-center bg-white border-base rounded-lg p-4 shadow-sm">
          <p className="text-xs text-gray-600">
            🔒 <strong>Your privacy matters:</strong> We'll never share your email with third parties. 
            You can change your preferences anytime in settings.
          </p>
        </div>
      </div>
    </div>
  );
};
