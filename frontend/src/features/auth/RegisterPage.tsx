import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Lock, Mail, User, MapPin, AlertCircle } from 'lucide-react';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email & Password Validation
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // التحقق لو الإيميل موجود مسبقاً (حسب متطلبات الـ PDF)
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const emailExists = registeredUsers.some((u: any) => u.email === email);

    if (emailExists) {
      setError('This email is already registered. Please sign in instead.');
      return;
    }

    // إنشاء مستخدم جديد مع صورة أفتار افتراضية
    const newUser = {
      name,
      email,
      password,
      location: location || 'Cairo, Egypt',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7e22ce&color=fff`,
    };

    // حفظه في قائمة المستخدمين وحفظه كـ المستخدم الحالي بشكل دائم
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    alert('Account created successfully!');
    navigate('/account'); // التوجه للبروفايل مباشرة
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-serif py-12">
      <div className="max-w-md w-full bg-[#130e21] border border-[#7e22ce]/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(126,34,206,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-xs font-sans text-[#cbd5e1]">Register a new account to start shopping</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 font-sans text-xs">
          <div className="space-y-1.5">
            <label className="text-[#e9d5ff]">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#c084fc] absolute left-3 top-3" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Salma Yehia" 
                className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

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
            <label className="text-[#e9d5ff]">Password</label>
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

          <div className="space-y-1.5">
            <label className="text-[#e9d5ff]">Location / Region</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#c084fc] absolute left-3 top-3" />
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Cairo, Egypt" 
                className="w-full bg-[#0b0914] border border-[#7e22ce]/40 rounded-xl px-10 py-2.5 text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-[#7e22ce] to-a855f7 text-white font-semibold py-3 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
          >
            Register Account
          </button>
        </form>

        <div className="text-center font-sans text-xs text-[#cbd5e1]">
          Already have an account? <Link to="/login" className="text-[#c084fc] hover:underline">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;