import React from 'react';
import { Check, Star } from 'lucide-react';

interface BenefitItem {
  title: string;
  description: string;
}

interface ServiceItem {
  title: string;
  description: string;
}

const DesignProtectionServices: React.FC = () => {
  const benefits: BenefitItem[] = [
    {
      title: "Bảo vệ quyền sở hữu",
      description: "Đăng ký bảo hộ kiểu dáng giúp bảo vệ quyền sở hữu và tránh việc người khác sao chép, sử dụng hoặc thương mại hóa kiểu dáng của bạn mà không được phép."
    },
    {
      title: "Xây dựng thương hiệu",
      description: "Kiểu dáng độc đáo và bảo hộ sẽ giúp tạo ra một bộ nhận diện thương hiệu mạnh mẽ và dễ nhận biết, từ đó tạo ra sự tin cậy và lòng trung thành từ phía khách hàng."
    },
    {
      title: "Ngăn chặn cạnh tranh không lành mạnh",
      description: "Bảo hộ kiểu dáng giúp ngăn chặn các đối thủ cạnh tranh sao chép hoặc làm giả sản phẩm của bạn, bảo vệ lợi ích kinh doanh và thúc đẩy môi trường cạnh tranh công bằng."
    },
    {
      title: "Tạo điểm nổi bật trên thị trường",
      description: "Kiểu dáng độc đáo và được bảo hộ có thể giúp sản phẩm của bạn nổi bật trên thị trường, thu hút sự chú ý từ khách hàng và tạo ra lợi thế cạnh tranh."
    }
  ];

  const services: ServiceItem[] = [
    {
      title: "Chuyên môn và kinh nghiệm",
      description: "Với đội ngũ chuyên gia có kinh nghiệm trong lĩnh vực bảo hộ sở hữu trí tuệ, chúng tôi cam kết cung cấp dịch vụ chất lượng và tư vấn chuyên sâu về quy trình đăng ký bảo hộ kiểu dáng công nghiệp."
    },
    {
      title: "Dịch vụ chuyên nghiệp",
      description: "Với dịch vụ chuyên nghiệp và tận tâm, chúng tôi sẽ đồng hành cùng bạn từ khâu lên ý tưởng cho đến việc bảo vệ sản phẩm trên thị trường."
    },
    {
      title: "Tối ưu hóa quy trình",
      description: "Chúng tôi hiểu rằng thời gian và chi phí là yếu tố quan trọng đối với doanh nghiệp của bạn. Vì vậy, chúng tôi tối ưu hóa quy trình đăng ký bảo hộ để giảm thiểu thời gian và chi phí cho bạn."
    },
    {
      title: "Hỗ trợ tư vấn",
      description: "Chúng tôi cung cấp dịch vụ tư vấn và hỗ trợ toàn diện, từ việc xác định kiểu dáng cần bảo hộ cho đến việc hoàn thành hồ sơ đăng ký."
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                LỢI ÍCH KHI ĐĂNG KÝ BẢO HỘ KIỂU DÁNG
              </h2>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Services Section */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                ĐĂNG KÝ BẢO HỘ KIỂU DÁNG TẠI LUẬT TAGA
              </h2>
            </div>
            
            <div className="space-y-6">
              {services.map((service, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DesignProtectionServices;