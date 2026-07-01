import { Calendar, User } from 'lucide-react';

interface HeaderProps {
  headerNew?: HeaderNews;
}

interface HeaderNews {
  title?: string;
  subtitle?: string;
  author?: string;
  createdAt?: Date;
  id?: string;
  image?: string;
}

const ArticleHeader = ({ headerNew = {} }: HeaderProps) => {
  const formattedDate = headerNew.createdAt
    ? new Date(headerNew.createdAt).toLocaleDateString('vi-VN')
    : 'Chưa cập nhật';

  return (
    <header className="overflow-hidden rounded-lg border border-brand-line bg-white shadow-sm">
      {headerNew.image && (
        <img
          src={headerNew.image}
          alt=""
          className="max-h-[28rem] w-full object-cover"
          decoding="async"
        />
      )}
      <div className="p-6 sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primaryDark">
          Bản tin pháp lý
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink md:text-4xl">
          {headerNew.title}
        </h1>
        {headerNew.subtitle && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-brand-muted">
            {headerNew.subtitle}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-5 border-t border-brand-line pt-5 text-sm text-brand-muted">
          {headerNew.author && (
            <span className="inline-flex items-center gap-2">
              <User className="h-4 w-4 text-brand-primaryDark" aria-hidden="true" />
              {headerNew.author}
            </span>
          )}
          <span className="inline-flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-primaryDark" aria-hidden="true" />
            {formattedDate}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;
