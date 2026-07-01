import React, { lazy, Suspense } from 'react';
import Consultation from './consultation/Consultation';
import HeroSection from '../../component/service/HeroService';
import { Seo } from '../../component/Seo';

// Lazy load GoogleMap component
const GoogleMap = lazy(() =>
  import('./googleMap/index').then((module) => ({ default: module.GoogleMap }))
);

export default function Contact() {
  return (
    <>
      <Seo
        title="Liên hệ - Luật Poip Legal"
        keywords="Liên hệ Luật Poip Legal, tư vấn pháp luật, dịch vụ sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip Legal"
        description="Liên hệ với Luật Poip Legal để được tư vấn miễn phí về các dịch vụ sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép và các vấn đề pháp lý khác."
      />
      <HeroSection
        title="Liên hệ với chúng tôi"
        subtitle="Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ với chúng tôi nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ."
      />
      <Consultation />
      <Suspense
        fallback={
          <div className="flex items-center justify-center gap-3 py-20" role="status">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-line border-t-brand-primaryDark"></div>
            <span className="sr-only">Đang tải bản đồ</span>
          </div>
        }
      >
        <GoogleMap />
      </Suspense>
    </>
  );
}
