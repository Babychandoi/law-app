// src/hooks/useNews.ts
import { useState, useEffect } from 'react';
import { getNews } from '../service/service';
import { useNavigate } from 'react-router-dom';
import { News } from '../types/service';
import { toast } from 'react-toastify';
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
          toast.error( 'Không có dữ liệu tin tức nào được trả về!');
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
    navigate(`/tin-tuc/${item.id || ''}`)
  };

  return {
    news,
    loading,
    error,
    handleItemClick
  };
};
