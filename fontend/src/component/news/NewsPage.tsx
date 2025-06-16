// src/components/news/NewsPage.tsx
import { Banner } from '../layout/Banner';
import { Breadcrumb } from '../layout/Breadcrumb';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { NewsGrid } from './NewsGrid';
import { useNews } from '../../hooks/useNews';
import { BreadcrumbItem, NewsCategory } from '../../types';

interface NewsPageProps {
  bannerImage: string;
  bannerAlt: string;
}

export const NewsPage = ({ bannerImage, bannerAlt }: NewsPageProps) => {
  const {
    highlightNews,
    caseStudies,
    activeTab,
    loading,
    error,
    handleTabChange,
    handleItemClick
  } = useNews();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Home', href: '/' },
    { name: 'News', href: '/news' }
  ];

  const tabs: { value: NewsCategory; label: string }[] = [
    { value: 'highlight-news', label: 'Highlight News' },
    { value: 'case-studies', label: 'Case Studies' }
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
        <Tabs value={activeTab as string} onValueChange={(value) => handleTabChange(value as NewsCategory)}>
          <div className="flex justify-center mb-8">
            <TabsList>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  isActive={activeTab === tab.value}
                  onClick={() => handleTabChange(tab.value)}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="highlight-news" isActive={activeTab === 'highlight-news'}>
            <NewsGrid 
              items={highlightNews} 
              loading={loading}
              onItemClick={handleItemClick}
            />
          </TabsContent>

          <TabsContent value="case-studies" isActive={activeTab === 'case-studies'}>
            <NewsGrid 
              items={caseStudies} 
              loading={loading}
              onItemClick={handleItemClick}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
