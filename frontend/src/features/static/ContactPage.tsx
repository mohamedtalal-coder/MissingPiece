import React, { useState } from 'react';
import { Mail, Send, MapPin, Phone, Loader2, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { staticApi } from './staticApi';
import { Motion } from '../../shared/components/ui/Motion';

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage() as any;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation — mirrors backend rules
    if (!name.trim()) {
      setError(t.contact?.nameRequired || 'Please enter your full name.');
      return;
    }
    if (name.trim().length < 2) {
      setError(t.contact?.nameLength || 'Name must be at least 2 characters long.');
      return;
    }
    if (!email.trim()) {
      setError(t.contact?.emailRequired || 'Please enter your email address.');
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRe.test(email.trim())) {
      setError(t.contact?.emailInvalid || 'Please enter a valid email address.');
      return;
    }
    if (!subject.trim()) {
      setError(t.contact?.subjectRequired || 'Please enter a subject.');
      return;
    }
    if (subject.trim().length < 2) {
      setError(t.contact?.subjectLength || 'Subject must be at least 2 characters long.');
      return;
    }
    if (!message.trim()) {
      setError(t.contact?.messageRequired || 'Please write a message.');
      return;
    }
    if (message.trim().length < 10) {
      setError(t.contact?.messageLength || 'Message must be at least 10 characters long.');
      return;
    }
    if (message.trim().length > 1000) {
      setError(t.contact?.messageTooLong || 'Message must be at most 1000 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await staticApi.sendMessage({ name: name.trim(), email: email.trim().toLowerCase(), subject: subject.trim(), message: message.trim() });
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      // Try to show a specific server-side validation message if available
      const serverErrors = err?.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors) && serverErrors.length > 0) {
        setError(serverErrors[0].message);
      } else {
        setError(err?.response?.data?.message || t.contact?.sendError || 'Failed to send message. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col relative overflow-hidden bg-surface pb-space-2xl min-h-screen">
      {/* Background Effects */}
      <div
        className="absolute top-0 end-0 w-full max-w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_color-mix(in_srgb,var(--color-primary)_15%,transparent)_0%,_transparent_60%)] blur-2xl pointer-events-none"
        aria-hidden
      />
      <div
        className="absolute bottom-0 start-0 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"
        aria-hidden
      />

      <div className="relative pt-space-3xl pb-space-xl px-margin-mobile lg:px-margin max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-space-2xl">
          <Motion preset="up" className="inline-flex items-center gap-2 mb-space-md">
            <span className="h-px w-8 bg-primary/40" />
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-[0.2em]">
              {t.contact?.conciergeSupport || 'Concierge Support'}
            </span>
            <span className="h-px w-8 bg-primary/40" />
          </Motion>

          <Motion preset="up" delayMs={100} className="max-w-2xl mx-auto space-y-space-md">
            <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface tracking-tight leading-[1.1]">
              {t.contact?.title || 'Get in Touch'}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              {t.contact?.subtitle || 'Whether you have a question about our collections or need assistance with an order, our concierge team is here to help.'}
            </p>
          </Motion>
        </div>

        <div className="grid lg:grid-cols-5 gap-space-xl lg:gap-space-2xl">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-space-lg">
            <Motion preset="right" delayMs={200} className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/30 p-space-xl rounded-2xl h-full">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-space-md">
                {t.contact?.getInTouch || 'Contact Information'}
              </h3>
              
              <p className="font-body-sm text-on-surface-variant leading-relaxed mb-space-xl">
                {t.contact?.description || 'We aim to respond to all inquiries within 24 hours. For immediate assistance, please reference our FAQ section.'}
              </p>

              <div className="space-y-space-lg">
                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center shrink-0 group-hover:bg-primary-container/20 group-hover:scale-110 transition-all">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline mb-1">{t.contact?.emailLabel || 'Email'}</p>
                    <p className="font-body-md text-on-surface">{t.contact?.supportEmail || 'concierge@missingpiece.com'}</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center shrink-0 group-hover:bg-primary-container/20 group-hover:scale-110 transition-all">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline mb-1">{t.contact?.phoneLabel || 'Phone'}</p>
                    <p className="font-body-md text-on-surface">{t.contact?.phone || '+1 (800) 123-4567'}</p>
                  </div>
                </div>

                <div className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center shrink-0 group-hover:bg-primary-container/20 group-hover:scale-110 transition-all">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-label-caps text-[10px] uppercase tracking-wider text-outline mb-1">{t.contact?.atelierLabel || 'Atelier'}</p>
                    <p className="font-body-md text-on-surface max-w-[200px]">{t.contact?.location || '123 Artisan Way, Design District, NY 10001'}</p>
                  </div>
                </div>
              </div>
            </Motion>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Motion preset="left" delayMs={300}>
              <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-lg sm:p-space-xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 start-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
                
                {submitted ? (
                  <div className="text-center py-space-3xl space-y-space-md animate-fade-in">
                    <div className="w-16 h-16 bg-primary-container/20 text-primary border border-primary-container/40 rounded-full flex items-center justify-center mx-auto mb-space-lg">
                      <MessageSquare className="w-8 h-8" />
                    </div>

                    <h4 className="font-headline-md text-headline-md text-on-surface">
                      {t.contact?.messageSent || 'Message Sent Successfully'}
                    </h4>

                    <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
                      {t.contact?.thankYou || 'Thank you for reaching out. A member of our concierge team will be in touch with you shortly.'}
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setName('');
                        setEmail('');
                        setSubject('');
                        setMessage('');
                      }}
                      className="mt-space-xl px-6 py-2.5 border border-outline-variant/50 rounded-lg text-sm font-label-caps uppercase tracking-widest hover:bg-surface-container hover:text-on-surface transition-colors"
                    >
                      {t.contact?.sendAnother || 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-space-md">
                    {error && (
                      <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error text-sm font-medium flex items-center gap-2 animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
                        {error}
                      </div>
                    )}
                    
                    <div className="grid sm:grid-cols-2 gap-space-md">
                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] uppercase tracking-wider text-outline block">
                          {t.contact?.name || 'Full Name'}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t.contact?.namePlaceholder || 'Jane Doe'}
                          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-label-caps text-[10px] uppercase tracking-wider text-outline block">
                          {t.contact?.email || 'Email Address'}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.contact?.emailPlaceholder || 'jane@example.com'}
                          className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] uppercase tracking-wider text-outline block">
                        {t.contact?.subject || 'Subject'}
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t.contact?.subjectPlaceholder || 'What is this regarding?'}
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-label-caps text-[10px] uppercase tracking-wider text-outline block">
                        {t.contact?.message || 'Message'}
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t.contact?.messagePlaceholder || 'How can we help you?'}
                        className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 py-3.5 bg-primary text-on-primary rounded-xl text-sm font-label-caps uppercase tracking-widest hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center justify-center gap-2 shadow-[0_4px_14px_color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:shadow-[0_6px_20px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] disabled:opacity-50 disabled:hover:shadow-none"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      <span>{loading ? (t.contact?.sending || 'Sending...') : (t.contact?.sendMessage || 'Send Message')}</span>
                    </button>
                  </form>
                )}
              </div>
            </Motion>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;