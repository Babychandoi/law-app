import React from 'react';
import { Heart } from 'lucide-react';

const CustomerTestimonials = () => {
  const testimonials = [
    {
      id: 1,
      companyName: "CÔNG TY TNHH LOTTE VINA INTERNATIONAL",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/1c30c09f-ddcb-49fc-9143-1712de29c242-1.jpeg?w=200&ssl=1",
      review: "Tôi cảm thấy yên tâm với việc TOTO có đội ngũ luật sư giàu kinh nghiệm và hiểu biết sâu rộng về pháp lý liên quan đến việc đăng ký nhãn hiệu. Họ đã giúp tôi hiểu rõ quy trình và đảm bảo mọi thủ tục được thực hiện đúng cách.",
      rating: 5
    },
    {
      id: 2,
      companyName: "CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI NHỰA KINH BẮC",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/d76cc5ce939e38c0618f.jpg?w=500&ssl=1",
      review: "Quá trình đăng ký diễn ra rất smooth và hiệu quả. Tôi không cần lo lắng về các bước phức tạp hay thủ tục rườm rà. Điều này giúp tiết kiệm thời gian và chi phí cho tôi.",
      rating: 5
    },
    {
      id: 3,
      companyName: "CÔNG TY CỔ PHẦN TẬP ĐOÀN NHỰA ĐÔNG Á",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/279eeb7cbc2c17724e3d.jpg?w=766&ssl=1",
      review: "Tôi đánh giá cao khả năng giao tiếp linh hoạt của TOTO. Họ luôn sẵn sàng lắng nghe ý kiến của tôi và điều chỉnh theo nhu cầu cụ thể của dự án.",
      rating: 5
    }
  ];

  const StarRating = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center justify-center gap-1 mt-4">
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index < rating 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Heart className="w-4 h-4 fill-current" />
          </div>
        ))}
      </div>
    );
  };

  interface Testimonial {
    id: number;
    companyName: string;
    image: string;
    review: string;
    rating: number;
  }

  const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
        {/* Company Logo/Image */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-32 rounded-lg overflow-hidden shadow-md">
            <img 
              src={testimonial.image} 
              alt={testimonial.companyName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="200" fill="#f3f4f6"/>
                    <text x="100" y="100" font-family="Arial" font-size="14" fill="#6b7280" text-anchor="middle" dy=".3em">Company Logo</text>
                  </svg>
                `)}`;
              }}
            />
          </div>
        </div>

        {/* Company Name */}
        <h4 className="text-lg font-bold text-gray-800 text-center mb-4 leading-tight">
          {testimonial.companyName}
        </h4>

        {/* Review Text */}
        <div className="flex-grow">
          <p className="text-gray-600 text-sm leading-relaxed text-justify">
            {testimonial.review}
          </p>
        </div>

        {/* Rating */}
        <StarRating rating={testimonial.rating} />
      </div>
    );
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ĐÁNH GIÁ TỪ KHÁCH HÀNG
          </h2>
          <div className="w-24 h-1 bg-red-500 mx-auto"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
            />
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 text-lg">
            Hơn <span className="font-bold text-red-500">1000+</span> khách hàng tin tưởng
          </p>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonials;