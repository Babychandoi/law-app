// src/components/news/NewsPage.tsx
import { Banner } from '../layout/Banner';
import { Breadcrumb } from '../layout/Breadcrumb';
import { NewsGrid } from './NewsGrid';
import { useNews } from '../../hooks/useNews';
import { BreadcrumbItem } from '../../types/service';

interface NewsPageProps {
  bannerImage: string;
  bannerAlt: string;
}

export const NewsPage = ({ bannerImage, bannerAlt }: NewsPageProps) => {
  const {
    news,
    loading,
    error,
    handleItemClick
  } = useNews();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' }
  ];


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error loading news</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Banner imageUrl={bannerImage} alt={bannerAlt} />
      <Breadcrumb items={breadcrumbItems} />
      
      <main className="container mx-auto px-4 py-8">
            <NewsGrid 
              items={news} 
              loading={loading}
              onItemClick={handleItemClick}
            />
      </main>
    </div>
  );
};
