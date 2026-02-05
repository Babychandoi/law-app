import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
interface SlideData {
  id: string;
  title: string;
  description: string;
  backgroundImage: string;
  buttonText: string;
  buttonAction: () => void;
}

const Slider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const slides: SlideData[] = [
    {
      id: 'slide-1',
      title: 'DỊCH VỤ SỞ HỮU TRÍ TUỆ - POIP LAW',
      description: `Công ty TNHH Sở hữu trí tuệ Poip là tổ chức Đại Diện Sở
Hữu Công Nghiệp uy tín tại Việt Nam, có đầy đủ năng lực
tư vấn và thực thi xác lập quyền Sở Hữu Công Nghiệp cho
khách hàng trong và ngoài nước.`,
      backgroundImage: '/assets/images/slide.webp',
      buttonText: 'Đăng ký tư vấn miễn phí',
      buttonAction: () => {
        // Scroll to consultation form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.scrollIntoView({ behavior: 'smooth' });
        }
      }
    },
    {
      id: 'slide-2',
      title: 'BẢO HỘ NHÃN HIỆU THƯƠNG HIỆU',
      description: `Dịch vụ đăng ký bảo hộ nhãn hiệu thương hiệu chuyên nghiệp
với đội ngũ luật sư giàu kinh nghiệm. Cam kết thời gian nhanh chóng
và tỷ lệ thành công cao cho mọi khách hàng.`,
      backgroundImage: '/assets/images/slide.webp',
      buttonText: 'Tìm hiểu thêm',
      buttonAction: () => {
        handleNavigate("/dang-ky-bao-ho-nhan-hieu",);
      }
    },
    {
      id: 'slide-3',
      title: 'TƯ VẤN PHÁP LÝ CHUYÊN NGHIỆP',
      description: `Với hơn 10 năm kinh nghiệm trong lĩnh vực sở hữu trí tuệ,
chúng tôi cam kết mang đến dịch vụ tư vấn pháp lý tốt nhất
cho doanh nghiệp và cá nhân.`,
      backgroundImage: '/assets/images/slide.webp',
      buttonText: 'Liên hệ ngay',
      buttonAction: () => {
        window.location.href = '/lien-he';
      }
    }
  ];

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Loading effect
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(loadingTimer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };
  const handleNavigate = (href: string) => {
    navigate(`${href}`);
  }
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-white flex items-center justify-center">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {/* Slider Container */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative"
            style={{
              backgroundImage: `url(${slide.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-4xl">
                  {/* Title */}
                  <h1 
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-400 mb-6 leading-tight transition-all duration-1000 ${
                      index === currentSlide 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 transform translate-y-8'
                    }`}
                    style={{ 
                      fontFamily: 'Roboto Slab, serif',
                      transitionDelay: index === currentSlide ? '0.3s' : '0s'
                    }}
                  >
                    {slide.title}
                  </h1>
                  
                  {/* Description */}
                  <div 
                    className={`text-white text-base md:text-lg leading-relaxed mb-8 max-w-2xl transition-all duration-1000 ${
                      index === currentSlide 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 transform translate-y-8'
                    }`}
                    style={{ 
                      fontFamily: 'Roboto Slab, serif',
                      transitionDelay: index === currentSlide ? '0.6s' : '0s'
                    }}
                  >
                    {slide.description.split('\n').map((line, lineIndex) => (
                      <span key={lineIndex}>
                        {line}
                        {lineIndex < slide.description.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                  
                  {/* Button */}
                  <button
                    onClick={slide.buttonAction}
                    className={`inline-flex items-center px-8 py-4 border border-yellow-400 text-yellow-400 font-bold text-base hover:bg-yellow-400 hover:text-white transition-all duration-300 group ${
                      index === currentSlide 
                        ? 'opacity-100 transform translate-y-0' 
                        : 'opacity-0 transform translate-y-8'
                    }`}
                    style={{ 
                      fontFamily: 'Roboto Slab, serif',
                      transitionDelay: index === currentSlide ? '0.9s' : '0s'
                    }}
                  >
                    {slide.buttonText}
                    <ArrowRight 
                      size={16} 
                      className="ml-4 group-hover:translate-x-1 transition-transform duration-300" 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-all duration-300"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-all duration-300"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-yellow-400 scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20 z-20">
        <div 
          className="h-full bg-yellow-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default Slider;