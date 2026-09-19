import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Icon } from '../../shared/components/ui/Icon';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailPage() {
  const { t } = useLanguage() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, isAuthenticated } = useAuth();

  const state = location.state as { email?: string; from?: string } | null;
  const email = state?.email || user?.email || '';
  const from = state?.from && state.from.startsWith('/') ? state.from : '/';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  // Already verified? Nothing to do here.
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (!email) {
      setError('Missing email address. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp });
      updateUser({ isEmailVerified: true });
      setSuccess('Email verified! Redirecting...');
      setTimeout(() => navigate(from, { replace: true }), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || resending || !email) return;
    setError(null);
    setSuccess(null);
    setResending(true);
    try {
      const response = await authApi.resendVerification(email);
      setSuccess(response.message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not resend the code. Try again shortly.');
    } finally {
      setResending(false);
    }
  }, [cooldown, resending, email]);

  if (!isAuthenticated) {
    return (
      <main className="max-w-md mx-auto px-margin-mobile py-space-2xl text-center">
        <p className="text-on-surface-variant mb-space-md">Please log in to verify your email.</p>
        <Button as="link" to="/login">
          {t.auth?.signIn || 'Sign In'}
        </Button>
      </main>
    );
  }

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center px-margin-mobile lg:px-margin py-space-2xl overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_color-mix(in_srgb,var(--color-primary)_12%,transparent)_0%,_transparent_45%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-space-xl">
          <div className="w-14 h-14 mx-auto bg-surface-container border border-primary-container/40 rounded-lg flex items-center justify-center text-primary-container">
            <Icon name="mail" size={22} />
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-space-md">
            Verify Your Email
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
            {email
              ? <>We sent a 6-digit code to <span className="text-on-surface font-medium">{email}</span></>
              : 'We sent a 6-digit code to your email address.'}
          </p>
        </div>

        <div className="bg-surface-container-low/90 border border-outline-variant/25 rounded-xl p-space-xl shadow-lg backdrop-blur-sm">
          {error && (
            <div
              className="mb-space-md p-3.5 rounded-md bg-error-container/30 border border-error/30 text-error text-center font-body-sm text-body-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-space-md p-3.5 rounded-md bg-primary-container/15 border border-primary-container/30 text-primary text-center font-body-sm text-body-sm"
              role="status"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-space-lg" noValidate>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              label="Verification Code"
              icon="lock"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              autoFocus
            />
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <p className="text-center mt-space-lg font-body-sm text-body-sm text-on-surface-variant">
            Didn't get the code?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-primary underline underline-offset-2 hover:text-primary-container disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </p>
        </div>

        <p className="text-center mt-space-lg">
          <Link to="/" className="text-xs text-on-surface-variant hover:text-on-surface underline underline-offset-2">
            Skip for now — I'll browse first
          </Link>
        </p>
      </div>
    </main>
  );
}

export default VerifyEmailPage;
