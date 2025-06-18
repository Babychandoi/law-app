import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import CopyrightServices from './sections/CopyrightServices';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import CopyrightBenefits from './sections/CopyrightBenefits'
import ToToBenefitsSection from './sections/ToToBenefitsSection';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { Users, FileText, CheckCheck } from 'lucide-react';
import PricingComponent from '../../../component/service/UniversalPricing';
import { useParams } from 'react-router-dom';
import { getPricingByServiceId } from '../../../service/service';
export default function Index() {
    const { id } = useParams<{ id: string }>();
    const [pricingPlans, setPricingPlans] = useState<any[]>([]);
    useEffect(() => {
        const fetchPricingPlans = async () => {
            try {
              if (id) {
                const response = await getPricingByServiceId(id);
                setPricingPlans(response.data);
              } else {
                console.error('Service ID is undefined');
              }
            } catch (error) {
              console.error('Failed to fetch pricing plans:', error);
            }
          };
          fetchPricingPlans();
    }, [id]);
    const steps = [
        {
            id: 1,
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Taga Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
            icon: Users,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Ký kết Hợp đồng và Khách hàng cung cấp giấy tờ theo yêu cầu cho Taga Law",
            icon: FileText,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Taga Law tiến hành đăng ký bản quyền và bàn giao kết quả cho Khách hàng",
            icon: CheckCheck,
        }
    ]
    return (
        <>
            <HeroService
                title="Đăng ký bảo hộ bản quyền"
                subtitle="ToTo Law"
                description="Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ bản quyền."
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
                title="QUY TRÌNH ĐĂNG KÝ TẠI TOTO LAW"
                steps={steps}
                layout="simple"
            />
            <PricingComponent
                title="CHI PHÍ ĐĂNG KÝ TẠI TAGA LAW"
                plans={pricingPlans}
                variant="card"
                backgroundColor="bg-gray-50"
            />
            <ConsultationForm />
            <PartnersCarousel />
        </>
    )
}
