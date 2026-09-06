import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  type?: string;
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  isOpen, onConfirm, onCancel, onClose, title, message, confirmLabel, confirmText, variant, type
}: ConfirmationDialogProps) {
  const handleCancel = onCancel || onClose || (() => {});
  const label = confirmLabel || confirmText || 'Confirm';
  const v: 'default' | 'destructive' = variant || (type === 'danger' ? 'destructive' : 'default');

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        {v === 'destructive' && (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
        )}
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition-colors ${
              v === 'destructive'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            {label}
          </button>
        </div>
      </div>
    </Modal>
  );
}
