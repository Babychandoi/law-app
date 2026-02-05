import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import TrademarkBrandComparison from "./sections/TrademarkBrandComparison"
import TrademarkBenefits from './sections/TrademarkBenefits';
import ToToBenefits from './sections/ToToBenefits';
import ConsultationForm from '../../../component/Consultation';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import { Hero, Process } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [pricingPlans] = useState<any[]>([
   
    {
      id: "a3fbbb39-db48-48df-a89b-2eb82a534026",
      title: "Đăng kí chỉ từ",
      description: "",
      currency: "VND",
      price: "2.100.000",
      featured: true,
      features: [
        "Tư vấn quy trình và thu tục đăng ký",
        "Tra cứu sơ bộ (tối đa 5 nhãn)",
        "Tư vấn sửa đổi nhãn hiệu sau tra cứu",
        "Soạn thảo, nộp hồ sơ đăng ký nhãn hiệu",
        "Theo dõi hồ sơ sau đăng ký",
        "Tư vấn đặt tên thương hiệu (tối đa 3 thương hiệu)"
      ]
    },
   ]);
  const [hero] = useState<Hero>({
    title: 'Dịch vụ đăng ký nhãn hiệu thương hiệu độc quyền',
    subtitle: 'Poip Law',
    description: 'Đội ngũ Luật Sư chuyên môn cao, hỗ trợ đăng ký nhãn hiệu nhanh chóng, hợp pháp, tránh mọi rủi ro tranh chấp.'
  });
  const [process] = useState<Process[]>([
    {
      id: 'ec2d56d5-306e-4df8-a037-333314c3d57f',
      step: 'BƯỚC 1',
      title: 'Tra cứu khả năng bảo hộ nhãn hiệu',
      description: 'Tra cứu khả năng bảo hộ nhãn hiệu là bước quan trọng để đánh giá xem nhãn hiệu dự định đăng ký có trùng hoặc tương tự với nhãn hiệu đã được bảo hộ trước đó không.',
      details: [
        {
          accuracy: '60-70%',
          desc: 'Tra cứu thông qua dữ liệu trực tuyến của Cục sở hữu trí tuệ và tổ chức Sở hữu trí tuệ thế giới, kết quả chính xác khoảng 60-70%.',
          time: '',
          type: 'Tra cứu sơ bộ'
        },
        {
          accuracy: '90-95%',
          desc: 'Tra cứu bởi chuyên viên tại Cục sở hữu trí tuệ, kết quả chính xác khoảng 90-95%.',
          time: '',
          type: 'Tra cứu chuyên sâu'
        }
      ]
    },
    {
      id: 'a8d3d17c-17c4-43f9-9713-6f2330f16d20',
      step: 'BƯỚC 2',
      title: 'Nộp hồ sơ đăng ký bảo hộ nhãn hiệu',
      description: 'Poip Law hỗ trợ toàn bộ quá trình soạn thảo và nộp hồ sơ một cách nhanh chóng và chính xác.',
      details: [
        {
          accuracy: '',
          desc: 'Poip Law sẽ hỗ trợ Quý Khách hàng soạn thảo bộ hồ sơ hoàn chỉnh.',
          time: 'Không quá 01 ngày làm việc',
          type: '1. Soạn hồ sơ'
        },
        {
          accuracy: '',
          desc: 'Poip Law sẽ thay mặt Quý Khách hàng nộp hồ sơ.',
          time: 'Không quá 01 ngày làm việc',
          type: '2. Nộp hồ sơ tại Cục Sở hữu trí tuệ'
        }
      ]
    },
    {
      id: '81b0cbb6-2620-48e8-8901-046877114be6',
      step: 'BƯỚC 3',
      title: 'Thẩm định đơn đăng ký',
      description: 'Quá trình thẩm định được thực hiện qua 4 giai đoạn chính bởi Cục Sở hữu trí tuệ.',
      details: [
        {
          accuracy: '',
          desc: 'Thẩm định khả năng đáp ứng tiêu chuẩn bảo hộ nhãn hiệu',
          time: '18-20 tháng sau công bố',
          type: 'Giai đoạn 3: Thẩm định nội dung'
        },
        {
          accuracy: '',
          desc: 'Thẩm định tính hợp lệ của hồ sơ đăng ký',
          time: '01-02 tháng',
          type: 'Giai đoạn 1: Thẩm định hình thức'
        },
        {
          accuracy: '',
          desc: 'Cấp giấy chứng nhận đăng ký nhãn hiệu',
          time: '01-02 tháng',
          type: 'Giai đoạn 4: Cấp văn bằng'
        },
        {
          accuracy: '',
          desc: 'Công bố trên Công báo sở hữu công nghiệp',
          time: '02 tháng sau khi đơn hợp lệ',
          type: 'Giai đoạn 2: Công bố đơn'
        }
      ]
    }
  ]);
  return (
    <>
     <Seo title="Dịch vụ đăng ký nhãn hiệu thương hiệu độc quyền - Luật Poip" 
     keywords='Dịch vụ đăng ký nhãn hiệu, đăng ký thương hiệu, bảo hộ nhãn hiệu, luật sư sở hữu trí tuệ, Luật Poip'
     description="Dịch vụ đăng ký nhãn hiệu độc quyền, tư vấn miễn phí bởi đội ngũ chuyên gia sở hữu trí tuệ giàu kinh nghiệm và tận tâm." />
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
      <TrademarkBrandComparison />
      <TrademarkBenefits />
      <ToToBenefits />
      <UniversalProcess
        title="QUY TRÌNH THỰC HIỆN TẠI PIOP LAW"
        subtitle="Quy trình đăng ký bảo hộ nhãn hiệu chuyên nghiệp với 3 bước đơn giản và hiệu quả"
        steps={process}
        layout="detailed"
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ BẢO HỘ NHÃN HIỆU TẠI PIOP LAW"
        plans={pricingPlans}
        variant="feature"
        backgroundColor="bg-gradient-to-br from-blue-50 to-indigo-100"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
