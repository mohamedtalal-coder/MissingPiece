import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, label, className = '', id, ...props }, ref) => {
    const inputId = id || React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label 
            htmlFor={inputId} 
            className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          {icon && (
            <Icon 
              name={icon} 
              className="absolute left-space-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none" 
            />
          )}
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full bg-surface-container-lowest 
              py-space-xs rounded font-body-sm text-body-sm text-on-surface 
              placeholder:text-on-surface-variant 
              focus:outline-none focus:bg-surface-bright focus:ring-1 focus:ring-primary shadow-sm
              ${icon ? 'ps-10 pr-space-md' : 'px-space-md'}
              ${error ? 'border border-error focus:ring-error focus:border-error' : 'border-none'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-error font-label-sm text-label-sm pt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
