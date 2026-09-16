import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from './authApi';
import { useAuth } from './AuthContext';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export const LoginForm: React.FC = () => {
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
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs text-center">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-purple-200">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-purple-200">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-3 w-4 h-4 text-purple-400" />
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-purple-950/60 border border-purple-800/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
            required
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium hover:from-purple-500 hover:to-indigo-500 transition-all flex justify-center items-center gap-2 shadow-lg shadow-purple-900/40"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        <span>Sign In</span>
        {!loading && <ArrowRight className="w-3.5 h-3.5" />}
      </button>

      <p className="text-center text-xs text-purple-300/70 pt-2">
        Don't have an account?{' '}
        <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium underline">
          Register here
        </Link>
      </p>
    </form>
  );
};