import { useState } from 'react';
import { User } from '../../../../../types/admin';
import { toast } from 'react-toastify';
import Modal from '../../../../../component/common/Modal';
import { Button, Input } from '../../../../../component/common/ui';

interface PasswordChangeProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, newPassword: string) => void;
}

const PasswordChangeForm: React.FC<PasswordChangeProps> = ({ user, isOpen, onClose, onSave }) => {
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPassword || !passwords.confirmPassword) {
      toast.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.warning('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.warning('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    if (user) {
      onSave(user.id, passwords.newPassword);
    }
    handleClose();
  };

  const handleClose = () => {
    setPasswords({ newPassword: '', confirmPassword: '' });
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <Modal
      title="Thay đổi mật khẩu"
      onClose={handleClose}
      size="sm"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Đổi mật khẩu</Button>
        </div>
      }
    >
      <div className="mb-4 rounded-md bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          <strong>Người dùng:</strong> {user.fullName} ({user.username})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Mật khẩu mới *"
          type="password"
          value={passwords.newPassword}
          onChange={(e) => handleInputChange('newPassword', e.target.value)}
          placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
          required
        />
        <Input
          label="Xác nhận mật khẩu *"
          type="password"
          value={passwords.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          placeholder="Nhập lại mật khẩu mới"
          required
        />
      </form>
    </Modal>
  );
};

export default PasswordChangeForm;
