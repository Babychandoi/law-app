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
      <div className="flex flex-col items-center justify-center py-20" role="status">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-primaryDark" aria-hidden="true" />
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
      {items.map((item) => (
        <div key={item.id}>
          <NewsCard item={item} onClick={onItemClick} />
        </div>
      ))}
    </div>
  );
};
