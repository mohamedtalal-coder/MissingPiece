import React from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: string;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  as?: 'button' | 'link';
  to?: string;
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
  fullWidth = false,
  as = 'button',
  to,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider font-semibold';
  
  const widthClass = fullWidth ? 'w-full' : '';
  
  const variants = {
    primary: 'bg-primary-container text-on-primary-container hover:bg-primary focus:ring-primary',
    secondary: 'bg-surface-container-highest text-on-surface hover:bg-surface-dim focus:ring-surface-dim',
    outline: 'border border-outline-variant/40 text-on-surface hover:text-primary hover:border-primary focus:ring-primary',
    ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest',
    danger: 'bg-error text-on-error hover:opacity-90 shadow-sm focus:ring-error',
  };

  const sizes = {
    sm: 'px-space-md py-space-xs font-label-md text-label-md',
    md: 'px-4 py-2 font-label-md text-label-md',
    lg: 'px-space-lg py-3 font-label-md text-label-md',
    icon: 'p-2'
  };

  const combinedClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`;

  const innerContent = (
    <>
      {isLoading ? (
        <span className="w-4 h-4 me-2 border-2 border-current border-t-transparent rounded-md animate-spin" />
      ) : icon && iconPosition === 'left' ? (
        <Icon name={icon} className={`text-[18px] ${children ? 'me-space-xs' : ''}`} />
      ) : null}
      
      {children}
      
      {!isLoading && icon && iconPosition === 'right' ? (
        <Icon name={icon} className={`text-[18px] ${children ? 'ms-space-xs' : ''}`} />
      ) : null}
    </>
  );

  if (as === 'link' && to) {
    return (
      <Link 
        to={to} 
        className={combinedClasses}
        // @ts-ignore - passing standard button props to Link when acting as button
        {...(props as any)}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {innerContent}
    </button>
  );
};
