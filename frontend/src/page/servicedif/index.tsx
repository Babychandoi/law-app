import React from 'react'
import HeroSection from '../../component/service/HeroService';
import Content from './content';
import { Seo } from '../../component/Seo';
export default function Index() {

  return (
    <div>
      <Seo title="Dịch Vụ Khác - Luật Poip"
        keywords='Dịch vụ khác, tư vấn pháp luật, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip'
        description="Luật Poip cung cấp các dịch vụ pháp lý khác ngoài sở hữu trí tuệ. Chúng tôi hỗ trợ tư vấn miễn phí về các vấn đề pháp lý đa dạng." />
      <HeroSection
        title="Dịch vụ khác"
        subtitle="Poip Law"
      />
      <Content />
    </div>
  )
}
