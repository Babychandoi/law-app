import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PreviousPartner } from '../../types/service';
import { getPreviousPartner } from '../../service/service';
import { toast } from 'react-toastify';
const PartnersCarousel = () => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
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

  const nextSlide = () => {
    if (totalGroups <= 1) return;
    setCurrentGroupIndex((prev) => (prev + 1) % totalGroups);
  };

  const prevSlide = () => {
    if (totalGroups <= 1) return;
    setCurrentGroupIndex((prev) => (prev - 1 + totalGroups) % totalGroups);
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
    <section className="bg-white py-14 sm:py-16" aria-labelledby="partners-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 id="partners-title" className="text-3xl font-semibold text-brand-ink">
              Đối tác & khách hàng
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={prevSlide}
              disabled={totalGroups <= 1}
              className="group rounded-md border border-brand-line bg-white p-3 transition-colors duration-200 hover:border-brand-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              aria-label="Xem nhóm đối tác trước"
            >
              <ChevronLeft className="h-5 w-5 text-brand-goldDark" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              disabled={totalGroups <= 1}
              className="group rounded-md border border-brand-line bg-white p-3 transition-colors duration-200 hover:border-brand-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              aria-label="Xem nhóm đối tác tiếp theo"
            >
              <ChevronRight className="h-5 w-5 text-brand-goldDark" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative overflow-hidden" aria-live="polite">
          <div
            className="flex transition-transform duration-200 ease-in-out"
            style={{
              transform: `translateX(-${currentGroupIndex * 100}%)`,
              width: `${(clients.length * 100) / visibleSlides}%`,
            }}
          >
            {clients.map((client) => (
              <div
                key={client.id}
                className="flex-shrink-0 px-4"
                style={{ width: `${100 / visibleSlides}%` }}
              >
                <div className="group relative flex h-32 items-center justify-center rounded-lg border border-brand-line bg-white p-6">
                  {/* Client Logo */}
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={client.image}
                      alt={client.title}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      loading="lazy"
                      decoding="async"
                      onError={fallbackImage}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-brand-goldDark bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300"></div>
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
              type="button"
              key={index}
              onClick={() => setCurrentGroupIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentGroupIndex === index
                  ? 'bg-brand-goldDark scale-110'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Xem nhóm đối tác ${index + 1}`}
              aria-current={currentGroupIndex === index ? 'true' : undefined}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-lg text-gray-600">
            <span>Được tin tưởng bởi</span>
            <span className="font-bold text-brand-goldDark text-xl">{clients.length}+</span>
            <span>đối tác & khách hàng</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
