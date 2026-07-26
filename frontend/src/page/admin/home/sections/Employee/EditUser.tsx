import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import Modal from '../../../../../component/common/Modal';
import { UserCreate, User as UserType } from '../../../../../types/admin';
import { Button, Input } from '../../../../../component/common/ui';

interface UserEditProps {
  initialData: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UserCreate, userId: string) => void;
  isLoading?: boolean;
}

const UserEdit: React.FC<UserEditProps> = ({
  initialData,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    position: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        fullName: initialData.fullName || '',
        phoneNumber: initialData.phoneNumber || '',
        position: initialData.position || '',
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      if (!/^[\d\s+()-]+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
      }
    }

    if (formData.position && formData.position.trim() && formData.position.length < 2) {
      newErrors.position = 'Chức vụ phải có ít nhất 2 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof UserCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    if (initialData) {
      const cleanedData: UserCreate = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber?.trim() || '',
        position: formData.position?.trim() || '',
        role: formData.role,
      };
      onSave(cleanedData, initialData.id);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        fullName: initialData.fullName || '',
        phoneNumber: initialData.phoneNumber || '',
        position: initialData.position || '',
        role: initialData.role || 'USER',
      });
    }
    setErrors({});
  };

  const handleClose = () => {
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phoneNumber: '',
      position: '',
      role: 'USER',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Chỉnh sửa thông tin người dùng"
      onClose={handleClose}
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={isLoading}
            className="!text-gray-700"
          >
            Khôi phục
          </Button>
          <Button
            variant="secondary"
            leftIcon={<X className="h-4 w-4" />}
            onClick={handleClose}
            disabled={isLoading}
            className="!border-red-300 !text-red-700 hover:!bg-red-50"
          >
            Hủy
          </Button>
          <Button
            leftIcon={<Save className="h-4 w-4" />}
            onClick={handleSubmit}
            loading={isLoading}
          >
            Lưu thay đổi
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Input
          label="Tên đăng nhập *"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          placeholder="Nhập tên đăng nhập"
          disabled={isLoading}
          error={errors.username}
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
          label="Họ tên *"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          placeholder="Nhập họ tên"
          disabled={isLoading}
          error={errors.fullName}
        />
        <Input
          label="Số điện thoại"
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
      </div>
    </Modal>
  );
};

export default UserEdit;
