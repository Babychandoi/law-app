import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PartnersCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const containerRef = useRef(null);

  const clients = [
    {
      id: 1,
      title: "CÔNG TY CỔ PHẦN TẬP ĐOÀN NHỰA ĐÔNG Á",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/279eeb7cbc2c17724e3d.jpg?fit=150%2C60&ssl=1",
      shortName: "ĐÔNG Á"
    },
    {
      id: 2,
      title: "COREXYL",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201916126.jpg?fit=150%2C50&ssl=1",
      shortName: "COREXYL"
    },
    {
      id: 3,
      title: "CÔNG TY TNHH SẢN XUẤT VÀ THƯƠNG MẠI NHỰA KINH BẮC",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/d76cc5ce939e38c0618f.jpg?fit=150%2C75&ssl=1",
      shortName: "KINH BẮC"
    },
    {
      id: 4,
      title: "Sùng Bầu",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2025/02/de5d5ffa-1cb7-4d49-840d-c4300a8400c2.jpeg?fit=150%2C44&ssl=1",
      shortName: "SÙNG BẦU"
    },
    {
      id: 5,
      title: "Luật Kiến Hưng",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4202221859.jpg?fit=77%2C75&ssl=1",
      shortName: "KIẾN HƯNG"
    },
    {
      id: 6,
      title: "CÔNG TY TNHH DƯỢC PHẨM BV PHARMA",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/a84f53f207a2acfcf5b3.jpg?fit=150%2C50&ssl=1",
      shortName: "BV PHARMA"
    },
    {
      id: 7,
      title: "CÔNG TY CỔ PHẦN CHĂN NUÔI CP VIỆT NAM",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/390b802bd87b73252a6a-1.jpg?fit=150%2C70&ssl=1",
      shortName: "CP VIỆT NAM"
    },
    {
      id: 8,
      title: "HANG PHAN",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201711726.jpg?fit=66%2C75&ssl=1",
      shortName: "HANG PHAN"
    },
    {
      id: 9,
      title: "PIPPER",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201635411.jpg?fit=150%2C32&ssl=1",
      shortName: "PIPPER"
    },
    {
      id: 10,
      title: "UNISKIN",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201916125.jpg?fit=150%2C30&ssl=1",
      shortName: "UNISKIN"
    },
    {
      id: 11,
      title: "Huy Tuấn Food",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201637077.jpg?fit=77%2C75&ssl=1",
      shortName: "HUY TUẤN"
    },
    {
      id: 12,
      title: "CÔNG TY CỔ PHẦN TẬP ĐOÀN PHÚC TRƯỜNG SINH",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/cbee13e347b3ecedb5a2.jpg?fit=75%2C75&ssl=1",
      shortName: "PHÚC TRƯỜNG SINH"
    },
    {
      id: 13,
      title: "CÔNG TY TNHH LOTTE VINA INTERNATIONAL",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/1c30c09f-ddcb-49fc-9143-1712de29c242.jpeg?fit=75%2C75&ssl=1",
      shortName: "LOTTE VINA"
    },
    {
      id: 14,
      title: "Ánh Dương",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2023/07/LOGO_VN4201742231.jpg?fit=100%2C75&ssl=1",
      shortName: "ÁNH DƯƠNG"
    },
    {
      id: 15,
      title: "CÔNG TY CỔ PHẦN XUẤT NHẬP KHẨU RAU QUẢ I",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/68973fda668acdd4949b.jpg?fit=80%2C75&ssl=1",
      shortName: "RAU QUẢ I"
    },
    {
      id: 16,
      title: "CÔNG TY CỔ PHẦN TẬP ĐOÀN ASC VIỆT NAM",
      image: "https://i0.wp.com/luattaga.vn/wp-content/uploads/2024/01/46640f245874f32aaa65.jpg?fit=135%2C75&ssl=1",
      shortName: "ASC VIỆT NAM"
    }
  ];

  // Responsive settings
  const getVisibleSlides = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 480) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    return 6;
  };

  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides());

  useEffect(() => {
    const handleResize = () => {
      setVisibleSlides(getVisibleSlides());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % clients.length);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlay, clients.length]);

  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % clients.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + clients.length) % clients.length);
  };

  const handleMouseEnter = () => {
    setIsAutoPlay(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlay(true);
  };

  const fallbackImage = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="75" xmlns="http://www.w3.org/2000/svg">
        <rect width="150" height="75" fill="#f3f4f6" stroke="#e5e7eb"/>
        <text x="75" y="40" font-family="Arial" font-size="12" fill="#6b7280" text-anchor="middle">Logo</text>
      </svg>
    `)}`;
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ĐỐI TÁC & KHÁCH HÀNG
            </h2>
            <div className="w-20 h-1 bg-blue-600"></div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-3">
            <button
              onClick={prevSlide}
              className="group p-3 rounded-full bg-gray-100 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
            <button
              onClick={nextSlide}
              className="group p-3 rounded-full bg-gray-100 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          ref={containerRef}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentIndex * 100) / visibleSlides}%)`,
              width: `${(clients.length * 100) / visibleSlides}%`
            }}
          >
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex-shrink-0 px-4"
                style={{ width: `${100 / clients.length}%` }}
              >
                <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 p-6 h-32 flex items-center justify-center">
                  {/* Client Logo */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={client.image}
                      alt={client.title}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      onError={fallbackImage}
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300"></div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                    {client.shortName}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(clients.length / visibleSlides) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * visibleSlides)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / visibleSlides) === index
                  ? 'bg-blue-600 scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide group ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-lg text-gray-600">
            <span>Được tin tưởng bởi</span>
            <span className="font-bold text-blue-600 text-xl">{clients.length}+</span>
            <span>đối tác & khách hàng</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;