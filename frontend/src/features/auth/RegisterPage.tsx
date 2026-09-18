import { RegisterForm } from './RegisterForm';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Icon } from '../../shared/components/ui/Icon';
import { Link } from 'react-router-dom';

export function RegisterPage() {
  const { t } = useLanguage() as any;

  return (
    <main className="relative min-h-[80vh] flex items-center justify-center px-margin-mobile lg:px-margin py-space-2xl overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-surface-container)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_color-mix(in_srgb,var(--color-primary)_12%,transparent)_0%,_transparent_45%)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md animate-fade-in">
        <div className="text-center mb-space-xl">
          <Link to="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="w-14 h-14 bg-surface-container border border-primary-container/40 rounded-lg flex items-center justify-center font-headline-sm text-primary-container text-lg font-bold transition-transform group-hover:scale-[1.03]">
              MP
            </div>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
              Missing Piece
            </span>
          </Link>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight mt-space-md">
            {t.auth?.createAccount || 'Create Account'}
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
            {t.auth?.registerSubtitle || 'Join the atelier to track commissions and claims'}
          </p>
        </div>

        <div className="bg-surface-container-low/90 border border-outline-variant/25 rounded-xl p-space-xl shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-space-lg text-on-surface-variant">
            <Icon name="person_outline" size={16} className="text-primary" />
            <span className="font-label-caps text-label-caps uppercase tracking-wider">Collector membership</span>
          </div>
          <RegisterForm />
        </div>
      </div>
    </main>
  );
}

export default RegisterPage;
