import { useState } from 'react';
import { User } from '../../../../../types/admin';
import Modal from '../../../../../component/common/Modal';

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
    setPasswords((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.newPassword || !passwords.confirmPassword) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    if (user) {
      onSave(user.id, passwords.newPassword);
    }
    handleClose();
  };

  const handleClose = () => {
    setPasswords({
      newPassword: '',
      confirmPassword: '',
    });
    onClose();
  };

  if (!isOpen || !user) return null;

  return (
    <Modal title="Thay đổi mật khẩu" onClose={handleClose} size="sm">
      <div className="mb-4 rounded-md bg-gray-50 p-3">
        <p className="text-sm text-gray-600">
          <strong>Người dùng:</strong> {user.fullName} ({user.username})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cp-new" className="mb-1 block text-sm font-medium text-gray-700">
            Mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <input
            id="cp-new"
            type="password"
            value={passwords.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
            required
          />
        </div>

        <div>
          <label htmlFor="cp-confirm" className="mb-1 block text-sm font-medium text-gray-700">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <input
            id="cp-confirm"
            type="password"
            value={passwords.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
            placeholder="Nhập lại mật khẩu mới"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 transition-colors hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="rounded-md bg-brand-goldDark px-4 py-2 text-white transition-colors hover:opacity-90"
          >
            Đổi mật khẩu
          </button>
        </div>
      </form>
    </Modal>
  );
};
export default PasswordChangeForm;
