import { Mail, User, Phone, Calendar, MessageSquare, Sparkles, Send, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getServiceHome } from "../service/service";
import { ServiceItem } from "../types/service";
import PhoneInput from "react-phone-input-2";
import { CustomerService } from "../types/service";
import { createCustomerService } from "../service/service";
import "react-phone-input-2/lib/style.css";
import Swal from "sweetalert2";
import { toast } from 'react-toastify';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const ConsultationForm = () => {
  const [formData, setFormData] = useState<CustomerService>({
    name: "",
    phone: "",
    email: "",
    serviceId: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceItem[]>([]);
  const [errors, setErrors] = useState<Partial<CustomerService>>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServiceHome();
        if (response.data && response.data.length > 0) {
          setServiceOptions(response.data);
          setFormData(prev => ({ ...prev, service: response.data[0].id }));
        }
      } catch (error) {
        toast.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại!');
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.service-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CustomerService]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePhoneChange = (phone: string) => {
    setFormData(prev => ({ ...prev, phone }));
    if (errors.phone) {
      setErrors(prev => ({ ...prev, phone: undefined }));
    }
  };

  const handleServiceSelect = (serviceId: string) => {
    setFormData(prev => ({ ...prev, serviceId: serviceId }));
    setIsDropdownOpen(false);
    if (errors.serviceId) {
      setErrors(prev => ({ ...prev, serviceId: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerService> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập họ tên";
    if (!formData.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (formData.phone.length < 10) newErrors.phone = "Số điện thoại không hợp lệ";
    if (!formData.email.trim()) newErrors.email = "Vui lòng nhập email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    if (!formData.serviceId) newErrors.serviceId = "Vui lòng chọn dịch vụ";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    Swal.fire({
      title: 'Đang gửi...',
      text: 'Vui lòng chờ trong giây lát.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await createCustomerService(formData);
      Swal.fire({
        icon: 'success',
        title: 'Gửi thành công!',
        text: response.message || 'Chúng tôi đã nhận được thông tin của bạn.',
      });

      window.gtag?.('event', 'conversion', {
        send_to: 'AW-17438859267/9CUZCKWNmoAbEIPAv_tA',
        value: 1.0,
        currency: 'VND',
      });

      setFormData({
        name: "",
        phone: "+84",
        email: "",
        serviceId: serviceOptions[0]?.id || "",
        description: "",
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Đã xảy ra lỗi!',
        text: 'Vui lòng thử lại sau.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = serviceOptions.find(service => service.id === formData.serviceId);

  return (
    <div id="contact-form" className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-2xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            <Sparkles className="text-yellow-400" size={24} />
            <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
              Đăng Ký Tư Vấn Miễn Phí
            </span>
          </h2>
          <p className="text-gray-600 text-lg">
            Để lại thông tin để được tư vấn chuyên nghiệp từ đội ngũ chuyên gia
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-none md:rounded-3xl shadow-none md:shadow-2xl border-0 md:border md:border-gray-200 p-4 md:p-10 hover:shadow-3xl transition-all duration-500">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="group">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span>Họ và tên</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ${
                  errors.name ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Nhập họ tên của bạn"
              />
              {errors.name && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
            </div>

            {/* Phone Field */}
            <div className="group">
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <span>Số điện thoại</span>
                <span className="text-red-500">*</span>
              </label>
              <PhoneInput
                country={'vn'}
                value={formData.phone}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoComplete: 'off',
                  placeholder: 'Nhập số điện thoại của bạn',
                }}
                inputClass={`!w-full !py-3 !rounded-xl !border-2 ${
                  errors.phone ? '!border-red-500' : '!border-gray-200 hover:!border-gray-300'
                }`}
                containerClass="!w-full"
                buttonClass={`!border-2 !rounded-l-xl ${
                  errors.phone ? '!border-red-500' : '!border-gray-200'
                }`}
                dropdownClass="!bg-white !border-2 !border-gray-200 !rounded-xl !shadow-xl !z-50"
                preferredCountries={['vn', 'us', 'gb', 'fr', 'de', 'jp', 'kr', 'cn']}
                inputStyle={{
                  width: '100%',
                  height: '48px',
                  paddingLeft: '48px',
                  borderRadius: '12px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span>⚠</span>{errors.phone}</p>}
            </div>

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Mail className="w-4 h-4 text-purple-600" />
                </div>
                <span>Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300 ${
                  errors.email ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                }`}
                placeholder="Nhập email của bạn"
              />
              {errors.email && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
            </div>

            {/* Service Selection */}
            <div className="group relative service-dropdown">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-600" />
                </div>
                <span>Dịch vụ cần tư vấn</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-300 flex items-center justify-between ${
                    errors.serviceId ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-gray-700">
                    {selectedService ? selectedService.title : 'Chọn dịch vụ'}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                    {serviceOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleServiceSelect(option.id)}
                        className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                          formData.serviceId === option.id ? 'bg-orange-100 text-orange-700 font-semibold' : 'text-gray-700'
                        }`}
                      >
                        {option.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.serviceId && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><span>⚠</span>{errors.serviceId}</p>}
            </div>

            {/* Content Field */}
            <div className="group">
              <label htmlFor="description" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <div className="p-2 bg-pink-50 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-pink-600" />
                </div>
                <span>Nội dung tư vấn</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300 resize-none"
                placeholder="Mô tả chi tiết về dịch vụ bạn cần tư vấn..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-gray-900 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Đăng ký tư vấn ngay</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <p className="text-sm">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationForm;
