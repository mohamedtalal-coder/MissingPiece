import React from 'react';
import { Icon } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-on-primary hover:bg-primary-container shadow-sm focus:ring-primary',
    secondary: 'bg-surface-container-highest text-on-surface hover:bg-surface-dim shadow-sm focus:ring-surface-dim',
    outline: 'border border-outline text-on-surface hover:bg-surface-container focus:ring-outline',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-sm focus:ring-error',
  };

  const sizes = {
    sm: 'px-space-md py-space-xs font-label-md text-label-md',
    md: 'px-space-md py-2 font-label-md text-label-md',
    lg: 'px-space-xl py-space-md font-label-lg text-label-lg',
    icon: 'p-2'
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-md animate-spin" />
      ) : icon && iconPosition === 'left' ? (
        <Icon name={icon} className={`text-lg ${children ? 'mr-1' : ''}`} />
      ) : null}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' ? (
        <Icon name={icon} className={`text-lg ${children ? 'ml-1' : ''}`} />
      ) : null}
    </button>
  );
};
