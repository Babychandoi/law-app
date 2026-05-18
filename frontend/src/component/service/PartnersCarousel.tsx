import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PreviousPartner } from '../../types/service';
import { getPreviousPartner } from '../../service/service';
import { toast } from 'react-toastify';
const PartnersCarousel = () => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef(null);
  const [clients, setClients] = useState<PreviousPartner[]>([]);
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getPreviousPartner();
        if (response.data) {
          setClients(response.data);
        }
      } catch (error) {
        toast.error('Không thể tải danh sách đối tác & khách hàng');
      }
    };

    fetchClients();
  }, []);

  // Responsive settings
  const getVisibleSlides = () => {
    if (typeof window === 'undefined') return 6;
    if (window.innerWidth < 480) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    return 6;
  };

  const [visibleSlides, setVisibleSlides] = useState(getVisibleSlides());
  const totalGroups = Math.ceil(clients.length / visibleSlides);

  useEffect(() => {
    const handleResize = () => {
      setVisibleSlides(getVisibleSlides());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && clients.length > 0) {
      intervalRef.current = window.setInterval(() => {
        setCurrentGroupIndex(prev => (prev + 1) % totalGroups);
      }, 3000);
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isAutoPlay, clients.length, visibleSlides, totalGroups]);


  const nextSlide = () => {
    setCurrentGroupIndex(prev => (prev + 1) % totalGroups);
  };

  const prevSlide = () => {
    setCurrentGroupIndex(prev => (prev - 1 + totalGroups) % totalGroups);
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
    <section className={`py-${clients.length} bg-white`}>
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
              transform: `translateX(-${currentGroupIndex * 100}%)`,
              width: `${(clients.length * 100) / visibleSlides}%`
            }}

          >
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex-shrink-0 px-4"
                style={{ width: `${100 / visibleSlides}%` }}
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
          {Array.from({ length: totalGroups }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentGroupIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${currentGroupIndex === index
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