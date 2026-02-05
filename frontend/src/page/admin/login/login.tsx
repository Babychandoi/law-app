import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';
import {login} from '../../../service/admin'
import { Login } from '../../../types/admin';
import { useNavigate } from 'react-router-dom';
import { checkToken } from '../../../service/admin';
import { tryRefreshToken } from '../../../service/axiosClient';
const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Login>({ username: '', password: '' });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      checkToken(token)
        .then(async (res) => {
          if (res.code === 200 && res.data.valid) {
            navigate("/administration");
          } else {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              navigate("/administration");
            } else {
              sessionStorage.clear();
            }
          }
        })
        .catch(() => {
          sessionStorage.clear();
        });
    }
  }, [navigate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.username) {
      newErrors.username = 'Username là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username phải có ít nhất 3 ký tự';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        const response = await login(formData);
        if (response.code === 200 && response.data) {
          const token = response.data;
          sessionStorage.setItem("accessToken", token.token);
          sessionStorage.setItem("refreshToken", token.refreshToken);
          navigate("/administration");
        } else {
          // Handle non-200 response codes
          setErrors({ general: response.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.' });
        }
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Handle error response from backend
        if (error.response?.data?.message) {
          // Display message from backend
          setErrors({ general: error.response.data.message });
        } else if (error.response?.status === 500) {
          setErrors({ general: 'Lỗi hệ thống. Vui lòng thử lại sau.' });
        } else if (error.message === 'Network Error') {
          setErrors({ general: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.' });
        } else {
          setErrors({ general: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.' });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Poip Law
            </h1>
            <p className="text-gray-300">
              Đăng nhập để truy cập trang quản trị
            </p>
          </div>

          {/* General Error */}
          {errors.general && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-center">
              <p className="text-red-200 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập username"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="text-red-400 text-sm">{errors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-200">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password}</p>
              )}
            </div>
            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </div>
          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-400">
              © 2025 Poip Law. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;