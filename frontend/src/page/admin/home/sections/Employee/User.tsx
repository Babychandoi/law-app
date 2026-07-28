import React, { useState } from 'react';
import { UserCreate } from '../../../../../types/admin';
import { toast } from 'react-toastify';
import Modal from '../../../../../component/common/Modal';
import { Button, Input } from '../../../../../component/common/ui';

// User Form Component
interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: UserCreate) => void;
}

const UserForm: React.FC<UserFormProps> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
    fullName: '',
    role: 'USER',
    position: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống!';
    } else if (formData.password === undefined || formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự!';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới!';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống!';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ!';
    }

    // Validate fullName
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống!';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự!';
    }

    // Validate phoneNumber (optional)
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^[\d\s+()-]+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ!';
      }
    }

    // Validate position (optional)
    if (formData.position && formData.position.trim() && formData.position.length < 2) {
      newErrors.position = 'Chức vụ phải có ít nhất 2 ký tự!';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Clean data before sending
      const cleanedData = {
        ...formData,
        username: formData.username.trim(),
        password: formData.password?.trim(),
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber?.trim(),
        position: formData.position?.trim(),
        role: formData.role?.trim() as 'ADMIN' | 'USER' | undefined,
      };
      onSave(cleanedData);
      handleClose();
    } catch (error) {
      toast.error('Không thể tạo người dùng mới. Vui lòng thử lại sau!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      phoneNumber: '',
      fullName: '',
      position: '',
      role: 'USER',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Thêm người dùng mới"
      onClose={handleClose}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            Thêm mới
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên đăng nhập *"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Nhập tên đăng nhập"
          disabled={isLoading}
          error={errors.username}
        />
        <Input
          label="Mật khẩu *"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          disabled={isLoading}
          required
          error={errors.password}
        />
        <Input
          label="Họ tên *"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Nhập họ tên"
          disabled={isLoading}
          error={errors.fullName}
        />
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Nhập email"
          disabled={isLoading}
          error={errors.email}
        />
        <Input
          label="Điện thoại"
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          placeholder="Nhập số điện thoại"
          disabled={isLoading}
          error={errors.phoneNumber}
        />
        <Input
          label="Chức vụ"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          placeholder="Nhập chức vụ"
          disabled={isLoading}
          error={errors.position}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
          <select
            aria-label="Vai trò"
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-goldDark transition-colors"
            disabled={isLoading}
          >
            <option value="USER">Nhân viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
