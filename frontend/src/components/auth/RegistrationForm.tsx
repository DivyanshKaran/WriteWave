"use client";

import React, { useState } from 'react';
import { Label, Input, Button, Checkbox } from '@/components/forms';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  loading?: boolean;
  error?: string;
}

interface RegistrationData {
  name: string;
  email: string;
  password: string;
  goals: string[];
  avatar?: File;
}

interface StepProps {
  data: Partial<RegistrationData>;
  onChange: (field: string, value: string | string[] | File) => void;
  errors: Record<string, string>;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

const Step1: React.FC<StepProps> = ({ data, onChange, errors, onNext, loading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="name" required>Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
          state={errors.name ? 'error' : 'default'}
          errorMessage={errors.name}
        />
      </div>

      <div>
        <Label htmlFor="email" required>Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={data.email || ''}
          onChange={(e) => onChange('email', e.target.value)}
          state={errors.email ? 'error' : 'default'}
          errorMessage={errors.email}
        />
      </div>

      <div>
        <Label htmlFor="password" required>Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={data.password || ''}
          onChange={(e) => onChange('password', e.target.value)}
          state={errors.password ? 'error' : 'default'}
          errorMessage={errors.password}
        />
      </div>

      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Continue
      </Button>
    </form>
  );
};

const Step2: React.FC<StepProps> = ({ data, onChange, onNext, onBack, loading }) => {
  const learningGoals = [
    { id: 'hiragana', label: 'Learn Hiragana' },
    { id: 'katakana', label: 'Learn Katakana' },
    { id: 'kanji', label: 'Master Kanji' },
    { id: 'reading', label: 'Improve Reading' },
    { id: 'writing', label: 'Practice Writing' },
    { id: 'vocabulary', label: 'Build Vocabulary' },
  ];

  const handleGoalChange = (goalId: string, checked: boolean) => {
    const currentGoals = data.goals || [];
    const newGoals = checked 
      ? [...currentGoals, goalId]
      : currentGoals.filter(id => id !== goalId);
    onChange('goals', newGoals);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="heading text-lg font-semibold mb-4">What are your learning goals?</h3>
        <p className="body text-sm text-gray-600 mb-6">Select all that apply</p>
        
        <div className="space-y-3">
          {learningGoals.map((goal) => (
            <Checkbox
              key={goal.id}
              id={goal.id}
              checked={(data.goals || []).includes(goal.id)}
              onChange={(e) => handleGoalChange(goal.id, e.target.checked)}
              label={goal.label}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="tertiary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  );
};

const Step3: React.FC<StepProps> = ({ data, onChange, onNext, onBack, loading }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange('avatar', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="heading text-lg font-semibold mb-4">Profile Setup</h3>
        <p className="body text-sm text-gray-600 mb-6">Optional: Add a profile picture</p>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 border-base bg-gray-50 flex items-center justify-center">
              {data.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={URL.createObjectURL(data.avatar)} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">👤</span>
              )}
            </div>
            <div>
              <Label htmlFor="avatar">Profile Picture</Label>
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="button" variant="tertiary" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button type="submit" variant="primary" loading={loading} className="flex-1">
          Create Account
        </Button>
      </div>
    </form>
  );
};

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, loading = false, error }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<RegistrationData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const handleFieldChange = (field: string, value: string | string[] | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        break;
      case 2:
        if (!formData.goals || formData.goals.length === 0) {
          newErrors.goals = 'Please select at least one learning goal';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
      } else {
        onSubmit(formData as RegistrationData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStep = () => {
    const stepProps = {
      data: formData,
      onChange: handleFieldChange,
      errors,
      onNext: handleNext,
      onBack: handleBack,
      loading,
    };

    switch (currentStep) {
      case 1:
        return <Step1 {...stepProps} />;
      case 2:
        return <Step2 {...stepProps} />;
      case 3:
        return <Step3 {...stepProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Logo */}
      <div className="w-16 h-16 border-base flex items-center justify-center mx-auto mb-8">
        <span className="heading text-2xl font-bold">WW</span>
      </div>

      {/* Heading */}
      <h1 className="heading text-3xl font-bold text-center mb-8">
        Create your account
      </h1>

      {/* Step Counter */}
      <div className="flex justify-between items-center mb-8">
        <span className="body text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index + 1 <= currentStep ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border-base bg-error bg-opacity-10">
          <p className="body text-sm text-error">{error}</p>
        </div>
      )}

      {/* Step Content */}
      {renderStep()}
    </div>
  );
};
