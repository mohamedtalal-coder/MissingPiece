import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm" hideCloseButton>
      <div className="flex flex-col gap-space-lg">
        <p className="font-body-md text-body-md text-on-surface-variant m-0">
          {message}
        </p>
        
        <div className="flex justify-end gap-space-md pt-space-md border-t border-outline-variant/20">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={isDanger ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
