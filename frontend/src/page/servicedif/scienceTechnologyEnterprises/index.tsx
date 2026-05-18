import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import ScienceAndTechnologyBusiness from './sections/ScienceAndTechnologyBusiness';
import ScienceTechEnterpriseConditions from './sections/ScienceTechEnterpriseConditions';
import ToToLawServices from './sections/ScienceToToService';
import { Hero, Process } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [hero] = useState<Hero>({
    title: 'Giấy phép Doanh nghiệp Khoa học Công nghệ',
    subtitle: 'Poip Law',
    description: 'Dich vụ cấp Giấy chứng nhận Doanh nghiệp Khoa học và Công nghệ tại Poip Law',
  });
  const [process] = useState<Process[]>([
    {
      id: "301e4bca-9d1f-4b3d-9195-0ac0d95cd99c",
      step: "BƯỚC 1",
      title: "BƯỚC 1",
      description: "Tiếp nhận thông tin và tư vấn",
      details: []
    },
    {
      id: "8cb48a78-f83a-4829-a99a-4b587a084cca",
      step: "BƯỚC 2",
      title: "BƯỚC 2",
      description: "Khách hàng cung cấp thông tin - Luật Poip tiến hành soạn thảo hồ sơ",
      details: []
    },
    {
      id: "b1a29a86-cb11-4d95-a929-91de46f6db64",
      step: "BƯỚC 3",
      title: "BƯỚC 3",
      description: "Nộp hồ sơ lên cơ quan nhà nước có thẩm quyền",
      details: []
    },
    {
      id: "c44303a5-415b-4fe4-b56c-bf5877382b28",
      step: "BƯỚC 4",
      title: "BƯỚC 4",
      description: "Thuyết minh phương án sản xuất kinh doanh và nhận kết quả",
      details: []
    }
  ]);


  return (
    <>
      <Seo title="Giấy phép Doanh nghiệp Khoa học Công nghệ - Luật Poip"
        keywords='Dịch vụ đăng ký giấy phép doanh nghiệp khoa học công nghệ, giấy phép doanh nghiệp khoa học công nghệ, tư vấn pháp luật, luật sư sở hữu trí tuệ, Luật Poip'
        description="Luật Taga là một trong những đơn vị cung cấp dịch vụ đăng ký giấy phép Doanh nghiệp Khoa học Công nghệ hàng đầu với đội ngũ chuyên gia giàu kinh nghiệm hỗ trợ tư vấn miễn phí." />
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
      <ScienceAndTechnologyBusiness />
      <UniversalProcess
        title="QUY TRÌNH XIN CẤP GIẤY CHỨNG NHẬN DOANH NGHIỆP KH&CN TẠI LUẬT POIP"
        steps={process}
      />
      <ScienceTechEnterpriseConditions />
      <ToToLawServices />
      <ConsultationForm />
    </>
  )
}
