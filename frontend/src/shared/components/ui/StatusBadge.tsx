import React from 'react';

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
type MessageStatus = 'unread' | 'read' | 'resolved';

interface StatusBadgeProps {
  status: OrderStatus | MessageStatus | boolean;
  type?: 'order' | 'message' | 'active';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'order',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded font-label-sm text-label-sm uppercase tracking-wider whitespace-nowrap';

  let config = { label: '', classes: '' };

  if (type === 'active' && typeof status === 'boolean') {
    config = status
      ? { label: 'Active', classes: 'bg-primary-container/20 text-primary border border-primary/20' }
      : { label: 'Inactive', classes: 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/50' };
  } else if (type === 'order') {
    switch (status as OrderStatus) {
      case 'pending':
        config = { label: 'Pending', classes: 'bg-surface-container text-on-surface border border-outline-variant' };
        break;
      case 'paid':
        config = { label: 'Paid', classes: 'bg-primary-container/30 text-primary border border-primary/30' };
        break;
      case 'shipped':
        config = { label: 'Shipped', classes: 'bg-secondary-container/40 text-secondary border border-secondary/40' };
        break;
      case 'delivered':
        config = { label: 'Delivered', classes: 'bg-surface-bright text-on-surface border border-outline' };
        break;
      case 'cancelled':
        config = { label: 'Cancelled', classes: 'bg-error-container/30 text-error border border-error/30' };
        break;
    }
  } else if (type === 'message') {
    switch (status as MessageStatus) {
      case 'unread':
        config = { label: 'Unread', classes: 'bg-primary-container text-on-primary-container border border-primary' };
        break;
      case 'read':
        config = { label: 'Read', classes: 'bg-surface-container text-on-surface border border-outline-variant' };
        break;
      case 'resolved':
        config = { label: 'Resolved', classes: 'bg-surface-bright text-on-surface border border-outline' };
        break;
    }
  }

  return (
    <span className={`${baseClasses} ${config.classes} ${className}`}>
      {config.label}
    </span>
  );
};
