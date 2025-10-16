"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CleanButton } from '@/components/layout';
import { 
  Mail, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
  Clock,
  Shield,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'expired'>('pending');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [email] = useState('user@example.com');

  const handleResend = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset countdown
      setCountdown(300);
      console.log('Verification email resent');
    } catch (err) {
      console.error('Failed to resend verification email:', err);
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Demo: Change status after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus('success');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border border-white rounded-full"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute bottom-20 left-40 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute bottom-40 right-40 w-28 h-28 border border-white rounded-full"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold text-xl">WW</span>
              </div>
              <h1 className="text-3xl font-bold">WriteWave</h1>
            </div>

            <h2 className="text-4xl font-bold mb-4">
              Almost There!
            </h2>
            <p className="text-xl text-green-100 mb-8">
              We've sent a verification link to your email. Click it to activate your account and start learning.
            </p>

            <div className="space-y-4">
              {[
                { icon: <Mail className="w-5 h-5" />, text: "Check Your Email" },
                { icon: <Shield className="w-5 h-5" />, text: "Secure Verification" },
                { icon: <CheckCircle className="w-5 h-5" />, text: "Instant Activation" },
                { icon: <Sparkles className="w-5 h-5" />, text: "Start Learning" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <span className="text-lg">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium">Email sent to {email}</p>
                  <p className="text-xs text-green-200">Check your inbox and spam folder</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Verification Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">We've sent a verification link to your email address</p>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {status === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center"
              >
                <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Check Your Email</h3>
                <p className="text-sm text-blue-700 mb-4">
                  We've sent a verification link to <strong>{email}</strong>
                </p>
                <p className="text-xs text-blue-600">
                  Click the link in the email to verify your account and start learning Japanese.
                </p>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg text-center"
              >
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Email Verified!</h3>
                <p className="text-sm text-green-700 mb-4">
                  Your email has been successfully verified. You can now access all features.
                </p>
                <CleanButton
                  variant="primary"
                  onClick={() => router.push('/learn')}
                  className="mt-4"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </CleanButton>
              </motion.div>
            )}

            {status === 'expired' && (
              <motion.div
                key="expired"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg text-center"
              >
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Link Expired</h3>
                <p className="text-sm text-red-700 mb-4">
                  The verification link has expired. Please request a new one.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resend Section */}
          {status === 'pending' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
                <p className="text-xs text-gray-500">
                  Check your spam folder or request a new verification email
                </p>
              </div>

              <div className="space-y-4">
                <CleanButton
                  variant="outline"
                  fullWidth
                  onClick={handleResend}
                  disabled={loading || countdown > 0}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {formatTime(countdown)}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend verification email
                    </>
                  )}
                </CleanButton>

                <div className="text-center">
                  <button
                    onClick={() => router.push('/login')}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium hover:underline flex items-center justify-center mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to sign in
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Need help?</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you're using the correct email address</li>
              <li>• The verification link expires in 24 hours</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
