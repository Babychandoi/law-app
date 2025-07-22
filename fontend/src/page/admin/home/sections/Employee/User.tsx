import React, { useState } from 'react';
import { UserCreate } from '../../../../../types/admin';
import { toast } from 'react-toastify';

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
        }
         else if (formData.username.length < 3) {
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
            if (!/^[\d\s\+\-\(\)]+$/.test(formData.phoneNumber)) {
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
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleSubmit =(e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

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
                role: formData.role?.trim() as "ADMIN" | "USER" | undefined,

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
            role: 'USER'
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">
                        Thêm người dùng mới
                    </h3>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên đăng nhập <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.username 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập tên đăng nhập"
                            disabled={isLoading}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>
                    {/*Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.password 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
                            disabled={isLoading}
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                    {/* Full Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Họ tên <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.fullName 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập họ tên"
                            disabled={isLoading}
                        />
                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.email 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập email"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* phoneNumber Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Điện thoại
                        </label>
                        <input
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.phoneNumber 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập số điện thoại"
                            disabled={isLoading}
                        />
                        {errors.phoneNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                        )}
                    </div>

                    {/* Position Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chức vụ
                        </label>
                        <input
                            type="text" 
                            value={formData.position}
                            onChange={(e) => handleInputChange('position', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                                errors.position 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-blue-500'
                            }`}
                            placeholder="Nhập chức vụ"
                            disabled={isLoading}
                        />
                        {errors.position && (
                            <p className="text-red-500 text-sm mt-1">{errors.position}</p>
                        )}
                    </div>

                    {/* Role Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Vai trò <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => handleInputChange('role', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            disabled={isLoading}
                        >
                            <option value="USER">Người dùng</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </>
                            ) : (
                                'Thêm mới'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;