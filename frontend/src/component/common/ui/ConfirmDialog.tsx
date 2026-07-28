import React from 'react';
import Modal from '../Modal';
import Button from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** 'danger' => nút xác nhận đỏ (xoá/không thể hoàn tác). */
  variant?: 'primary' | 'danger';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Hộp thoại xác nhận dùng chung (thay window.confirm), dựng trên Modal a11y. */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = 'Xác nhận',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <Modal
      title={title}
      size="sm"
      onClose={onCancel}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      <p className="text-sm text-gray-700">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
