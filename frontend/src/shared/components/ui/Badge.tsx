import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'outline' | 'error' | 'success' | 'surface';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'inline-block px-2 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider';
  
  const variants = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary-container text-on-secondary-container',
    outline: 'border border-outline text-on-surface-variant',
    error: 'bg-error-container text-on-error-container text-error',
    success: 'bg-secondary-fixed text-on-secondary-fixed',
    surface: 'bg-surface-container-lowest/95 backdrop-blur text-secondary',
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
