"use client";

import React, { useState } from 'react';
import { AuthLayout, PasswordResetForm } from '@/components/auth';

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate error for demo
      if (email === 'error@example.com') {
        throw new Error('Email not found');
      }

      // Success
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <PasswordResetForm 
        onSubmit={handlePasswordReset}
        loading={loading}
        error={error || undefined}
        success={success}
      />
    </AuthLayout>
  );
}
