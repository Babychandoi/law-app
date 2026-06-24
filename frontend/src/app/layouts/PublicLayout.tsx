import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../../component/common/Header/Header';
import ChatyWidget from '../../component/common/ChatyWidget/ChatyWidget';
import ScrollToTop from '../../component/common/ScrollToTop';

const Footer = lazy(() => import('../../component/common/Footer/Footer'));

function FooterFallback() {
  return <div style={{ minHeight: 360 }} aria-hidden="true" />;
}

function DeferredFooter() {
  const [shouldRender, setShouldRender] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;
    const element = ref.current;
    if (!element) return;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin: '900px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref} style={!shouldRender ? { minHeight: 360 } : undefined}>
      {shouldRender ? (
        <Suspense fallback={<FooterFallback />}>
          <Footer />
        </Suspense>
      ) : null}
    </div>
  );
}

export default function PublicLayout() {
  return (
    <div className="public-site min-h-screen bg-white text-gray-950">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-brand-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition-transform focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>
      <ScrollToTop />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <ChatyWidget />
      <DeferredFooter />
    </div>
  );
}
