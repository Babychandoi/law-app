import React from 'react';
import { NewsPage } from '../../component/news/NewsPage';
import HeroSection from '../../component/service/HeroService';
import { Seo } from '../../component/Seo';
export default function index() {
  return (
    <div>
      <Seo
        title="Bản tin pháp luật - Luật Poip Legal"
        keywords="Bản tin pháp luật, tin tức pháp luật, sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép, tư vấn pháp luật, Luật Poip Legal"
        description="Cập nhật tin tức pháp luật mới nhất từ Luật Poip Legal. Tìm hiểu về sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép và các vấn đề pháp lý khác."
      />
      <HeroSection title="Bản tin pháp luật" subtitle="Poip Legal Law" />
      <NewsPage />
    </div>
  );
}
