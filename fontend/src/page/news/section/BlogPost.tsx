import React, { useEffect, useState } from 'react';
import { 
    AlertTriangle,
  Award,
  BookOpen,
  FileText,
  Globe,
  Shield
} from 'lucide-react';
import ArticleHeader from '../../../component/legalArticle/ArticleHeader';
import TableOfContents from '../../../component/legalArticle/TableOfContents';
import LegalSection from '../../../component/legalArticle/Section';
import { getNew } from '../../../service/service';
import { News } from '../../../types/service';
import { useLocation } from 'react-router-dom';

const LegalArticle: React.FC = () => {
  const [expandedSections] = useState<string[]>(['intro']);
  const [news, setNews] = useState<News | null>(null);
  const location = useLocation();
  const id = location.state?.id;
  console.log(id);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (!id) {
          return;
        }
        const response = await getNew(id);
        console.log(response.data)
        if (response && response.data) {
          setNews(response.data);
        } else {
          console.error("No data found in response");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };
    fetchNews();
  }, [id]);
  const toggleSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const renderIcon = (icon: string) => {
    switch (icon) {
      case 'BOOKOPEN': return <BookOpen className="w-5 h-5" />;
      case 'FILETEXT': return <FileText className="w-5 h-5" />;
      case 'SHIELD': return <Shield className="w-5 h-5" />;
      case 'GLOBE': return <Globe className="w-5 h-5" />;
      case 'AWARD': return <Award className="w-5 h-5" />;
      case 'ALERTTRIANGLE': return <AlertTriangle className="w-5 h-5" />;
      default: return null;
    }
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {news && (
        <ArticleHeader
          headerNew={{
            title: news?.title,
            createdAt: news?.createdAt,
            subtitle: news?.subtitle,
            author: news?.author,
            id: news?.id
          }}
        />
      )}
              
        <TableOfContents 
          sections={news?.sections
            ?.filter((section) => section.id !== undefined)
            .map(({ id, title, icon }) => ({ id: id as string, title, icon: renderIcon(icon) })) || []}
          onItemClick={toggleSection}
        />

        <div className="space-y-6">
          {news?.sections?.map((section) => (
            <LegalSection
              key={section.id}
              id={section.id!}
              title={section.title}
              content={section.content}
              icon={renderIcon(section.icon)}
              isExpanded={expandedSections.includes(section.id!)}
              onToggle={toggleSection}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default LegalArticle;