import React from 'react'
import HeroSection from '../../component/service/HeroService';
import Content from './content';
import { Seo } from '../../component/Seo';
export default function Index() {
  return (
    <div>
      <Seo title="Dịch Vụ Sở Hữu Trí Tuệ - Luật Poip"
        keywords='Dịch vụ sở hữu trí tuệ, tư vấn pháp luật, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip'
        description="Luật Poip cung cấp dịch vụ sở hữu trí tuệ, chúng tôi hỗ trợ tư vấn miễn phí. Mọi thắc mắc về luật hãy liên hệ chúng tôi." />
      <HeroSection
        title="Dịch vụ sở hữu trí tuệ"
        subtitle="Poip Law"
      />
      <Content />
    </div>
  )
}
