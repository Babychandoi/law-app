import React, {  useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import CopyrightServices from './sections/CopyrightServices';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import CopyrightBenefits from './sections/CopyrightBenefits'
import ToToBenefitsSection from './sections/ToToBenefitsSection';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import { Hero, Process } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [pricingPlans] = useState<any[]>([
    {
      id: "6336f319-da72-414b-85e6-8386a1e64f26",
      title: "Tác phẩm Mỹ thuật",
      description: "",
      currency: "đ",
      price: "1.800.000",
      featured: false,
      features: [],
      image: "https://minio-app-restless-frog-6585.fly.dev:9000/images/569959e9-5885-46a9-9ec5-77eb07a39bd0_tac-pham-my-thuat-ung-dung.jpeg"
    },
    {
      id: "8be60467-00ac-4ca0-9af3-4bf1296c823b",
      title: "Chương trình máy tính",
      description: "",
      currency: "đ",
      price: "2.500.000",
      featured: true,
      features: [],
      image: "https://minio-app-restless-frog-6585.fly.dev:9000/images/72f7d228-4b12-4fc3-bc5a-1bbe939e8b95_chuong-trinh-may-tinh-la-gi-1-e1690767279710.jpeg"
    },
    {
      id: "e60f7b3d-e9ff-47c1-bcda-24c609c8a7fd",
      title: "Các loại hình khác",
      description: "",
      currency: "",
      price: "Liên hệ",
      featured: false,
      features: [],
      image: "https://minio-app-restless-frog-6585.fly.dev:9000/images/d386b8b3-1ef9-4756-85a7-9b3e55ca4c7c_book-on-wooden-table-1565317730961314739093-e1690767356209.jpeg"
    }
  ]);
  const [hero] = useState<Hero>({
    title: 'Đăng ký bảo hộ bản quyền',
    subtitle: 'Poip Law',
    description: 'Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ bản quyền'
  });
  const [process] = useState<Process[]>([
    {
      id: "13c1a480-6ea2-4b48-aaa0-471e3a91f073",
      step: "BƯỚC 1",
      title: "BƯỚC 1",
      description: "Poip Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
      details: []
    },
    {
      id: "a98c2324-1e3e-4f17-86f9-bbacddfcf831",
      step: "BƯỚC 2",
      title: "BƯỚC 2",
      description: "Ký kết hợp đồng và khách hàng cung cấp giấy tờ theo yêu cầu cho Poip Law",
      details: []
    },
    {
      id: "1e67c8af-9275-489d-aacb-9f9a51b679a5",
      step: "BƯỚC 3",
      title: "BƯỚC 3",
      description: "Poip Law tiến hành đăng ký bản quyền và bàn giao kết quả cho khách hàng",
      details: []
    }
  ]);
  return (
    <>
      <Seo title="Dịch vụ đăng ký bản quyền - Luật Poip" 
      keywords='Dịch vụ đăng ký bản quyền, bảo hộ bản quyền, luật sư sở hữu trí tuệ, Luật Poip'
      description="Dịch vụ đăng ký bản quyền, tư vấn miễn phí bởi đội ngũ chuyên gia sở hữu trí tuệ giàu kinh nghiệm và tận tâm." />
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
      <CopyrightServices />
      <CopyrightBenefits />
      <ToToBenefitsSection />
      <UniversalProcess
        title="QUY TRÌNH ĐĂNG KÝ TẠI POIP LAW"
        steps={process}
        layout="simple"
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ TẠI POIP LAW"
        plans={pricingPlans}
        variant="card"
        backgroundColor="bg-gray-50"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
