"use client";

import React, { useState } from 'react';
import { AuthLayout, RegistrationForm } from '@/components/auth';
import { useUserStore } from '@/stores';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useUserStore();

  const handleRegister = async (data: { name: string; email: string; password: string; goals: string[]; avatar?: File }) => {
    setLoading(true);
    setError(null);

    try {
      const result = await register({
        name: data.name,
        email: data.email,
        password: data.password,
        goals: data.goals,
      });

      if (!result.success) {
        throw new Error(result.error || 'Registration failed');
      }

      // Success - redirect to email verification
      console.log('Registration successful:', data);
      // router.push('/verify-email');
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
