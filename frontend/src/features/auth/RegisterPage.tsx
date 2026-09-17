import { RegisterForm } from '../auth/RegisterForm';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-serif py-12">
      <div className="max-w-md w-full bg-[#130e21] border border-[#7e22ce]/50 p-8 rounded-3xl shadow-[0_0_40px_rgba(126,34,206,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#18112c] border border-[#a855f7] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <UserPlus className="w-6 h-6 text-[#c084fc]" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-xs font-sans text-[#cbd5e1]">Register a new account to start shopping</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;