import Slide from './Slide';
import Legal from './Legal';
import Consultation from '../../component/Consultation';
import VideoSection from '../../component/VideoSection';
import New from './New';
import TrustSection from './TrustSection';
import { Seo } from '../../component/Seo';
import React, { lazy, Suspense } from 'react';
const GoogleMap = lazy(() =>
  import('../contact/googleMap/index').then((module) => ({ default: module.GoogleMap }))
);
export default function Home() {
  return (
    <>
      <Seo
        title="Dịch Vụ Sở Hữu Trí Tuệ - Luật Poip"
        description="Luật Poip cung cấp dịch vụ sở hữu trí tuệ, chúng tôi hỗ trợ tư vấn miễn phí. Mọi thắc mắc về luật hãy liên hệ chúng tôi."
        keywords="Dịch vụ sở hữu trí tuệ, tư vấn pháp luật, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip"
      />
      <Slide />
      <Legal />
      <TrustSection />
      <Consultation />
      <VideoSection />
      <New />
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
              <p className="text-sm font-semibold text-brand-goldDark">Văn phòng Luật Poip</p>
              <h2
                id="office-heading"
                className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-gray-950 md:text-4xl"
              >
                Trao đổi trực tiếp khi bạn cần
              </h2>
              <p className="mt-4 text-base leading-7 text-gray-700">
                Liên hệ trước để đội ngũ chuẩn bị đúng chuyên môn và dành thời gian phù hợp cho nhu
                cầu của bạn.
              </p>
            </div>
            <GoogleMap
              height={420}
              language="vi"
              borderRadius="8px"
              ariaLabel="Bản đồ văn phòng Luật Poip"
            />
          </div>
        </section>
      </Suspense>
    </>
  );
}
