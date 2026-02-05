import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import BarcodeSection from "./sections/BarcodeSection";
import BarcodeBenefits from './sections/BarcodeBenefits';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import { Hero, Process } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [hero] = useState<Hero>({
    title: 'Dịch vụ đăng ký mã số mã vạch',
    subtitle: 'Poip Law',
    description: 'Cấp mã ngay trong vòng 1 -> 2 ngày làm việc.'
  });
  const [process] = useState<Process[]>([
    {
      id: "a948e015-2c92-4c6d-9ffa-bea8f900ff72",
      step: "BƯỚC 1",
      title: "BƯỚC 1",
      description: "Tiếp nhận yêu cầu dịch vụ và tư vấn dịch vụ cho khách hàng",
      details: []
    },
    {
      id: "ea666f32-ff95-4846-9a7d-389f490ad4db",
      step: "BƯỚC 2",
      title: "BƯỚC 2",
      description: "Ký kết hợp đồng và soạn thảo hồ sơ đăng ký",
      details: []
    },
    {
      id: "239fdb9d-c859-4b05-a49d-ecb78b27261e",
      step: "BƯỚC 3",
      title: "BƯỚC 3",
      description: "Luật Poip tiến hành đăng ký mã số mã vạch và bàn giao kết quả cho khách hàng",
      details: []
    }
  ]);
  const [pricingPlans] = useState<any[]>([

    {
      id: '1',
      title: 'Đăng ký mã vạch 13 chữ số',
      price: '2.100.000',
      description: 'Phân bổ được cho 100 loại sản phẩm',
      featured: true,
      features: [
        "Cấp mã ngay trong vòng 1 -> 2 ngày làm việc",
      ],
      image: 'https://minio-app-restless-frog-6585.fly.dev:9000/images/a33e2ec4-a12a-4621-8117-a948ac0da79e_ma-so-ma-vach.jpeg'
    }
  ]);
  return (
    <>
      <Seo title="Dịch vụ đăng ký mã số mã vạch - Luật Poip"
        keywords='Dịch vụ đăng ký mã số mã vạch, đăng ký mã vạch, cấp mã vạch, luật sư sở hữu trí tuệ, Luật Poip'
        description="Với đội ngũ chuyên gia và luật sư giàu kinh nghiệm, Luật Poip cam kết cung cấp cho khách hàng dịch vụ đăng ký mã số mã vạch nhanh chóng, chính xác và hiệu quả." />
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
      <BarcodeSection />
      <BarcodeBenefits />
      <UniversalProcess
        title="Quy trình đăng ký mã số mã vạch tại Luật Poip"
        steps={process}
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ MÃ SỐ MÃ VẠCH TẠI POIP LAW"
        plans={pricingPlans}
        variant="card"
        backgroundColor="bg-gray-50"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
