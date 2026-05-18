import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react'
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

  // Ripple effect handler
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

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
        handleNavigate("/dang-ky-bao-ho-nhan-hieu");
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(loadingTimer);
  }, []);

  const handleNavigate = (href: string) => {
    navigate(`${href}`);
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="flex space-x-3">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 z-30"></div>

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
            {/* Enhanced Overlay with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"></div>
            
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-4xl">
                  {/* Decorative Element */}
                  <div className={`flex items-center gap-2 mb-4 transition-all duration-1000 ${
                    index === currentSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                  }`}
                  style={{ transitionDelay: index === currentSlide ? '0.2s' : '0s' }}>
                    <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                    <Sparkles className="text-yellow-400" size={20} />
                  </div>

                  {/* Title */}
                  <h1 
                    className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-all duration-1000 ${
                      index === currentSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                    }`}
                    style={{ 
                      fontFamily: 'Roboto Slab, serif',
                      transitionDelay: index === currentSlide ? '0.3s' : '0s'
                    }}
                  >
                    <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                      {slide.title}
                    </span>
                  </h1>

                  {/* Description */}
                  <div 
                    className={`text-gray-300 text-base md:text-lg leading-relaxed mb-8 max-w-2xl transition-all duration-1000 ${
                      index === currentSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
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
                    onClick={(e) => {
                      createRipple(e);
                      setTimeout(() => slide.buttonAction(), 300);
                    }}
                    className={`relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-base rounded-xl overflow-hidden group transition-all duration-1000 hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105 ${
                      index === currentSlide ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
                    }`}
                    style={{ 
                      fontFamily: 'Roboto Slab, serif',
                      transitionDelay: index === currentSlide ? '0.9s' : '0s'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">{slide.buttonText}</span>
                    <ArrowRight size={20} className="ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm px-6 py-3 rounded-full border border-gray-600">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide 
                ? 'w-8 h-3 bg-gradient-to-r from-yellow-400 to-orange-400' 
                : 'w-3 h-3 bg-gray-500 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800/50 z-20">
        <div 
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 transition-all duration-300"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent z-20"></div>

      {/* Custom Animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        
        /* Ripple Effect */
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.6);
          transform: scale(0);
          animation: ripple-animation 0.6s ease-out;
          pointer-events: none;
        }
        
        @keyframes ripple-animation {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Slider;
