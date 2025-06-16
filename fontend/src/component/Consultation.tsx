import { Mail, User, Phone, Calendar, MessageSquare, Sparkles, Send } from "lucide-react";
import { useState } from "react";

type FormData = {
  name: string;
  phone: string;
  email: string;
  service: string;
  content: string;
};

const ConsultationForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    service: "insurance",
    content: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("Form submitted:", formData);
    setIsSubmitting(false);
    
    // Reset form after successful submission
    setFormData({
      name: "",
      phone: "",
      email: "",
      service: "insurance",
      content: "",
    });
  };

  return (
    <div id = "contact-form" className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header with floating animation */}
        <div className="text-center mb-8 animate-pulse">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600 animate-spin" style={{animationDuration: '3s'}} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Đăng ký tư vấn
            </h1>
            <Sparkles className="w-8 h-8 text-blue-600 animate-spin" style={{animationDuration: '3s', animationDirection: 'reverse'}} />
          </div>
          <p className="text-gray-600">Để lại thông tin để được tư vấn miễn phí</p>
        </div>

        {/* Form container with glassmorphism effect */}
        <div className="backdrop-blur-lg bg-white/70 rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-105 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Field */}
            <div className="group">
              <label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>Họ và tên</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>

            {/* Phone Field */}
            <div className="group">
              <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Phone className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                <span>Số điện thoại</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                placeholder="Nhập số điện thoại"
                required
              />
            </div>

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span>Email</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            {/* Service Selection */}
            <div className="group">
              <label htmlFor="service" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                <span>Dịch vụ cần tư vấn</span>
                <span className="text-red-500">*</span>
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 cursor-pointer"
                required
              >
                <option value="insurance">🛡️ Sản phẩm bảo hiểm</option>
                <option value="consulting">💰 Tư vấn tài chính</option>
                <option value="investment">📈 Đầu tư</option>
                <option value="other">🔧 Dịch vụ khác</option>
              </select>
            </div>

            {/* Content Field */}
            <div className="group">
              <label htmlFor="content" className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="w-5 h-5 text-pink-500 group-hover:scale-110 transition-transform" />
                <span>Nội dung tư vấn</span>
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90 resize-none"
                placeholder="Mô tả chi tiết về dịch vụ bạn cần tư vấn..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
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
            <p className="text-sm text-gray-500">
              Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-xs text-gray-400">Powered by</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-xs font-semibold text-purple-600">Premium Service</span>
            </div>
          </div>
        </div>

        {/* Floating decoration elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-32 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '1s', animationDuration: '3s'}}></div>
        <div className="absolute bottom-20 left-16 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-bounce" style={{animationDelay: '2s', animationDuration: '3s'}}></div>
      </div>
    </div>
  );
};

export default ConsultationForm;