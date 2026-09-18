import React, { useState } from 'react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { t } = useLanguage() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);
      const data = await authApi.login({ email, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-md bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-primary">{t.auth?.email || "Email Address"}</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-primary" />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-surface border border-border rounded-md ps-10 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-border"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-primary">{t.auth?.password || "Password"}</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-primary" />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-surface border border-border rounded-md ps-10 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-border"
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 rounded-md bg-primary from-primary to-primary text-white text-xs font-medium hover:from-primary hover:to-primary transition-all flex justify-center items-center gap-2 shadow-lg shadow-subtle"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>{t.auth?.signIn || "Sign In"}</span>
        {!loading && <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />}
      </button>

      <p className="text-center text-xs text-primary pt-2">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary hover:text-primary font-medium underline">
          Register here
        </Link>
      </p>
    </form>
  );
};