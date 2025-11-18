'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Logo } from '@/components/layout/Logo';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { OTPInput } from '@/components/auth/OTPInput';
import { sendOTP, verifyOTP, isAuthenticated } from '@/services/authService';

type Step = 'mobile' | 'otp';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [router, searchParams]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await sendOTP(mobile);
      
      if (result.success) {
        setStep('otp');
        setResendCountdown(30);
      } else {
        setError(result.error || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp;
    setError('');
    setLoading(true);

    try {
      const result = await verifyOTP({ mobile, otp: otpToVerify });
      
      if (result.success) {
        // Redirect to intended page or dashboard
        const redirect = searchParams.get('redirect') || '/';
        router.push(redirect);
      } else {
        setError(result.error || 'Invalid OTP');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCountdown > 0) return;
    
    setError('');
    setResendCountdown(30);
    
    try {
      await sendOTP(mobile);
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleBackToMobile = () => {
    setStep('mobile');
    setOtp('');
    setError('');
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Logo />
        </div>

      
        {/* Mobile Step */}
        {step === 'mobile' && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              Admin Dashboard
              </h1>
              <p className="text-sm text-neutral-500">
                Enter your mobile number to continue
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Mobile Number"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && mobile.length === 10 && !loading) {
                    handleSendOTP();
                  }
                }}
                error={error}
                maxLength={10}
                disabled={loading}
              />

              <Button
                fullWidth
                onClick={handleSendOTP}
                loading={loading}
                disabled={mobile.length !== 10}
              >
                Send OTP
              </Button>
            </div>

          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <button
              onClick={handleBackToMobile}
              className="flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              disabled={loading}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Back
            </button>

            <div className="text-center">
              <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                Enter OTP
              </h1>
              <p className="text-sm text-neutral-500">
                We've sent a 4-digit code to{' '}
                <span className="font-medium text-neutral-700">{mobile}</span>
              </p>
            </div>

            <div className="space-y-4">
              <OTPInput
                onComplete={(value) => handleVerifyOTP(value)}
              />

              {error && (
                <p className="text-sm text-danger-600 text-center">{error}</p>
              )}

              <div className="text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-neutral-500">
                    Resend OTP in {resendCountdown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <div className="text-center text-xs text-neutral-500">
              <p>Demo OTP: 1234</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-neutral-500 mt-4">
        © 2025 SyncKaro. Copy Trading Platform.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <div className="text-center">
            <p className="text-neutral-500">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

