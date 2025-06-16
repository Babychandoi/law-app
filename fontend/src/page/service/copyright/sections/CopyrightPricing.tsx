import React from 'react';
import { Check, Star } from 'lucide-react';

const TrademarkPricing = () => {
  const pricingPlans = [
    {
      name: "Cơ bản",
      price: "2.200.000",
      currency: "VND",
      description: "Tra cứu sơ bộ và nộp đơn đăng ký nhãn hiệu cho 1 nhóm sản phẩm/dịch vụ (tối đa 6 sản phẩm/dịch vụ).",
      features: [
        "Tư vấn quy trình và thủ tục đăng ký",
        "Tra cứu sơ bộ (tối đa 5 nhãn)",
        "Tư vấn sửa đổi nhãn hiệu sau tra cứu",
        "Soạn thảo, nộp hồ sơ đăng ký nhãn hiệu",
        "Theo dõi hồ sơ sau khi đăng ký",
        "Tư vấn đặt tên thương hiệu (tối đa 3 thương hiệu)"
      ],
      featured: false
    },
    {
      name: "Nâng cao",
      price: "2.800.000",
      currency: "VND",
      description: "Tra cứu chuyên sâu và nộp đơn đăng ký nhãn hiệu cho 1 nhóm sản phẩm/dịch vụ (tối đa 6 sản phẩm/dịch vụ).",
      features: [
        "Bao gồm gói cơ bản",
        "Tra cứu chuyên sâu khả năng bảo hộ",
        "Hỗ trợ tra cứu chuyên sâu lần 2 nếu kết quả tra cứu thất bại",
        "Miễn phí phí dịch vụ lần 2 nếu bị từ chối cấp văn bằng",
        "Tư vấn sửa nhãn sau tra cứu chuyên sâu nếu có"
      ],
      featured: true
    },
    {
      name: "Tùy chỉnh",
      price: "Liên hệ",
      currency: "",
      description: "Tư vấn đăng ký bảo hộ nhãn hiệu theo nhu cầu của Quý khách hàng. Vui lòng liên hệ với Luật Taga để được tư vấn chi tiết.",
      features: [
        "Bao gồm gói cơ bản",
        "Bao gồm gói nâng cao",
        "Tư vấn thiết kế nhãn hiệu, thiết kế Logo, bộ nhận diện thương hiệu",
        "Tư vấn tùy theo nhu cầu đặc biệt của quý khách hàng",
        "Liên hệ với Luật Taga để được tư vấn chi tiết"
      ],
      featured: false
    }
  ];

  const scrollToContact = () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            CHI PHÍ ĐĂNG KÝ BẢO HỘ NHÃN HIỆU TẠI TAGA
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.featured 
                  ? 'ring-4 ring-blue-500 ring-opacity-50' 
                  : ''
              }`}
            >
              {/* Featured Badge */}
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-bl-2xl">
                  <Star className="w-4 h-4 inline-block mr-1" />
                  <span className="text-sm font-semibold">Phổ biến</span>
                </div>
              )}

              {/* Header */}
              <div className={`px-8 py-8 text-center ${
                plan.featured 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'bg-gray-50'
              }`}>
                <h3 className={`text-2xl font-bold mb-4 ${
                  plan.featured ? 'text-white' : 'text-gray-900'
                }`}>
                  {plan.name}
                </h3>
                
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${
                    plan.featured ? 'text-white' : 'text-gray-900'
                  }`}>
                    {plan.price}
                  </span>
                  {plan.currency && (
                    <span className={`text-sm font-medium ml-2 ${
                      plan.featured ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                      {plan.currency}
                    </span>
                  )}
                </div>

                <div className={`w-16 h-1 mx-auto rounded-full ${
                  plan.featured 
                    ? 'bg-white bg-opacity-50' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}></div>
              </div>

              {/* Description */}
              <div className="px-8 py-6">
                <p className="text-gray-700 text-center leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <div className="px-8 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="px-8 pb-8">
                <button
                  onClick={scrollToContact}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 ${
                    plan.featured
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-transparent hover:border-blue-500'
                  }`}
                >
                  Đăng ký tư vấn
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tất cả các gói dịch vụ đều bao gồm tư vấn chuyên nghiệp và hỗ trợ khách hàng 24/7. 
            Liên hệ với chúng tôi để được tư vấn chi tiết về gói dịch vụ phù hợp nhất.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrademarkPricing;