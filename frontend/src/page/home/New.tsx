import { ArrowRight, Calendar, Loader2, Newspaper } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getNews } from '../../service/service';
import { News } from '../../types/service';

function formatDate(date?: Date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function New() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getNews({ page: 0, size: 8 })
      .then((response) => {
        if (mounted) {
          setNews(response.data || []);
        }
      })
      .catch(() => toast.error('Không thể lấy thông tin bản tin'))
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-goldDark">
              Bản tin pháp lý
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-950 md:text-4xl">
              Cập nhật mới nhất
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/tin-tuc')}
            className="inline-flex items-center gap-2 rounded-md border border-brand-line px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-brand-gold hover:text-brand-goldDark"
          >
            Xem tất cả
            <ArrowRight size={17} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-600">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand-gold" />
            Đang tải bản tin...
          </div>
        ) : news.length === 0 ? (
          <div className="rounded-lg border border-dashed border-brand-line p-10 text-center text-gray-500">
            <Newspaper className="mx-auto mb-3 text-brand-gold" size={34} />
            Chưa có bản tin nào.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {news.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-lg border border-brand-line bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand-gold hover:shadow-soft"
              >
                <button
                  type="button"
                  onClick={() => navigate(`/tin-tuc/${item.id || ''}`)}
                  className="block h-full w-full text-left"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-brand-surface">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-gold">
                        <Newspaper size={34} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {item.createdAt && (
                      <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={14} />
                        {formatDate(item.createdAt)}
                      </div>
                    )}
                    <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-6 text-gray-950 group-hover:text-brand-goldDark">
                      {item.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 min-h-[44px] text-sm leading-6 text-gray-600">
                      {item.subtitle}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark">
                      Đọc tiếp
                      <ArrowRight size={16} />
                    </span>
                  </div>
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
