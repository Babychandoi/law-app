import React from 'react';
import { ChevronLeft, ChevronRight, User, FileText, Scale, Shield, BookOpen } from 'lucide-react';

const UsefulInfoComponent = () => {
  const infoItems = [
    {
      id: 1,
      title: "Tiêu chí đánh giá khả năng bảo hộ của một nhãn hiệu theo pháp luật Việt Nam",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2025/03/DALL·E-2025-03-12-09.27.55-An-illustration-depicting-the-importance-of-trademark-registration-for-businesses.-The-image-features-a-business-owner-securing-a-trademark-certificat.webp?resize=960%2C720&ssl=1",
      category: "Đọc thêm",
      icon: Scale,
      bgColor: "from-green-100 to-green-200",
      iconColor: "bg-green-500"
    },
    {
      id: 2,
      title: "Tại Sao Doanh Nghiệp Nên Đăng Ký Bảo Hộ Nhãn Hiệu Sớm",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2025/03/DALL·E-2025-03-12-09.27.55-An-illustration-depicting-the-importance-of-trademark-registration-for-businesses.-The-image-features-a-business-owner-securing-a-trademark-certificat.webp?resize=960%2C720&ssl=1",
      category: "Đọc thêm",
      icon: Shield,
      bgColor: "from-blue-100 to-blue-200",
      iconColor: "bg-blue-500"
    },
    {
      id: 3,
      title: "Những Sai Lầm Khi Đăng Ký Nhãn Hiệu Và Cách Khắc Phục",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2025/03/DALL·E-2025-03-12-09.27.55-An-illustration-depicting-the-importance-of-trademark-registration-for-businesses.-The-image-features-a-business-owner-securing-a-trademark-certificat.webp?resize=960%2C720&ssl=1",
      category: "Đọc thêm",
      icon: FileText,
      bgColor: "from-red-100 to-red-200",
      iconColor: "bg-red-500"
    },
    {
      id: 4,
      title: "Những Bài Học Đắt Giá Từ Các Vụ Kiện Sở Hữu Trí Tuệ Đình Đám",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2025/03/DALL·E-2025-03-12-09.27.55-An-illustration-depicting-the-importance-of-trademark-registration-for-businesses.-The-image-features-a-business-owner-securing-a-trademark-certificat.webp?resize=960%2C720&ssl=1",
      category: "Đọc thêm",
      icon: BookOpen,
      bgColor: "from-purple-100 to-purple-200",
      iconColor: "bg-purple-500"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">THÔNG TIN HỮU ÍCH</h2>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {infoItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              {/* Image */}
              <div className={`h-48 bg-gradient-to-br ${item.bgColor} relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-16 h-16 ${item.iconColor} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-70" />
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3 leading-relaxed hover:text-blue-600 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UsefulInfoComponent;