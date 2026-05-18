import { Loader2, Sparkles } from 'lucide-react';
import { NewsCard } from './NewsCard';
import { News } from '../../types/service';

interface NewsGridProps {
  items: News[];
  loading?: boolean;
  onItemClick?: (item: News) => void;
}

export const NewsGrid = ({ items, loading, onItemClick }: NewsGridProps) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
        <span className="text-gray-600 font-medium">Đang tải bản tin...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg">Chưa có bản tin nào.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            animationDelay: `${index * 0.1}s`
          }}
        >
          <NewsCard 
            item={item} 
            onClick={onItemClick}
          />
        </div>
      ))}
    </div>
  );
};
