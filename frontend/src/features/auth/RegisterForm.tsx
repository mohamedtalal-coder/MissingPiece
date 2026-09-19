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

export function RegisterForm() {
  const { t, language } = useLanguage() as any;

  const [name, setName] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const cleanName = sanitize(name, 80);
    const cleanEmail = sanitize(email, 254).toLowerCase();
    const cleanPassword = password.slice(0, 128);

    if (!cleanName || !cleanEmail || !cleanPassword) {
      setError(t.auth?.requiredFields || 'Please fill in all required fields.');
      return;
    }
    if (cleanName.length < 2) {
      setError(t.auth?.nameLength || 'Name must be at least 2 characters.');
      return;
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      setError(t.auth?.invalidEmail || 'Please enter a valid email address.');
      return;
    }
    if (cleanPassword.length < 8) {
      setError(t.auth?.passwordLength || 'Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.register({ name: cleanName, email: cleanEmail, password: cleanPassword });
      login(data.token, data.user);
      if (data.user.isEmailVerified) {
        navigate(from, { replace: true });
      } else {
        navigate('/verify-email', { replace: true, state: { email: data.user.email, from } });
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || t.auth?.registrationFailed || 'Registration failed. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-space-lg animate-fade-in" noValidate>
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
          type="text"
          label={t.auth?.name || 'Full Name'}
          icon="person_outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Salma Yehia"
          required
          maxLength={80}
          autoComplete="name"
        />

        <Input
          type="email"
          label={t.auth?.email || 'Email Address'}
          icon="mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="salma@example.com"
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
            autoComplete="new-password"
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
        <p className="font-body-sm text-body-sm text-outline -mt-2">
          {t.auth?.passwordHint || 'Use at least 8 characters.'}
        </p>
      </div>

      <Button
        type="submit"
        fullWidth
        isLoading={loading}
        icon={language === 'ar' ? 'chevron_left' : 'chevron_right'}
        iconPosition="right"
      >
        {t.auth?.createAccount || 'Create Account'}
      </Button>

      <div className="text-center font-body-sm text-body-sm text-on-surface-variant pt-2">
        {t.auth?.alreadyHaveAccount || 'Already have an account?'}{' '}
        <Link
          to="/login"
          state={location.state}
          className="text-primary hover:text-primary-container font-medium underline transition-colors"
        >
          {t.auth?.signIn || 'Sign In'}
        </Link>
      </div>
    </form>
  );
}

export default RegisterForm;
