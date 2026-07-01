import Slide from './Slide';
import Legal from './Legal';
import TrustSection from './TrustSection';
import { Seo } from '../../component/Seo';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Consultation = lazy(() => import('../../component/Consultation'));
const VideoSection = lazy(() => import('../../component/VideoSection'));
const New = lazy(() => import('./New'));
const GoogleMap = lazy(() =>
  import('../contact/googleMap/index').then((module) => ({ default: module.GoogleMap }))
);

function SectionFallback({ minHeight }: { minHeight: number }) {
  return <div style={{ minHeight }} aria-hidden="true" />;
}

function LazyWhenVisible({
  children,
  id,
  minHeight = 360,
}: {
  children: React.ReactNode;
  id?: string;
  minHeight?: number;
}) {
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
      { rootMargin: '1500px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldRender]);

  return (
    <div ref={ref} id={id} style={!shouldRender ? { minHeight } : undefined}>
      {shouldRender ? children : null}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Seo
        title="Dịch Vụ Sở Hữu Trí Tuệ - Luật Poip Legal"
        description="Luật Poip Legal cung cấp dịch vụ sở hữu trí tuệ, chúng tôi hỗ trợ tư vấn miễn phí. Mọi thắc mắc về luật hãy liên hệ chúng tôi."
        keywords="Dịch vụ sở hữu trí tuệ, tư vấn pháp luật, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip Legal"
      />
      <Slide />
      <Legal />
      <TrustSection />
      <LazyWhenVisible id="contact-form" minHeight={720}>
        <Suspense fallback={<SectionFallback minHeight={720} />}>
          <Consultation sectionId="home-contact-form" />
        </Suspense>
      </LazyWhenVisible>
      <LazyWhenVisible minHeight={460}>
        <Suspense fallback={<SectionFallback minHeight={460} />}>
          <VideoSection />
        </Suspense>
      </LazyWhenVisible>
      <LazyWhenVisible minHeight={420}>
        <Suspense fallback={<SectionFallback minHeight={420} />}>
          <New />
        </Suspense>
      </LazyWhenVisible>
      <LazyWhenVisible minHeight={620}>
        <Suspense
          fallback={
            <div className="flex items-center justify-center bg-brand-surface py-20" role="status">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-goldDark"></div>
              <span className="sr-only">Đang tải bản đồ</span>
            </div>
          }
        >
          <section className="bg-brand-surface py-16 sm:py-20" aria-labelledby="office-heading">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
              <div className="mb-8 max-w-2xl">
                <p className="text-sm font-semibold text-brand-goldDark">Văn phòng Luật Poip Legal</p>
                <h2
                  id="office-heading"
                  className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-gray-950 md:text-4xl"
                >
                  Trao đổi trực tiếp khi bạn cần
                </h2>
                <p className="mt-4 text-base leading-7 text-gray-700">
                  Liên hệ trước để đội ngũ chuẩn bị đúng chuyên môn và dành thời gian phù hợp cho
                  nhu cầu của bạn.
                </p>
              </div>
              <GoogleMap
                height={420}
                language="vi"
                borderRadius="8px"
                ariaLabel="Bản đồ văn phòng Luật Poip Legal"
              />
            </div>
          </section>
        </Suspense>
      </LazyWhenVisible>
    </>
  );
}
