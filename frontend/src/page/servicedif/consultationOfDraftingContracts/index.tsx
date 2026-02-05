import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import ContractTypesComponent from './sections/ContractTypesComponent';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import ToToBenefitsComponent from './sections/ToToBenefits';
import { Hero, Process } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [hero] = useState<Hero>({
    title: 'Dịch vụ Tư vấn soạn thảo Hợp đồng',
    subtitle: 'Poip Law',
    description: 'Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực'
  });
  const [process] = useState<Process[]>([
    {
      id: "1c4380d5-acda-4b74-99f9-a9ea51095206",
      step: "BƯỚC 1",
      title: "BƯỚC 1",
      description: "Tiếp nhận thông tin và tư vấn lựa chọn loại Hợp đồng phù hợp",
      details: []
    },
    {
      id: "40f043e2-c8f9-40e5-966f-7d1f74f84ca4",
      step: "BƯỚC 2",
      title: "BƯỚC 2",
      description: "Ký kết Hợp đồng dịch vụ",
      details: []
    },
    {
      id: "a36a2e5f-bcff-4079-94a7-2731e22a74d9",
      step: "BƯỚC 3",
      title: "BƯỚC 3",
      description: "Nhận kết quả - Không quá 3 ngày làm việc",
      details: []
    }
  ]);
  return (
    <>
      <Seo title="Dịch vụ Tư vấn soạn thảo Hợp đồng - Luật Poip"
        keywords='Dịch vụ tư vấn soạn thảo hợp đồng, hợp đồng thương mại, hợp đồng dân sự, luật sư hợp đồng, Luật Poip'
        description="Luật Poip cung cấp dịch vụ tư vấn soạn thảo hợp đồng từ A đến Z. Đội ngũ chuyên viên giỏi, nhiều kinh nghiệm." />
      <HeroService
        title={hero.title}
        subtitle={hero.subtitle}
        description={hero.description}
        showCTA={true}
        ctaText="Tư vấn miễn phí"
        onCTAClick={() => {
          const contactForm = document.getElementById('contact-form');
          if (contactForm) {
            contactForm.scrollIntoView({ behavior: 'smooth' });
          }
        }}

      />
      <ContractTypesComponent />
      <UniversalProcess
        title="QUY TRÌNH VÀ THỜI GIAN CUNG CẤP DỊCH VỤ"
        steps={process}
      />
      <ToToBenefitsComponent />
      <Consultation />
    </>
  )
}
