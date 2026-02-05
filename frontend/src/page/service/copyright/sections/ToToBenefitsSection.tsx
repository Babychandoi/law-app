import React from 'react';
import { CheckCircle, Check, Zap, DollarSign, Target } from 'lucide-react';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ToToBenefitsSection: React.FC = () => {
  const benefits: Benefit[] = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "ĐƠN GIẢN - NHANH CHÓNG",
      description: "Chỉ với 3 bước đơn giản - Mọi thủ tục Luật Poip lo hết"
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "TIẾT KIỆM CHI PHÍ",
      description: "Mức phí được Luật Poip hỗ trợ"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "KẾT QUẢ BẢO HỘ ĐẠT 100%",
      description: "Luật Poip cam kết về kết quả cho Khách hàng - Hoàn lại tiền cho KH khi kết quả không như mong muốn"
    }
  ];

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900">
            LỢI ÍCH KHI ĐĂNG KÝ TẠI POIP LAW
          </h3>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="group text-center p-8 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 group-hover:bg-green-200 group-hover:scale-110 transition-all duration-300">
                <div className="text-green-600">
                  {benefit.icon}
                </div>
              </div>

              {/* Content */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-green-50 rounded-full">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-semibold">
              Cam kết chất lượng dịch vụ hàng đầu
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToToBenefitsSection;