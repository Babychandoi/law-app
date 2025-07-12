// src/components/news/NewsGrid.tsx
import { Loader2 } from 'lucide-react';
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading news...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No news items found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <NewsCard 
          key={item.id} 
          item={item} 
          onClick={onItemClick}
        />
      ))}
    </div>
  );
};
