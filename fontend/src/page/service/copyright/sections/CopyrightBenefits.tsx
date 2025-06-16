import React from 'react';
import { Check } from 'lucide-react';

interface Benefit {
  title: string;
  description: string;
}

const CopyrightBenefits: React.FC = () => {
  const benefits: Benefit[] = [
    {
      title: "Bảo vệ quyền lợi tác giả",
      description: "Đăng ký bảo hộ bản quyền tác giả giúp tác giả có quyền chủ động và xác định được tác phẩm của mình, tránh việc bị sao chép hoặc sử dụng mà không được cho phép."
    },
    {
      title: "Khẳng định sở hữu tác phẩm",
      description: "Bản quyền đăng ký chính thức là bằng chứng về sở hữu của tác giả, giúp ngăn ngừa tranh chấp và mâu thuẫn liên quan đến quyền sở hữu."
    },
    {
      title: "Được quyền kiểm soát tác phẩm",
      description: "Tác giả có quyền quyết định việc sử dụng, sao chép, phân phối và bán tác phẩm của mình, tạo điều kiện thuận lợi để khai thác kinh doanh hoặc thương mại từ tác phẩm."
    },
    {
      title: "Duy trì giá trị thương hiệu",
      description: "Bản quyền đăng ký tác phẩm thể hiện tính chuyên nghiệp và uy tín, giúp tăng giá trị thương hiệu cho tác giả và tác phẩm trong mắt công chúng và người tiêu dùng."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          {/* Image Column */}
          <div className="lg:col-span-2">
            <div className="relative">
              <img
                src="https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/giay-chung-nhan-dang-ky-quyen-tac-gia-1.jpg?w=611&ssl=1"
                alt="Giấy chứng nhận đăng ký quyền tác giả"
                className="w-full h-auto rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>

          {/* Content Column */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Lợi ích khi đăng ký bảo hộ bản quyền tác giả
              </h2>
              <h5 className="text-lg text-gray-600 leading-relaxed">
                Đăng ký bảo hộ bản quyền tác giả mang lại nhiều lợi ích quan trọng cho người sở hữu tác phẩm.
              </h5>
            </div>

            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
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

export default CopyrightBenefits;