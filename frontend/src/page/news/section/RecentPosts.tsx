import { Link } from 'react-router-dom';
import { News } from '../../../types/service';

interface RecentPostsProps {
  posts: News[];
  currentId?: string;
}

const formatDate = (date?: Date) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : '';

/**
 * Sidebar "Bài viết gần đây" — hiển thị các bài khác (loại bài đang xem),
 * mỗi mục gồm thumbnail + tiêu đề + ngày. Sticky khi cuộn trên desktop.
 */
const RecentPosts = ({ posts, currentId }: RecentPostsProps) => {
  const items = posts.filter((p) => p.id !== currentId).slice(0, 5);

  if (items.length === 0) return null;

  return (
    <aside className="lg:sticky lg:top-24" aria-label="Bài viết gần đây">
      <div className="rounded-xl border border-brand-line bg-white p-5 shadow-soft sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-ink">
          <span className="h-5 w-1 rounded-full bg-brand-primary" aria-hidden="true" />
          Bài viết gần đây
        </h2>

        <ul className="mt-5 space-y-4">
          {items.map((post) => (
            <li key={post.id}>
              <Link
                to={`/tin-tuc/${post.id ?? ''}`}
                className="group grid grid-cols-[72px_minmax(0,1fr)] gap-3 rounded-lg p-1.5 transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/25"
              >
                <span className="overflow-hidden rounded-md bg-brand-surface">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-[72px] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-16 w-[72px] items-center justify-center text-xs text-brand-muted">
                      Poip
                    </span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 text-sm font-medium leading-snug text-brand-ink transition-colors group-hover:text-brand-primaryDark">
                    {post.title}
                  </span>
                  {post.createdAt && (
                    <span className="mt-1 block text-xs text-brand-muted">
                      {formatDate(post.createdAt)}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/tin-tuc"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-primaryDark transition-colors hover:text-brand-primary"
        >
          Xem tất cả bài viết
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* CTA tư vấn nhỏ dưới sidebar */}
      <div className="mt-5 rounded-xl border border-brand-line bg-brand-dark p-5 text-white sm:p-6">
        <h3 className="text-base font-semibold">Cần tư vấn pháp lý?</h3>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Đội ngũ Luật Poip Legal sẵn sàng hỗ trợ về sở hữu trí tuệ và pháp lý doanh nghiệp.
        </p>
        <Link
          to="/lien-he"
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryLight"
        >
          Liên hệ ngay
        </Link>
      </div>
    </aside>
  );
};

export default RecentPosts;
