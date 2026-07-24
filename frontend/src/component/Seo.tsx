// Seo.tsx
import { Title, Meta, Link } from 'react-head';

interface SeoProps {
  title: string;
  description?: string;
  keywords?: string;
  /** Ảnh chia sẻ (Open Graph/Twitter). Mặc định logo. Nên là URL tuyệt đối. */
  image?: string;
  /** og:type — "website" (mặc định) hoặc "article" cho trang tin. */
  type?: 'website' | 'article';
  /** URL canonical. Mặc định = origin + pathname hiện tại. */
  canonical?: string;
  /** Đặt true cho trang không muốn Google index (vd trang 404). */
  noindex?: boolean;
}

const SITE_NAME = 'Luật Poip Legal';
const DEFAULT_IMAGE = 'https://luatpoip.com/assets/images/logo.png';

function currentUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin + window.location.pathname;
  }
  return 'https://luatpoip.com';
}

export function Seo({ title, description, keywords, image, type, canonical, noindex }: SeoProps) {
  const url = canonical || currentUrl();
  const img = image || DEFAULT_IMAGE;
  const ogType = type || 'website';

  return (
    <>
      <Title>{title}</Title>
      {description && <Meta name="description" content={description} />}
      {keywords && <Meta name="keywords" content={keywords} />}
      {noindex && <Meta name="robots" content="noindex, nofollow" />}

      <Link rel="canonical" href={url} />

      {/* Open Graph (Facebook/Zalo…) */}
      <Meta property="og:site_name" content={SITE_NAME} />
      <Meta property="og:type" content={ogType} />
      <Meta property="og:title" content={title} />
      {description && <Meta property="og:description" content={description} />}
      <Meta property="og:url" content={url} />
      <Meta property="og:image" content={img} />
      <Meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:title" content={title} />
      {description && <Meta name="twitter:description" content={description} />}
      <Meta name="twitter:image" content={img} />
    </>
  );
}
