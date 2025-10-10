"use client";

import React, { useState } from 'react';
import { AuthLayout, LoginForm } from '@/components/auth';
import { useUserStore } from '@/stores';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useUserStore();

  const handleLogin = async (data: { email: string; password: string; remember: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await login({
        email: data.email,
        password: data.password,
        remember: data.remember,
      });

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
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
