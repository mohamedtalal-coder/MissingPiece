import { useState, useEffect } from 'react';
import { Motion } from '../../shared/components/ui/Motion';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../shared/context/LanguageContext';
import { apiClient } from '../../api/client';
import { Link } from 'react-router-dom';

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

export function FAQPage() {
  const { t, language } = useLanguage();
  const fq = t.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    apiClient
      .get(`/faq?lang=${language}`)
      .then(({ data }) => {
        if (!cancelled) {
          setFaqs(data.items ?? []);
          setOpenIndex(data.items?.length > 0 ? 0 : null);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [language]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface pt-20 pb-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Motion preset="up" className="text-center space-y-4 mb-16">
          <h1 className="font-display-lg text-4xl md:text-5xl tracking-tight text-on-surface">
            {fq.title}
          </h1>
          <p className="text-on-surface-variant text-lg">
            {fq.subtitle}
          </p>
        </Motion>

        {loading ? (
          <Motion preset="up" delayMs={100}>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-surface-container-low animate-pulse"
                />
              ))}
            </div>
          </Motion>
        ) : error ? (
          <Motion preset="up" delayMs={100}>
            <p className="text-center text-on-surface-variant">{fq.fetchError}</p>
          </Motion>
        ) : faqs.length === 0 ? (
          <Motion preset="up" delayMs={100}>
            <p className="text-center text-on-surface-variant">{fq.empty ?? 'No FAQs available yet.'}</p>
          </Motion>
        ) : (
          <Motion preset="up" delayMs={100} className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq._id}
                  className="border border-outline-variant/50 rounded-xl bg-surface-container-low overflow-hidden transition-colors hover:border-outline-variant"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left focus:outline-none"
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    <span className="font-medium text-lg text-on-surface">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 text-on-surface-variant transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} ${language === 'ar' ? 'mr-3' : 'ml-3'}`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="px-5 sm:px-6 pb-5 sm:pb-6 text-on-surface-variant leading-relaxed"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                      >
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Motion>
        )}

        <Motion preset="up" delayMs={200} className="mt-16 text-center">
          <p className="text-on-surface-variant mb-4">{fq.stillQuestions}</p>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary-container text-on-primary-container font-medium hover:bg-primary-container/90 transition-colors"
          >
            {fq.contactCta}
          </Link>
        </Motion>
      </div>
    </div>
  );
}

export default FAQPage;
