import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface PriceDisplayProps {
  amount: number;
  originalAmount?: number; // If provided, shown with strikethrough next to amount
  currency?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  originalPriceClassName?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  amount,
  originalAmount,
  currency = 'USD', // Could be dynamic based on user locale
  size = 'md',
  className = '',
  originalPriceClassName = ''
}) => {
  const { language } = useLanguage() as { language: string };
  
  // Format the price based on current locale
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const sizeClasses = {
    sm: 'text-body-sm',
    md: 'text-body-md font-medium',
    lg: 'text-headline-sm font-semibold',
    xl: 'text-headline-md font-semibold'
  };

  const hasDiscount = originalAmount !== undefined && originalAmount > amount;

  return (
    <div className={`flex items-baseline gap-2 font-title-editorial tabular-nums tracking-tight ${className}`}>
      <span className={`${sizeClasses[size]} ${hasDiscount ? 'text-primary' : 'text-on-surface'}`}>
        {formatter.format(amount)}
      </span>
      
      {hasDiscount && (
        <span className={`text-on-surface-variant line-through text-sm ${originalPriceClassName}`}>
          {formatter.format(originalAmount)}
        </span>
      )}
    </div>
  );
};
