import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNews } from '../../service/service';
import { News } from '../../types/service';
import { ChevronLeft, ChevronRight, Loader2, User} from 'lucide-react';

export default function New() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await getNews();
        if (response && response.data) {
          setNews(response.data);
        } else {
          console.error("No data found in response");
        }
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const handleItemClick = (item: News) => {
    navigate(`/news/${item.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading news...</span>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No news items found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800">BẢN TIN</h2>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {news.map((item) => {
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              {/* Image */}
              <div className={`h-48 bg-gradient-to-br from-blue-100 to-blue-200 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                </div>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover opacity-70" />
              </div>
              {/* Content */}
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3 leading-relaxed hover:text-blue-600 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {item.subtitle}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}