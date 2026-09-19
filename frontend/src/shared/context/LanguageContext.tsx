import React, { createContext, useContext, useEffect, useState } from 'react';
import { translations, type Language, type Translation } from '../i18n/translations';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  isArabic: boolean;
  t: Translation;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');

    return savedLanguage === 'ar' || savedLanguage === 'en'
      ? savedLanguage
      : 'en';
  });

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(date).toLocaleDateString(locale, options);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        isArabic: language === 'ar',
        t: translations[language],
        formatCurrency,
        formatDate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}