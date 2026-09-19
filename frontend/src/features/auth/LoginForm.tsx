import React, { useState } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Icon } from '../../shared/components/ui/Icon';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitize(value: string, max: number): string {
  return value.replace(/[<>]/g, '').trim().slice(0, max);
}

export const LoginForm: React.FC = () => {
  const { t, language } = useLanguage() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    typeof location.state?.from?.pathname === 'string' && location.state.from.pathname.startsWith('/')
      ? location.state.from.pathname
      : '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanEmail = sanitize(email, 254).toLowerCase();
    const cleanPassword = password.slice(0, 128);

    if (!cleanEmail || !cleanPassword) {
      setError(t.auth?.requiredFields || 'Please fill in all required fields.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError(t.auth?.invalidEmail || 'Please enter a valid email address.');
      return;
    }
    if (cleanPassword.length < 8) {
      setError(t.auth?.passwordLength || 'Password must be at least 8 characters.');
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.login({ email: cleanEmail, password: cleanPassword });
      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || t.auth?.invalidCredentials || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-space-lg animate-fade-in" noValidate>
      {error && (
        <div
          className="p-3.5 rounded-md bg-error-container/30 border border-error/30 text-error text-center font-body-sm text-body-sm animate-shake"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-space-md">
        <Input
          type="email"
          label={t.auth?.email || 'Email Address'}
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
          required
          maxLength={254}
          autoComplete="email"
          autoCapitalize="none"
        />

        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            label={t.auth?.password || 'Password'}
            icon="lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            maxLength={128}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute right-space-md top-[34px] text-on-surface-variant hover:text-on-surface focus:outline-none ${
              language === 'ar' ? 'left-space-md end-auto' : ''
            }`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <Icon name={showPassword ? 'eye_off' : 'eye'} size={18} />
          </button>
        </div>
        <div className="flex justify-end mt-1">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
          >
            {t.auth?.forgotPassword || 'Forgot Password?'}
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={loading}
        icon={language === 'ar' ? 'chevron_left' : 'chevron_right'}
        iconPosition="right"
      >
        {t.auth?.signIn || 'Sign In'}
      </Button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant pt-2">
        {t.auth?.noAccount || "Don't have an account?"}{' '}
        <Link
          to="/register"
          state={location.state}
          className="text-primary hover:text-primary-container font-medium underline transition-colors"
        >
          {t.auth?.registerHere || 'Register here'}
        </Link>
      </p>
    </form>
  );
};
