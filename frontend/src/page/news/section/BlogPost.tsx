import ArticleHeader from '../../../component/legalArticle/ArticleHeader';
import { News } from '../../../types/service';

interface BlogPostProps {
  news: News;
}

const BlogPost = ({ news }: BlogPostProps) => (
  <article className="min-h-screen bg-brand-surface py-10 sm:py-12">
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
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

      <div className="mt-6 rounded-lg border border-brand-line bg-white p-6 sm:p-8 lg:p-10">
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
      </div>
    </div>
  </article>
);

export default BlogPost;
