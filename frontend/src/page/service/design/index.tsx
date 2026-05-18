import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService'
import ConsultationForm from '../../../component/Consultation';
import IndustrialDesignProtection from './sections/IndustrialDesignProtection';
import DesignProtectionServices from './sections/DesignProtectionServices';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
    const [hero] = useState<Hero>({
        title: 'Đăng ký bảo hộ kiểu dáng',
        subtitle: 'Poip Law',
        description: 'Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ kiểu dáng.'
    });
    const [process,] = useState<Process[]>([
        {
            id: "74516b43-b488-4a2b-a530-dfcc9705a1d6",
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Poip Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
            details: []
        },
        {
            id: "cdf26360-3aee-4f44-8b6c-20adec2b204a",
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Kiểm tra khả năng bảo hộ kiểu dáng công nghiệp",
            details: []
        },
        {
            id: "e5431f97-d344-479a-ab97-62b1ec6e86f8",
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Ký kết Hợp đồng và soạn thảo hồ sơ đăng ký",
            details: []
        },
        {
            id: "6928f302-8f37-45a9-9567-f0bf77c67055",
            step: "BƯỚC 4",
            title: "BƯỚC 4",
            description: "Luật Poip nộp hồ sơ đăng ký lên cơ quan nhà nước có thẩm quyền và theo dõi quá trình xử lý đơn",
            details: []
        }
    ]);
    const [processTineLine] = useState<ProcessStep[]>([
        {
            title: "KIỂM TRA KHẢ NĂNG BẢO HỘ",
            description: "Phân tích và đánh giá khả năng bảo hộ của sáng chế",
            color: "blue",
            duration: "1-3 ngày",
            icon: "search"
        },
        {
            title: "SOẠN THẢO HỒ SƠ",
            description: "Chuẩn bị đầy đủ hồ sơ theo quy định pháp luật",
            color: "emerald",
            duration: "1 ngày",
            icon: "fileText"
        },
        {
            title: "QUÁ TRÌNH XỬ LÝ ĐƠN",
            description: "Thẩm định hình thức (1 tháng) → Công bố đơn (2 tháng) → Thẩm định nội dung (7-12 tháng)",
            color: "orange",
            duration: "10-15 tháng",
            icon: "cog"
        },
        {
            title: "NỘP HỒ SƠ LÊN CƠ QUAN",
            description: "Nộp hồ sơ lên cơ quan có thẩm quyền xử lý",
            color: "purple",
            duration: "1 ngày",
            icon: "upload"
        }
    ]);

    return (
        <>
            <Seo title="Dịch vụ đăng ký kiểu dáng công nghiệp - Luật Poip" 
            keywords='Dịch vụ đăng ký kiểu dáng công nghiệp, bảo hộ kiểu dáng, luật sư sở hữu trí tuệ, Luật Poip'
            description="Dịch vụ đăng ký kiểu dáng công nghiệp, tư vấn miễn phí bởi đội ngũ chuyên gia sở hữu trí tuệ giàu kinh nghiệm và tận tâm." />
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
            <IndustrialDesignProtection />
            <DesignProtectionServices />
            <UniversalProcess
                title="QUY TRÌNH ĐĂNG KÝ TẠI POIP LAW"
                steps={process}
                layout="simple"
            />
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
