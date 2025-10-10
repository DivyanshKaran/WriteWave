"use client";

import React, { useState } from 'react';
import { AuthLayout, RegistrationForm } from '@/components/auth';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: { name: string; email: string; password: string; goals: string[]; avatar?: File }) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate error for demo
      if (data.email === 'error@example.com') {
        throw new Error('Email already exists');
      }

      // Success - redirect to email verification
      console.log('Registration successful:', data);
      // router.push('/auth/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const valueProp = {
    statistic: "10,000+ learners",
    tagline: "Master Japanese characters"
  };

  return (
    <AuthLayout valueProp={valueProp}>
      <RegistrationForm 
        onSubmit={handleRegister}
        loading={loading}
        error={error || undefined}
      />
    </AuthLayout>
  );
}
