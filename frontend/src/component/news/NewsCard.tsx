import { Calendar, ArrowRight, User } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { News } from '../../types/service';

interface NewsCardProps {
  item: News;
  onClick?: (item: News) => void;
}

export const NewsCard = ({ item, onClick }: NewsCardProps) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'Chưa có ngày';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Card 
      className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl border-2 border-gray-200 hover:border-yellow-400 hover:transform hover:scale-[1.02]"
      onClick={() => onClick?.(item)}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
        <img 
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
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
      
      <CardContent className="p-5">
        {/* Title */}
        <h3 className="font-semibold text-base mb-3 line-clamp-2 min-h-[48px] text-gray-800 group-hover:text-yellow-600 transition-colors leading-relaxed">
          {item.title}
        </h3>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[60px]">
          {item.subtitle}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
      </CardContent>
    </Card>
  );
};
