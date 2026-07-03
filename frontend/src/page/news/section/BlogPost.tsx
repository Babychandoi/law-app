import { News } from '../../../types/service';

interface BlogPostProps {
  news: News;
}

const BlogPost = ({ news }: BlogPostProps) => (
  <article className="rounded-xl border border-brand-line bg-white p-6 shadow-sm sm:p-8 lg:p-10">
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-semibold prose-headings:text-brand-ink
        prose-p:leading-8 prose-p:text-brand-muted
        prose-a:text-brand-primaryDark prose-a:underline-offset-4
        prose-strong:text-brand-ink
        prose-li:text-brand-muted
        prose-img:rounded-lg
        prose-blockquote:rounded-md prose-blockquote:border prose-blockquote:border-brand-line prose-blockquote:bg-brand-surface prose-blockquote:p-5 prose-blockquote:text-brand-muted"
      dangerouslySetInnerHTML={{ __html: news.fullContent || '' }}
    />
  </article>
);

export default BlogPost;
