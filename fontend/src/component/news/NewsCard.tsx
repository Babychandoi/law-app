// src/components/news/NewsCard.tsx
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { NewsItem } from '../../types';
import { formatDate } from '../../lib/utils';

interface NewsCardProps {
  item: NewsItem;
  onClick?: (item: NewsItem) => void;
}

export const NewsCard = ({ item, onClick }: NewsCardProps) => (
  <Card 
    className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300"
    onClick={() => onClick?.(item)}
  >
    <div className="aspect-video overflow-hidden">
      <img 
        src={item.imageUrl}
        alt={item.imageAlt}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
    
    <CardContent className="p-6">
      <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>
      
      <div className="flex items-center text-sm text-gray-500 mb-3">
        <Calendar className="h-4 w-4 mr-2" />
        {formatDate(item.date)}
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
        {item.excerpt}
      </p>
      
      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
        Read more
        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </CardContent>
  </Card>
);
