"use client";

import React, { useState } from 'react';
import { AuthLayout, EmailVerification } from '@/components/auth';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'expired'>('pending');

  const handleResend = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      console.log('Verification email resent');
    } catch (err) {
      console.error('Failed to resend verification email:', err);
    } finally {
      setLoading(false);
    }
  };

  // Demo: Change status after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthLayout>
      <EmailVerification 
        status={status}
        email="user@example.com"
        onResend={handleResend}
        loading={loading}
      />
    </AuthLayout>
  );
}
