import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User } from 'lucide-react';

export function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // إنشاء يوزر وهمي وحفظه مباشرة لتخطي أي مشاكل
    const newUser = { id: Date.now().toString(), name: name || 'Salma', email };
    localStorage.setItem('mp_user', JSON.stringify(newUser));
    localStorage.setItem('mp_token', 'mock_token_123');

    // توجيه المستخدم للمتجر فوراً
    navigate('/');
    window.location.reload(); // تحديث الصفحة لتفعيل حالة الدخول
  };

  return (
    <div className="min-h-screen bg-[#0b0914] text-white flex items-center justify-center px-6 py-12 font-sans">
      <div className="max-w-md w-full bg-[#130e21] border border-[#221738] p-8 rounded-3xl space-y-6 shadow-xl">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#7e22ce]/20 border border-[#7e22ce]/40 rounded-2xl flex items-center justify-center mx-auto text-[#c084fc]">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Create Account</h1>
          <p className="text-xs text-[#a1a1aa]">Join MissingPiece and start exploring luxury puzzles.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] text-[#d8b4fe] font-medium">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-[#a1a1aa]" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Salma Yehia" 
                className="w-full bg-[#0b0914] border border-[#221738] rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#7e22ce]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#d8b4fe] font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#a1a1aa]" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="salma@example.com" 
                className="w-full bg-[#0b0914] border border-[#221738] rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#7e22ce]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-[#d8b4fe] font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#a1a1aa]" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-[#0b0914] border border-[#221738] rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-[#7e22ce]"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-purple-900/30"
          >
            Create Account
          </button>
        </form>

        <div className="text-center text-xs text-[#a1a1aa]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#c084fc] hover:underline font-medium">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}

export default RegisterForm;