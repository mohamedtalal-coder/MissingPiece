import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
  hideCloseButton = false,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-sm p-4 animate-fade-in"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className={`w-full ${maxWidthClasses[maxWidth]} bg-surface rounded-xl shadow-[0_20px_40px_-15px_color-mix(in_srgb,var(--color-inverse-surface)_55%,transparent)] border border-outline-variant/20 flex flex-col max-h-[90vh] animate-scale-in`}
        role="document"
      >
        {title && (
          <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant/20">
            <h2 id="modal-title" className="font-headline-sm text-headline-sm text-on-surface m-0">
              {title}
            </h2>
            {!hideCloseButton && (
              <button
                onClick={onClose}
                className="p-2 -me-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
                aria-label="Close modal"
              >
                <Icon name="close" size={20} />
              </button>
            )}
          </div>
        )}
        
        {!title && !hideCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 end-4 z-10 p-2 text-on-surface-variant hover:text-on-surface rounded-full hover:bg-surface-container bg-surface/50 backdrop-blur transition-colors"
            aria-label="Close modal"
          >
            <Icon name="close" size={20} />
          </button>
        )}

        <div className="overflow-y-auto custom-scrollbar p-space-lg">
          {children}
        </div>
      </div>
    </div>
  );
};
