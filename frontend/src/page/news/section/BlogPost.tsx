import React from 'react';
import ArticleHeader from '../../../component/legalArticle/ArticleHeader';
import { News } from '../../../types/service';

interface BlogPostProps {
  news: News;
}

const BlogPost: React.FC<BlogPostProps> = ({ news }) => {
  
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

        {/* Full Content Display */}
        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 lg:p-12">
              {/* Rich Text Content */}
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:text-gray-900
                  prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                  prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
                  prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-a:text-orange-500 prose-a:no-underline hover:prose-a:text-orange-600 hover:prose-a:underline
                  prose-strong:text-gray-900 prose-strong:font-semibold
                  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                  prose-li:text-gray-700 prose-li:mb-2
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:my-6
                  prose-blockquote:border-l-4 prose-blockquote:border-orange-400 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                  prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                "
                dangerouslySetInnerHTML={{ __html: news?.fullContent || '' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
