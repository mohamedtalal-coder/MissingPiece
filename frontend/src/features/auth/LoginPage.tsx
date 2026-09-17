import { LoginForm } from '../auth/LoginForm';
import { Sparkles } from 'lucide-react';

export function LoginPage() {
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
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;