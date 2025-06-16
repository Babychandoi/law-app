import React from 'react';
import { Check, Clock, TrendingUp, DollarSign, Shield } from 'lucide-react';

const ToToBenefits = () => {
  const benefits = [
    {
      icon: <Check className="w-6 h-6" />,
      title: "Tư vấn chuyên nghiệp",
      description: "Nhận được tư vấn từ luật sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ nhãn hiệu."
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Thủ tục nhanh chóng",
      description: "Luật sư giúp đơn giản hóa quy trình và giải quyết thủ tục đăng ký một cách nhanh chóng, tiết kiệm thời gian và công sức."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Đạt tỷ lệ thành công cao",
      description: "Sử dụng dịch vụ luật sư tại Luật ToTo tăng khả năng đạt tỷ lệ thành công cao trong việc đăng ký bảo hộ nhãn hiệu."
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "Chi phí hợp lý",
      description: "Nhận được dịch vụ chất lượng từ luật sư với chi phí hợp lý và công bằng."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Đại diện sở hữu công nghiệp",
      description: "Luật ToTo là tổ chức Đại diện SHCN uy tín tại Việt Nam, có đầy đủ năng lực tư vấn và thực thi xác lập quyền SHCN cho khách hàng trong và ngoài nước."
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            LỢI ÍCH KHI ĐĂNG KÝ BẢO HỘ NHÃN HIỆU TẠI TOTO
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Luật sư tại Luật ToTo mang lại nhiều lợi ích cho việc đăng ký bảo hộ nhãn hiệu, bao gồm:
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits List */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certificate Image */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Certificate placeholder */}
                <div className="text-center p-8">
                    <img
                    src="https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/08/GCN-DKNH-281977_001.jpg?w=1246&ssl=1"
                    alt="Giấy chứng nhận đăng ký nhãn hiệu"
                    className="w-full h-auto rounded-lg shadow-lg"
                    loading="lazy"
                  />
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full opacity-20"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-indigo-500 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-4 w-4 h-4 bg-blue-400 rounded-full opacity-30"></div>
              </div>
              
              {/* Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                ✓ Uy tín
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ToToBenefits;