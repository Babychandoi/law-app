import React, {useState } from 'react';
import { User, Calendar, FileText, Sparkles } from 'lucide-react';
interface HeaderProps {
  headerNew?: HeaderNews;
}
interface HeaderNews {
  title?: string;
  subtitle?: string;
  author?: string;
  createdAt?: Date;
  id?: string;
  image?: string;
}
const ArticleHeader: React.FC <HeaderProps> = ({headerNew}) => {
  const [headers] = useState<HeaderNews>(headerNew || {});
  const data: HeaderNews = {
    id : "1",
    title: "",
    subtitle: "",
    author: "",
    createdAt: new Date(),

  };
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden mb-8 transition-all duration-300 hover:shadow-3xl hover:border-yellow-400/30">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
      
      {/* Hero Image Section */}
      {(headers?.image || data.image) && (
        <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
          <img 
            src={headers?.image || data.image} 
            alt={headers?.title || data.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          
          {/* Title overlay on image - ONLY TITLE */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 backdrop-blur-sm">
                <FileText className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight drop-shadow-lg break-words">
                  {headers?.title || data.title}
                </h1>
              </div>
            </div>
          </div>
          
          {/* Decorative sparkles */}
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-yellow-400" />
          </div>
        </div>
      )}

      {/* Subtitle and Metadata section - BELOW IMAGE */}
      {(headers?.image || data.image) && (
        <div className="p-4 md:p-6 lg:p-8">
          {/* Subtitle */}
          {(headers?.subtitle || data.subtitle) && (
            <div className="mb-6">
              <p className="text-base md:text-lg lg:text-xl text-gray-700 leading-relaxed break-words">
                {headers?.subtitle || data.subtitle}
              </p>
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm border-t-2 border-gray-100 pt-4 md:pt-5">
            <div className="flex items-center gap-2 md:gap-3 group">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Tác giả</p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">{headers?.author || data.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3 group">
              <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ngày đăng</p>
                <p className="font-semibold text-gray-900 text-xs md:text-sm">{(headers?.createdAt ? new Date(headers.createdAt).toLocaleDateString('vi-VN') : (data.createdAt ?? new Date()).toLocaleDateString('vi-VN'))}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* No image fallback - keep subtitle with title */}
      {!(headers?.image || data.image) && (
        <>
          <div className="relative p-4 md:p-8">
            {/* Decorative background elements */}
            <div className="absolute top-4 right-4 opacity-5">
              <Sparkles className="w-32 h-32 text-yellow-400" />
            </div>

            <div className="relative z-10">
              <div className="flex items-start gap-3 md:gap-4 mb-6">
                <div className="h-10 w-10 md:h-14 md:w-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <FileText className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight mb-2 break-words overflow-wrap-anywhere">
                    {headers?.title || data.title}
                  </h1>
                  {(headers?.subtitle || data.subtitle) && (
                    <p className="text-sm md:text-lg text-gray-600 leading-relaxed break-words overflow-wrap-anywhere">{headers?.subtitle || data.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Metadata section for no-image case */}
          <div className="p-4 md:p-8 pt-4 md:pt-6">
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm border-t-2 border-gray-100 pt-4 md:pt-5">
              <div className="flex items-center gap-2 md:gap-3 group">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-300">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tác giả</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{headers?.author || data.author}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 group">
                <div className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover:from-green-100 group-hover:to-green-200 transition-all duration-300">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ngày đăng</p>
                  <p className="font-semibold text-gray-900 text-xs md:text-sm">{(headers?.createdAt ? new Date(headers.createdAt).toLocaleDateString('vi-VN') : (data.createdAt ?? new Date()).toLocaleDateString('vi-VN'))}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ArticleHeader;