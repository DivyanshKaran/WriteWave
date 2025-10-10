"use client";

import React, { useState } from 'react';
import { AuthLayout, LoginForm } from '@/components/auth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: { email: string; password: string; remember: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate error for demo
      if (data.email === 'error@example.com') {
        throw new Error('Invalid email or password');
      }

      // Success - redirect to dashboard
      console.log('Login successful:', data);
      // router.push('/dashboard');
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
      <LoginForm 
        onSubmit={handleLogin}
        loading={loading}
        error={error || undefined}
      />
    </AuthLayout>
  );
}
