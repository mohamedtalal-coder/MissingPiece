import { useEffect } from 'react';
import { Icon } from './Icon';
import { useScrollLock } from '../../hooks/useScrollLock';

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export function ZoomModal({ isOpen, onClose, imageUrl, title }: ZoomModalProps) {
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-surface-container-lowest/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Zoomed view: ${title}`}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] rounded-xl overflow-hidden bg-surface-container border border-outline-variant/40 shadow-2xl flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 px-5 bg-surface-container-low border-b border-outline-variant/30 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-headline-sm text-sm text-on-surface truncate">{title}</p>
            <p className="text-[10px] font-label-caps uppercase tracking-wider text-primary-container mt-0.5">
              Archival optical view
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
            aria-label="Close zoom"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-surface-container-lowest min-h-[40vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-xl"
            draggable={false}
          />
        </div>

        <div className="p-3 px-5 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between text-[11px] text-outline font-label-caps uppercase tracking-wider">
          <span>Esc or click outside to close</span>
        </div>
      </div>
    </div>
  );
}
