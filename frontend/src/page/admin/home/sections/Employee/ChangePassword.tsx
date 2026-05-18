import { useState } from "react";
import { User } from "../../../../../types/admin";

interface PasswordChangeProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (userId: string, newPassword: string) => void;
}

const PasswordChangeForm: React.FC<PasswordChangeProps> = ({ user, isOpen, onClose, onSave }) => {
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleInputChange = (field: string, value: string) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
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
            confirmPassword: ''
        });
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">
                        Thay đổi mật khẩu
                    </h3>
                    <button 
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600">
                        <strong>Người dùng:</strong> {user.fullName} ({user.username})
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={passwords.newPassword}
                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập lại mật khẩu mới"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default PasswordChangeForm;