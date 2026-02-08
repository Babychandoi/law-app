import React from 'react';
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
import { News } from '../../../types/service';

interface BlogPostProps {
  news: News;
}

const BlogPost: React.FC<BlogPostProps> = ({ news }) => {
  
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12 relative z-10">
        {news && (
          <ArticleHeader
            headerNew={{
              title: news?.title,
              createdAt: news?.createdAt,
              subtitle: news?.subtitle,
              author: news?.author,
              id: news?.id,
              image: news?.image
            }}
          />
        )}
              
        <TableOfContents 
          sections={news?.sections
            ?.filter((section) => section.id !== undefined)
            .map(({ id, title, icon }) => ({ id: id as string, title, icon: renderIcon(icon) })) || []}
          onItemClick={(id) => {
            const element = document.getElementById(id);
            if (element) {
              const yOffset = -100; // Offset để không bị che title
              const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
        />

        <div className="space-y-6">
          {news?.sections?.map((section, index) => (
            <div
              key={section.id}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <LegalSection
                id={section.id!}
                title={section.title}
                content={section.content}
                icon={renderIcon(section.icon)}
                isExpanded={true}
                onToggle={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
