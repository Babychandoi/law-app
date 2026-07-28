import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNew, getNews } from '../../../service/service';
import { News } from '../../../types/service';
import { Seo } from '../../../component/Seo';
import { Breadcrumb } from '../../../component/layout/Breadcrumb';
import { BreadcrumbItem } from '../../../types/service';
import ArticleHeader from '../../../component/legalArticle/ArticleHeader';
import BlogPost from './BlogPost';
import RecentPosts from './RecentPosts';

export default function New() {
  const [news, setNews] = useState<News | null>(null);
  const [recent, setRecent] = useState<News[]>([]);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) return;
    const fetchNews = async () => {
      try {
        const response = await getNew(id);
        if (response && response.data) {
          setNews(response.data);
        }
      } catch (error) {
        toast.error('Không thể lấy thông tin bản tin');
      }
    };
    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await getNews({ page: 0, size: 6 });
        if (response && response.data) {
          setRecent(response.data);
        }
      } catch {
        // sidebar không có dữ liệu thì ẩn — không cần báo lỗi
      }
    };
    fetchRecent();
  }, []);

  if (!news) return null;

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Bản tin', href: '/tin-tuc' },
    { name: news.title, href: `/tin-tuc/${news.id ?? ''}` },
  ];

  return (
    <>
      <Seo
        title={news.title}
        keywords="Bản tin pháp luật, tin tức pháp luật, sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép, tư vấn pháp luật, Luật Poip Legal, mã số mã vạch, đăng ký nhãn hiệu, đăng ký bản quyền, kiểu dáng công nghiệp"
        description={news.subtitle}
      />

      <div className="min-h-screen bg-brand-surface">
        <Breadcrumb items={breadcrumbItems} />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          {/* Hero full-width: ảnh + tiêu đề + mô tả + meta */}
          <ArticleHeader
            headerNew={{
              title: news.title,
              createdAt: news.createdAt,
              subtitle: news.subtitle,
              author: news.author,
              id: news.id,
              image: news.image,
            }}
          />

          {/* Bên dưới hero: nội dung (trái) + sidebar (phải) */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0">
              <BlogPost news={news} />
            </main>

            <RecentPosts posts={recent} currentId={news.id} />
          </div>
        </div>
      </div>
    </>
  );
}
