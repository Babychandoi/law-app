import React, { useEffect, useState } from 'react'
import BlogPost from './BlogPost'
import { News } from '../../../types/service';
import { useParams } from 'react-router-dom';
import { getNew } from '../../../service/service';
import { toast } from 'react-toastify';
import { Seo } from '../../../component/Seo';
export default function New() {
  const [news, setNews] = useState<News | null>(null);
  const { id } = useParams<{ id: string }>();
  const decodedId = id;
  useEffect(() => {
    const fetchNews = async () => {
      try {
        if (!decodedId) {
          return;
        }
        const response = await getNew(decodedId);
        if (response && response.data) {
          setNews(response.data);
        } 
      } catch (error) {
        toast.error('Không thể lấy thông tin bản tin');
      }
    };
    fetchNews();
  }, [decodedId]);
  return (
    <>
      {news && (
        <>
          <Seo title={news.title} 
          keywords='Bản tin pháp luật, tin tức pháp luật, sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép, tư vấn pháp luật, Luật Poip, mã số mã vạch, đăng ký nhãn hiệu, đăng ký bản quyền, kiểu dáng công nghiệp'
          description={news.subtitle} />
          <BlogPost 
            news={news}
          />
        </>
      )}
    </>
  )
}
