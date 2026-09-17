import React, { useState } from 'react';
import { Mail, Send, MapPin, Phone } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-serif py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10 bg-[var(--bg-card)] border border-[var(--border-main)] p-10 md:p-14 rounded-3xl shadow-xl">
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-[var(--text-main)]">
            {t.contact.title}
          </h1>

          <p className="text-sm font-sans text-[var(--text-muted)]">
            {t.contact.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans">
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif text-[var(--text-main)]">
              {t.contact.getInTouch}
            </h3>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {t.contact.description}
            </p>

            <div className="space-y-4 text-xs text-[var(--text-main)]">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#c084fc]" />
                <span>{t.contact.supportEmail}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#c084fc]" />
                <span>{t.contact.phone}</span>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[#c084fc]" />
                <span>{t.contact.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-main)] p-6 rounded-2xl border border-[var(--border-main)]">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold">
                  ✓
                </div>

                <h4 className="text-sm font-bold text-[var(--text-main)]">
                  {t.contact.messageSent}
                </h4>

                <p className="text-xs text-[var(--text-muted)]">
                  {t.contact.thankYou}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.name}
                  </label>

                  <input
                    type="text"
                    required
                    placeholder={t.contact.namePlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#7e22ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.email}
                  </label>

                  <input
                    type="email"
                    required
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#7e22ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.message}
                  </label>

                  <textarea
                    required
                    rows={4}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#7e22ce] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#7e22ce] to-[#a855f7] text-white rounded-xl text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.contact.sendMessage}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;