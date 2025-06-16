import React from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { CheckCheck } from 'lucide-react';
import ScienceAndTechnologyBusiness from './sections/ScienceAndTechnologyBusiness';
import ScienceTechEnterpriseConditions from './sections/ScienceTechEnterpriseConditions';
import ToToLawServices from './sections/ScienceToToService';
export default function index() {
    const steps = [
        {
            id: 1,
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Tiếp nhận thông tin và tư vấn",
            icon: CheckCheck,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Khách hàng cung cấp thông tin - Luật ToTo tiến hành soạn thảo hồ sơ",
            icon: CheckCheck,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Nộp hồ sơ lên cơ quan nhà nước có thẩm quyền",
            icon: CheckCheck,
        },{
            id: 4,
            step: "BƯỚC 4",
            title: "BƯỚC 4",
            description: "Thuyết minh phương án sản xuất kinh doanh và nhận kết quả",
            icon: CheckCheck,
        }
      ]
  return (
    <>
      <HeroService
                title="Giấy phép Doanh nghiệp Khoa học Công nghệ"
                subtitle="ToTo Law"
                description="Dịch vụ chuyên nghiệp"
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
        title="QUY TRÌNH XIN CẤP GIẤY CHỨNG NHẬN DOANH NGHIỆP KH&CN TẠI LUẬT TOTO"
        steps={steps}
        />
        <ScienceTechEnterpriseConditions />
        <ToToLawServices />
        <ConsultationForm />
    </>
  )
}
