// src/hooks/useNews.ts
import { useState, useEffect } from 'react';
import { NewsItem, NewsCategory } from '../types';
import { fetchNews} from '../lib/api';
import { useNavigate } from 'react-router-dom';
export const useNews = () => {
  const [highlightNews, setHighlightNews] = useState<NewsItem[]>([]);
  const [caseStudies, setCaseStudies] = useState<NewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<NewsCategory>('highlight-news');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await fetchNews();
        setHighlightNews(response.data.items.filter(item => item.category === 'highlight-news'));
        setCaseStudies(response.data.items.filter(item => item.category === 'case-studies'));
      } catch (err) {
        setError('Failed to load news');
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleTabChange = (value: NewsCategory) => {
    setActiveTab(value);
  };

  const handleItemClick = (item: NewsItem) => {
    navigate(`/news/${item.id}`)
  };

  return {
    highlightNews,
    caseStudies,
    activeTab,
    loading,
    error,
    handleTabChange,
    handleItemClick
  };
};
