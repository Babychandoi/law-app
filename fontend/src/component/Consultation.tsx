import { Mail, User, Phone, Calendar, MessageSquare, Sparkles, Send, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { getServiceHome } from "../service/service";
import { ServiceItem } from "../types/service";
import PhoneInput from "react-phone-input-2";
import { CustomerService } from "../types/service";
import { createCustomerService } from "../service/service";
import "react-phone-input-2/lib/style.css";

const ConsultationForm = () => {
  const [formData, setFormData] = useState<CustomerService>({
    name: "",
    phone: "",
    email: "",
    serviceId : "",
    description:""
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
        console.error("Error fetching services:", error);
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
    try {
      console.log(formData);
      const response = await createCustomerService(formData);
      alert(response.message);
      setFormData({ name: "", phone: "+84", email: "", serviceId: serviceOptions[0]?.id || "", description: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService = serviceOptions.find(service => service.id === formData.serviceId);

  return (
    <div id="contact-form" className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Đăng ký tư vấn</h1>
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-gray-600">Để lại thông tin để được tư vấn miễn phí</p>
        </div>

        <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="group">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User  className="w-5 h-5 text-blue-500" />
                <span>Họ và tên</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Nhập họ tên của bạn"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Phone Field */}
            <div className="group">
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-5 h-5 text-green-500" />
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
                inputClass={`!w-full !py-3  !rounded-xl !border-2 !bg-white/80 ${errors.phone ? '!border-red-500' : '!border-gray-200'}`}
                containerClass="!w-full"
                buttonClass={`!border-2 !rounded-l-xl !bg-white/80 ${errors.phone ? '!border-red-500' : '!border-gray-200'}`}
                dropdownClass="!bg-white !border-2 !border-gray-200 !rounded-xl !shadow-lg !z-50"
                preferredCountries={['vn', 'us', 'gb', 'fr', 'de', 'jp', 'kr', 'cn']}
                inputStyle={{
                  width: '100%',
                  height: '48px', // Set the height of the input
                  paddingLeft :'45px', // Adjust padding as needed
                  borderRadius: '12px',
                  borderColor: errors.phone ? '#f87171' : '#e5e7eb',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '16px',
                  boxSizing: 'border-box', // Ensure padding is included in the height
                }}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Email Field */}
            <div className="group" >
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-5 h-5 text-purple-500" />
                <span>Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="Nhập email của bạn"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Service Selection */}
            <div className="group relative service-dropdown">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span>Dịch vụ cần tư vấn</span>
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 flex items-center justify-between ${errors.serviceId ? 'border-red-500' : 'border-gray-200'}`}
                >
                  <span className="text-gray-700">{selectedService ? selectedService.title : 'Chọn dịch vụ'}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                    {serviceOptions.map((option, index) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleServiceSelect(option.id)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-orange-50 transition-colors duration-200 ${formData.serviceId === option.id ? 'bg-orange-100 text-orange-700' : 'text-gray-700'}`}
                      >
                        <span>{option.title}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Field */}
            <div className="group">
              <label htmlFor="content" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-5 h-5 text-pink-500" />
                <span>Nội dung tư vấn</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/80 resize-none"
                placeholder="Mô tả chi tiết về dịch vụ bạn cần tư vấn..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất</p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-xs text-gray-400">Powered by</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-semibold text-purple-600">Premium Service</span>
            </div>
          </div>
        </div>

        {/* Floating decoration elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-32 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
        <div className="absolute bottom-20 left-16 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
      </div>
    </div>
  );
};

export default ConsultationForm;
