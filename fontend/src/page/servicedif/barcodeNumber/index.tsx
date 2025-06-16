import React from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import BarcodeSection from "./sections/BarcodeSection";
import BarcodeBenefits from './sections/BarcodeBenefits';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { CheckCheck } from 'lucide-react';
import PricingComponent from '../../../component/service/UniversalPricing';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
export default function index() {
  const steps = [
    {
        id: 1,
        step: "BƯỚC 1",
        title: "BƯỚC 1",
        description: "Tiếp nhận yêu cầu dịch vụ và tư vấn dịch vụ cho Khách hàng",
        icon: CheckCheck,
    },
    {
        id: 2,
        step: "BƯỚC 2",
        title: "BƯỚC 2",
        description: "Ký kết Hợp đồng và soạn thảo hồ sơ đăng ký",
        icon: CheckCheck,
    },
    {
        id: 3,
        step: "BƯỚC 3",
        title: "BƯỚC 3",
        description: "Luật ToTo tiến hành đăng ký mã số mã vạch và bàn giao kết quả cho Khách hàng",
        icon: CheckCheck,
    },
  ]
  const artworkPlans = [
        {
          id: 'art-work',
          name: 'Gói 10 chữ số',
          price: '2.400.000',
          currency: 'đ',
          image: 'https://luattaga.vn/wp-content/uploads/2023/07/ma-so-ma-vach.jpeg#883',
          imageAlt: 'goi-10-chu-so',
          description: "Phân bổ được cho 100 loại sản phẩm",
          features: [
            "Phí duy trì hàng năm: 500.000đ/năm",
          ],
        },
        {
          id: 'computer-program',
          name: 'Gói 9 chữ số',
          price: '2.700.000',
          currency: 'đ',
          image: 'https://luattaga.vn/wp-content/uploads/2023/07/ma-so-ma-vach.jpeg#883',
          imageAlt: 'goi-9-chu-so',
          featured: true,
          description: "Phân bổ được cho 1.000 loại sản phẩm",
          features: [
            "Phí duy trì hàng năm: 800.000đ/năm",
          ],
        },
        {
          id: 'other-types',
          name: 'Gói 8 chữ số',
          price: '3.400.000',
          currency: 'đ',
          image: 'https://luattaga.vn/wp-content/uploads/2023/07/ma-so-ma-vach.jpeg#883',
          imageAlt: 'goi-8-chu-so',
          description: "Phân bổ được cho 10.000 loại sản phẩm",
          features: [
            "Phí duy trì hàng năm: 1.500.000đ/năm",
          ],
        }
      ];
  return (
    <>
      <HeroService
                title="Dịch vụ đăng ký mã số mã vạch"
                subtitle="ToTo Law"
                description="Cấp mã ngay trong vòng 1 ngày làm việc"
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
        title="Quy trình đăng ký mã số mã vạch tại Luật ToTo"
        steps={steps}
        />
        <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ MÃ SỐ MÃ VẠCH TẠI TOTO"
        plans={artworkPlans}
        variant="card"
        backgroundColor="bg-gray-50"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
