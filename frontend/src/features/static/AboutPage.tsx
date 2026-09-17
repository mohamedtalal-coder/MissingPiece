import React from 'react';
import { ShieldCheck, Sparkles, HeartHandshake } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] px-8 py-16 font-sans space-y-12">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--text-main)] tracking-wide">
          {t.about.title}
        </h1>

        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          {t.about.subtitle}
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
          <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
            <Sparkles className="w-6 h-6" />
          </div>

          <h3 className="text-base font-serif font-bold text-[var(--text-main)]">
            {t.about.craftsmanshipTitle}
          </h3>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t.about.craftsmanshipDescription}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
          <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="text-base font-serif font-bold text-[var(--text-main)]">
            {t.about.mindTitle}
          </h3>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t.about.mindDescription}
          </p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[#7e22ce]/40 p-6 rounded-2xl space-y-4 shadow-xl hover:border-[#a855f7] transition-all">
          <div className="w-12 h-12 bg-[var(--bg-main)] rounded-xl flex items-center justify-center text-[#c084fc] border border-[#7e22ce]/40">
            <HeartHandshake className="w-6 h-6" />
          </div>

          <h3 className="text-base font-serif font-bold text-[var(--text-main)]">
            {t.about.communityTitle}
          </h3>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {t.about.communityDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AboutPage;