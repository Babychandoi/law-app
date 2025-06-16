import React from 'react';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';

const QAComponent = () => {
  const qaItems = [
    {
      id: 1,
      question: "Có Nên Đăng Ký Nhãn Hiệu Quốc Tế Ngay Khi Kinh Doanh Trong Nước?",
      image: "/api/placeholder/300/200",
      category: "Đọc thêm"
    },
    {
      id: 2,
      question: "Đăng ký mã số mã vạch có bắt buộc không?",
      image: "/api/placeholder/300/200",
      category: "Đọc thêm"
    },
    {
      id: 3,
      question: "Tranh chấp nhãn hiệu là gì?",
      image: "/api/placeholder/300/200",
      category: "Đọc thêm"
    },
    {
      id: 4,
      question: "Cần Làm Gì Khi Nhận Hiệu Đã Đăng Ký Bảo Hộ Bị Trùng Với Tên Doanh Nghiệp Khác?",
      image: "/api/placeholder/300/200",
      category: "Đọc thêm"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">HỎI ĐÁP</h2>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Q&A Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {qaItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-4 left-4 w-8 h-8 bg-red-400 rounded-full opacity-70"></div>
              <div className="absolute top-8 right-6 w-6 h-6 bg-yellow-400 rounded-full opacity-60"></div>
              <div className="absolute bottom-6 left-6 w-4 h-4 bg-green-400 rounded-full opacity-80"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-white rounded-full opacity-50"></div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3 leading-relaxed hover:text-blue-600 transition-colors cursor-pointer">
                {item.question}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {item.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAComponent;