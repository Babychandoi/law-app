import React from 'react';
import { Play, Sparkles } from 'lucide-react';

const VideoSection: React.FC = () => (
  <section className="py-16 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <Sparkles className="text-yellow-400" size={20} />
          <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
            Giới Thiệu Về Chúng Tôi
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Khám phá dịch vụ và giá trị mà chúng tôi mang lại
        </p>
      </div>

      {/* Video Container */}
      <div className="max-w-5xl mx-auto">
        <div className="relative group">
          {/* Decorative Background */}
          <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Video Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-200 overflow-hidden group-hover:border-yellow-400 transition-all duration-500">
            {/* Video Wrapper */}
            <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/wp3XxhYfQ90"
                title="Poip Law Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              
              {/* Play Icon Overlay (optional decorative element) */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>

            {/* Video Info Bar */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">Video Giới Thiệu</h3>
                    <p className="text-xs text-gray-500">Tìm hiểu về dịch vụ của chúng tôi</p>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-700">Xem ngay</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>

        {/* Features Below Video */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Chuyên Nghiệp</h4>
                <p className="text-xs text-gray-500">Đội ngũ giàu kinh nghiệm</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Nhanh Chóng</h4>
                <p className="text-xs text-gray-500">Xử lý hồ sơ hiệu quả</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800">Uy Tín</h4>
                <p className="text-xs text-gray-500">Được khách hàng tin tưởng</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default VideoSection;
