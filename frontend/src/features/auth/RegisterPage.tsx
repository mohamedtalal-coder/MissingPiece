import { RegisterForm } from '../auth/RegisterForm';
import { useLanguage } from '../../shared/context/LanguageContext';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  const { t } = useLanguage() as any;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-serif py-12">
      <div className="max-w-md w-full bg-background border border-border p-8 rounded-md shadow-[0_0_40px_rgba(126,34,206,0.3)] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#18112c] border border-[#a855f7] rounded-md mx-auto flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <UserPlus className="w-6 h-6 text-[#c084fc]" />
          </div>
          <h1 className="text-2xl font-bold text-white">{t.auth?.createAccount || "Create Account"}</h1>
          <p className="text-xs font-sans text-[#cbd5e1]">{t.auth?.registerSubtitle || "Register a new account to start shopping"}</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

export default RegisterPage;