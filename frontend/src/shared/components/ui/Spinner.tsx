import React from 'react';

import { useLanguage } from '../../context/LanguageContext';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'surface' | 'current';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = ''
}) => {
  const { t } = useLanguage() as any;
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const colorClasses = {
    primary: 'border-primary border-t-transparent',
    secondary: 'border-secondary border-t-transparent',
    surface: 'border-surface border-t-transparent',
    current: 'border-current border-t-transparent'
  };

  return (
    <div 
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label={t?.common?.loadingDesc || "loading"}
    >
      <span className="sr-only">{t?.common?.loading || "Loading..."}</span>
    </div>
  );
};
