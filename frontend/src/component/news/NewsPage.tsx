import { AlertCircle } from 'lucide-react';
import { Breadcrumb } from '../layout/Breadcrumb';
import { NewsGrid } from './NewsGrid';
import { useNews } from '../../hooks/useNews';
import { BreadcrumbItem } from '../../types/service';

export const NewsPage = () => {
  const { news, loading, error, handleItemClick } = useNews();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Bản tin', href: '/tin-tuc' },
  ];

  if (error) {
    return (
      <section className="flex min-h-[420px] items-center justify-center bg-brand-surface px-4 py-20">
        <div className="max-w-lg border border-brand-line bg-white p-8 text-center">
          <AlertCircle className="mx-auto text-red-700" size={36} aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-semibold text-gray-950">Chưa thể tải bản tin</h2>
          <p className="mt-2 text-gray-700">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface">
      <Breadcrumb items={breadcrumbItems} />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-gray-950 md:text-4xl">
            Cập nhật pháp lý mới nhất
          </h2>
          <p className="mt-4 text-base leading-7 text-gray-700">
            Thông tin thực tế về sở hữu trí tuệ, giấy phép và pháp lý doanh nghiệp.
          </p>
        </div>
        <NewsGrid items={news} loading={loading} onItemClick={handleItemClick} />
      </section>
    </div>
  );
};
