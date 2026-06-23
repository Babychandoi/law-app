import { ArrowRight, Calendar, User } from 'lucide-react';
import { News } from '../../types/service';

interface NewsCardProps {
  item: News;
  onClick?: (item: News) => void;
}

export const NewsCard = ({ item, onClick }: NewsCardProps) => {
  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Chưa có ngày';

  return (
    <article className="h-full overflow-hidden rounded-lg border border-brand-line bg-white shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-brand-gold hover:shadow-soft">
      <button
        type="button"
        onClick={() => onClick?.(item)}
        className="group flex h-full w-full flex-col text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
        aria-label={`Xem bản tin: ${item.title}`}
      >
        <img
          src={item.image}
          alt=""
          width={384}
          height={216}
          className="aspect-video w-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-brand-muted">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-goldDark" aria-hidden="true" />
              {formattedDate}
            </span>
            {item.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-goldDark" aria-hidden="true" />
                {item.author}
              </span>
            )}
          </div>
          <h3 className="mt-4 line-clamp-2 text-lg font-semibold leading-7 text-brand-ink group-hover:text-brand-goldDark">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-brand-muted">{item.subtitle}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark">
            Đọc bản tin
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </button>
    </article>
  );
};
