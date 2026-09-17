import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password);

    if (!foundUser) {
      setError('Invalid email or password. Please check your credentials.');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(foundUser));

    alert(`Welcome back, ${foundUser.name}!`);
    navigate('/account');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-serif">
      <div className="max-w-md w-full bg-[#130e21] border border-[#7e22ce]/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(126,34,206,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#18112c] border border-[#a855f7] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <Sparkles className="w-6 h-6 text-[#c084fc]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-xs font-sans text-[#cbd5e1]">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="text-[#e9d5ff]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#c084fc] absolute left-3 top-3" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="salma@example.com" 
                className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[#e9d5ff]">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-[#c084fc] hover:underline">
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#c084fc] absolute left-3 top-3" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            Sign In
          </button>
        </form>

        <div className="text-center font-sans text-xs text-[#cbd5e1]">
          Don't have an account? <Link to="/register" className="text-[#c084fc] hover:underline">Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;