import React from 'react';
import { 
  Laptop, 
  Book, 
  Newspaper, 
  Music, 
  Lightbulb, 
  Camera, 
  Home, 
  Map, 
  AlignJustify,
  TrendingUp
} from 'lucide-react';

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
}

const CopyrightServices: React.FC = () => {
  const services: ServiceItem[] = [
    {
      icon: <Laptop className="w-6 h-6" />,
      title: "Chương trình máy tính"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Tác phẩm tạo hình, mỹ thuật ứng dụng"
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: "Bài giảng, bài phát biểu và bài nói khác"
    },
    {
      icon: <Newspaper className="w-6 h-6" />,
      title: "Tác phẩm báo chí"
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: "Tác phẩm âm nhạc"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Tác phẩm sân khấu"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Tác phẩm điện ảnh"
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Tác phẩm nhiếp ảnh"
    },
    {
      icon: <Home className="w-6 h-6" />,
      title: "Tác phẩm kiến trúc"
    },
    {
      icon: <Map className="w-6 h-6" />,
      title: "Bản họa đồ, sơ đồ, bản đồ"
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Tác phẩm văn học, nghệ thuật dân gian"
    },
    {
      icon: <AlignJustify className="w-6 h-6" />,
      title: "Các loại hình khác"
    }
  ];

  return (
    <div className="bg-gray-50 py-16">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-4 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            LUẬT TAGA CUNG CẤP DỊCH VỤ ĐĂNG KÝ BẢO HỘ BẢN QUYỀN TÁC GIẢ VỚI CÁC LOẠI HÌNH SAU
          </h2>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 text-blue-600">
                  {service.icon}
                </div>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {service.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CopyrightServices;