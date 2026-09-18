import React, { useState } from 'react';
import { Mail, Send, MapPin, Phone, Loader2 } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { staticApi } from './staticApi';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setError(t.contact?.fillAllFields || 'Please fill in all fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await staticApi.sendMessage({ name, email, subject, message });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(t.contact?.sendError || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-serif py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-10 bg-[var(--bg-card)] border border-[var(--border-main)] p-10 md:p-14 rounded-md shadow-xl">
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

          <div className="bg-[var(--bg-main)] p-6 rounded-md border border-[var(--border-main)]">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-md flex items-center justify-center mx-auto text-lg font-bold">
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
                {error && (
                  <div className="p-3 rounded-md bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.name}
                  </label>

                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-md px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.email}
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-md px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    Subject
                  </label>

                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="What is this regarding?"
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-md px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[var(--text-muted)]">
                    {t.contact.message}
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full bg-[var(--bg-card)] border border-[var(--border-main)] rounded-md px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-border resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary from-[#7e22ce] to-[#a855f7] text-white rounded-md text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{loading ? 'Sending...' : t.contact.sendMessage}</span>
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