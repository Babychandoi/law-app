import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../../service/service';
import { News } from '../../types/service';
import { ChevronLeft, ChevronRight, Loader2, User, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'react-toastify';

export default function New() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await getNews();
        if (response && response.data) {
          setNews(response.data);
        }
      } catch (error) {
        toast.error('Không thể lấy thông tin bản tin');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleItemClick = (id: string) => {
    navigate(`tin-tuc/${id}`);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, news.length - 4);
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : maxIndex));
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
          <span className="text-gray-600 font-medium">Đang tải bản tin...</span>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">Chưa có bản tin nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-16 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
              <Sparkles className="text-yellow-400" size={20} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                Bản Tin Mới Nhất
              </span>
            </h2>
          </div>
          
          {/* Navigation Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white group"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-colors" />
            </button>
            <button 
              onClick={handleNext}
              disabled={currentIndex >= news.length - 4}
              className="w-12 h-12 rounded-xl bg-white border-2 border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:bg-yellow-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white group"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-yellow-600 transition-colors" />
            </button>
          </div>
        </div>

        {/* News Grid */}
        <div className="overflow-hidden">
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-transform duration-500"
            style={{ transform: `translateX(-${currentIndex * 25}%)` }}
          >
            {news.map((item, index) => (
              <div 
                key={item.id} 
                className="group cursor-pointer"
                onClick={() => handleItemClick(item.id ?? '')}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="bg-white rounded-2xl shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-2xl hover:border-yellow-400 transition-all duration-500 hover:transform hover:scale-[1.02]">
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                    />
                    {/* Date Badge */}
                    {item.createdAt && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg z-20">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-yellow-600" />
                          <span className="text-xs font-semibold text-gray-700">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Title */}
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 leading-relaxed group-hover:text-yellow-600 transition-colors line-clamp-2 min-h-[40px]">
                      {item.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[32px]">
                      {item.subtitle}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.author}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-yellow-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <span className="text-xs font-semibold">Xem</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Navigation Dots */}
        <div className="flex md:hidden justify-center gap-2 mt-6">
          {Array.from({ length: Math.ceil(news.length / 4) }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index 
                  ? 'w-8 h-3 bg-gradient-to-r from-yellow-400 to-orange-400' 
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
