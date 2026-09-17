import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userExists = registeredUsers.some((u: any) => u.email === email);

    if (!userExists) {
      setError('This email address is not registered in our system.');
      return;
    }

    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const updatedUsers = registeredUsers.map((u: any) => {
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

    setSuccess('Password updated successfully! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0914] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-[#130e21] border border-[#7e22ce]/60 p-8 rounded-3xl shadow-[0_0_50px_rgba(126,34,206,0.4)] space-y-6 text-white relative">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#18112c] border border-[#a855f7] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <KeyRound className="w-6 h-6 text-[#c084fc]" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white">Reset Password</h1>
          <p className="text-xs text-[#cbd5e1]">
            {step === 1 ? 'Enter your email to recover your account' : 'Enter your new secure password'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleCheckEmail} className="space-y-4 text-xs">
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

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              Verify Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[#e9d5ff]">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#c084fc] absolute left-3 top-3" />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
            >
              Update Password
            </button>
          </form>
        )}

        <div className="text-center text-xs text-[#cbd5e1]">
          Remember your password? <Link to="/login" className="text-[#c084fc] hover:underline">Sign In</Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPasswordPage;