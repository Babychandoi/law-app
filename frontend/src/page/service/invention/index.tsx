import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService'
import ConsultationForm from '../../../component/Consultation';
import InventionInfo from './sections/InventionInfo';
import Patent from './sections/PatentConditions';
import PatentBenefits from './sections/Benefits';
import ToToBenefits from './sections/ToToBenefits';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [hero] = useState<Hero>({
    title: 'Dịch vụ đăng ký bảo hộ sáng chế',
    subtitle: 'Poip Law',
    description: 'Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ sáng chế.'
  });
  const [process] = useState<Process[]>([
    {
      id: "e3a161c0-bb7f-4b18-900e-c9dc6f6361cc",
      step: "BƯỚC 1",
      title: "BƯỚC 1",
      description: "Poip Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
      details: []
    },
    {
      id: "991c1272-0505-4a6d-8351-41061d8bc388",
      step: "BƯỚC 2",
      title: "BƯỚC 2",
      description: "Kiểm tra khả năng bảo hộ kiểu dáng công nghiệp",
      details: []
    },
    {
      id: "35b749a9-0e47-482e-a85a-e738c6d62ea5",
      step: "BƯỚC 3",
      title: "BƯỚC 3",
      description: "Ký kết hợp đồng và soạn thảo hồ sơ đăng ký",
      details: []
    },
    {
      id: "aa9d4221-598f-4ad0-bf1a-400fef5a760c",
      step: "BƯỚC 4",
      title: "BƯỚC 4",
      description: "Nộp hồ sơ đăng ký và theo dõi quá trình xử lý đơn",
      details: []
    }
  ]);
  const [processTineLine] = useState<ProcessStep[]>([
    {
      title: "SOẠN THẢO HỒ SƠ",
      description: "Chuẩn bị đầy đủ hồ sơ theo quy định pháp luật",
      color: "emerald",
      duration: "1 ngày",
      icon: "fileText"
    },
    {
      title: "NỘP HỒ SƠ LÊN CƠ QUAN CÓ THẨM QUYỀN",
      description: "Nộp hồ sơ lên cơ quan có thẩm quyền xử lý",
      color: "purple",
      duration: "1 ngày",
      icon: "upload"
    },
    {
      title: "QUÁ TRÌNH XỬ LÝ ĐƠN",
      description: "Thẩm định hình thức (1 tháng) → Công bố đơn (2 tháng) → Thẩm định nội dung (18 - 24 tháng kể từ ngày công bố đơn)",
      color: "orange",
      duration: "20-27 tháng",
      icon: "cog"
    },
    {
      title: "KIỂM TRA KHẢ NĂNG BẢO HỘ",
      description: "Phân tích và đánh giá khả năng bảo hộ của sáng chế",
      color: "blue",
      duration: "1-3 ngày",
      icon: "search"
    }
  ]);
  return (
    <>
      <Seo title="Dịch vụ đăng ký bảo hộ sáng chế - Luật Poip"
        keywords='Dịch vụ đăng ký sáng chế, bảo hộ sáng chế, luật sư sở hữu trí tuệ, Luật Poip'
        description="Dịch vụ đăng ký sáng chế, tư vấn miễn phí bởi đội ngũ chuyên gia sở hữu trí tuệ giàu kinh nghiệm và tận tâm." />
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
      < InventionInfo />
      <Patent />
      <PatentBenefits />
      <ToToBenefits />
      <UniversalProcess
        title="QUY TRÌNH ĐĂNG KÝ BẢO HỘ SÁNG CHẾ"
        steps={process} />
      <ProcessTimeline
        title="THỜI GIAN THỰC HIỆN"
        subtitle="Quy trình đăng ký bảo hộ sáng chế được thực hiện theo các bước sau"
        steps={processTineLine}
        layout="horizontal"
        showConnectors={true}
      />
      <ConsultationForm />
    </>
  )
}
