// src/hooks/useNews.ts
import { useState, useEffect } from 'react';
import { getNews } from '../service/service';
import { useNavigate } from 'react-router-dom';
import { News } from '../types/service';
export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      try {
        const response = await getNews();
        if (response && response.data) {
          setNews(response.data);
        } else {
          console.error("No data found in response");
        }
      } catch (err) {
        setError('Failed to load news');  
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const handleItemClick = (item: News) => {
    navigate("/new",{state:{id : item.id}})
  };

  return {
    news,
    loading,
    error,
    handleItemClick
  };
};
