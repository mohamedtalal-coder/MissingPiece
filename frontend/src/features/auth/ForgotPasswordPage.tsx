import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Icon } from '../../shared/components/ui/Icon';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { t } = useLanguage() as any;
  const navigate = useNavigate();

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = registeredUsers.some((u: { email?: string }) => u.email === email);

    if (!userExists) {
      setError(t.auth?.emailNotRegistered || 'This email address is not registered in our system.');
      return;
    }

    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError(t.auth?.passwordLength6 || 'Password must be at least 6 characters long.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

    const updatedUsers = registeredUsers.map((u: { email?: string; password?: string }) => {
      if (u.email === email) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.email === email) {
      currentUser.password = newPassword;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    setSuccess(t.auth?.passwordUpdatedSuccess || 'Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
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
              : (t.auth?.resetSubtitle2 || 'Enter your new secure password')}
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
              <Button type="submit" fullWidth>
                {t.auth?.verifyEmail || 'Verify Email'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-space-lg" noValidate>
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
              <Button type="submit" fullWidth>
                {t.auth?.updatePassword || 'Update Password'}
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
