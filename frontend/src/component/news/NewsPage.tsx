import { Sparkles } from 'lucide-react';
import { Breadcrumb } from '../layout/Breadcrumb';
import { NewsGrid } from './NewsGrid';
import { useNews } from '../../hooks/useNews';
import { BreadcrumbItem } from '../../types/service';

export const NewsPage = () => {
  const {
    news,
    loading,
    error,
    handleItemClick
  } = useNews();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Bản tin', href: '/tin-tuc' }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lỗi tải bản tin</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10">
        <Breadcrumb items={breadcrumbItems} />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
              <Sparkles className="text-yellow-400" size={24} />
              <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                Bản Tin Pháp Luật
              </span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Cập nhật tin tức mới nhất về pháp luật và sở hữu trí tuệ
            </p>
          </div>

          <NewsGrid 
            items={news} 
            loading={loading}
            onItemClick={handleItemClick}
          />
        </main>
      </div>
    </div>
  );
};
