import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Icon } from '../components/ui/Icon';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions & { id: number; visible: boolean } | null>(null);

  const showToast = useCallback(({ message, type = 'success', duration = 3000 }: ToastOptions) => {
    const id = Date.now();
    setToast({ message, type, duration, id, visible: true });

    setTimeout(() => {
      setToast((current) => (current?.id === id ? { ...current, visible: false } : current));
      
      // Remove entirely after animation
      setTimeout(() => {
        setToast((current) => (current?.id === id ? null : current));
      }, 300);
    }, duration);
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'error': return 'error';
      case 'info': return 'info';
    }
  };

  const getColor = (type: ToastType) => {
    switch (type) {
      case 'success': return 'text-secondary-fixed';
      case 'error': return 'text-error';
      case 'info': return 'text-primary';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast UI */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 pointer-events-none 
          bg-inverse-surface text-inverse-on-surface px-space-lg py-space-md rounded-lg shadow-xl 
          flex items-center gap-space-sm font-label-md text-label-md
          ${toast && toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
        `}
      >
        {toast && (
          <>
            <Icon 
              name={getIcon(toast.type || 'success')} 
              className={`text-xl ${getColor(toast.type || 'success')}`} 
            />
            <span>{toast.message}</span>
          </>
        )}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
