import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-space-2xl bg-surface-container-lowest/30 rounded-xl border border-outline-variant/20 ${className}`}>
      <div className="w-16 h-16 mb-space-lg rounded-full bg-surface-container flex items-center justify-center text-outline text-3xl">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
        {title}
      </h3>
      <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-space-xl">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
