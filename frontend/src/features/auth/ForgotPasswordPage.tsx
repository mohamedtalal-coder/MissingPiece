import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Icon } from '../../shared/components/ui/Icon';
import { authApi } from './authApi';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useLanguage() as any;
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await authApi.forgotPassword({ email });

      setSuccess(response.message);
      setStep(2);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError(t.auth?.passwordLength6 || 'Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.resetPassword({
        email,
        otp,
        newPassword,
      });

      setSuccess(response.message + ' Redirecting to login...');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        'Invalid or expired reset code.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center px-margin-mobile lg:px-margin py-space-2xl overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_right,_color-mix(in_srgb,var(--color-primary)_12%,transparent)_0%,_transparent_45%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-space-xl">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-surface-container border border-primary-container/40 rounded-lg flex items-center justify-center text-primary-container transition-transform group-hover:scale-[1.03]">
              <Icon name="lock" size={22} />
            </div>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
              Missing Piece
            </span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-space-md">
            {t.auth?.resetPassword || 'Reset Password'}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
            {step === 1
              ? (t.auth?.resetSubtitle1 || 'Enter your email to recover your account')
              : 'Enter the code sent to your email and your new password'}
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

          {step === 1 ? (
            <form onSubmit={handleCheckEmail} className="space-y-space-lg" noValidate>
              <Input
                type="email"
                label={t.auth?.email || "Email Address"}
                icon="mail"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Sending Code...' : (t.auth?.verifyEmail || 'Verify Email')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-space-lg" noValidate>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                label="Verification Code"
                icon="password"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
              />
              <Input
                type="password"
                label={t.auth?.newPassword || "New Password"}
                icon="lock"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <Button type="submit" fullWidth disabled={loading}>
                {loading ? 'Updating...' : (t.auth?.updatePassword || 'Update Password')}
              </Button>
            </form>
          )}

          <p className="text-center mt-space-lg font-body-sm text-body-sm text-on-surface-variant">
            {t.auth?.rememberPassword || 'Remember your password?'} {' '}
            <Link to="/login" className="text-primary underline underline-offset-2 hover:text-primary-container">
              {t.auth?.signIn || 'Sign In'}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;

