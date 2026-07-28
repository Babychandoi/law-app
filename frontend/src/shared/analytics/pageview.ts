import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// GA4 Measurement ID — trùng với thẻ đã nhúng ở public/index.html.
const GA4_ID = 'G-W3K9FB9FC3';

// Các khu NỘI BỘ không tính vào analytics công khai (admin, hệ thống, tài liệu nội bộ).
const INTERNAL_PREFIXES = [
  '/2025/luatpoip/admin',
  '/2025/luatpoip/he-thong',
  '/2025/luatpoip/tai-lieu',
];

// Kiểu Window.gtag đã được khai báo global ở nơi khác (Consultation.tsx / landing/tracking.ts).

/** Trang công khai (không thuộc khu nội bộ). */
export function isPublicPath(path: string): boolean {
  return !INTERNAL_PREFIXES.some((p) => path.startsWith(p));
}

/** Gửi 1 page_view tới GA4 cho trang công khai; bỏ qua khu nội bộ. */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;
  if (!isPublicPath(path)) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
    send_to: GA4_ID, // chỉ gửi tới GA4, không lẫn sang thẻ Google Ads
  });
}

/**
 * Theo dõi điều hướng SPA: mỗi lần đổi route (pathname/search) gửi 1 page_view.
 * GA4 mặc định chỉ tính page_view lúc tải trang đầu — với SPA phải tự gửi khi chuyển trang.
 */
export function usePageViews(): void {
  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);
}
