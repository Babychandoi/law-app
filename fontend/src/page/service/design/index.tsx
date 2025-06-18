import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService'
import ConsultationForm from '../../../component/Consultation';
import IndustrialDesignProtection from './sections/IndustrialDesignProtection';
import DesignProtectionServices from './sections/DesignProtectionServices';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { CheckCheck } from 'lucide-react';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { Hero } from '../../../types/service';
import { getHeroByServiceId } from '../../../service/service';
import { useParams } from 'react-router-dom';
export default function Index() {
    const { id } = useParams<{ id: string }>();
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ sở hữu trí tuệ',
        subtitle: 'ToTo Law',
        description: ''
    });
    useEffect(() => {
        const fetchHero = async () => {
            try {
                if (id) {
                    const response = await getHeroByServiceId(id);
                    setHero(response.data);
                } else {
                    console.error('Service ID is undefined');
                }
            } catch (error) {
                console.error('Failed to fetch hero:', error);
            }
        };
        fetchHero();
    }, [id]);
    const steps = [
        {
            id: 1,
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Taga Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
            icon: CheckCheck,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Kiểm tra khả năng bảo hộ kiểu dáng công nghiệp",
            icon: CheckCheck,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Ký kết Hợp đồng và soạn thảo hồ sơ đăng ký",
            icon: CheckCheck,
        },
        {
            id: 4,
            step: "BƯỚC 4",
            title: "BƯỚC 4",
            description: "Luật Taga nộp hồ sơ đăng ký lên cơ quan nhà nước có thẩm quyền và theo dõi quá trình xử lý đơn",
            icon: CheckCheck,
        }
    ]
    const defaultSteps = [
        {
            title: "KIỂM TRA KHẢ NĂNG BẢO HỘ",
            description: "Phân tích và đánh giá khả năng bảo hộ của sáng chế",
            duration: "1-3 ngày",
            icon: "search",
            color: "blue" as "blue"
        },
        {
            title: "SOẠN THẢO HỒ SƠ",
            description: "Chuẩn bị đầy đủ hồ sơ theo quy định pháp luật",
            duration: "1 ngày",
            icon: "fileText",
            color: "emerald" as "emerald"
        },
        {
            title: "NỘP HỒ SƠ LÊN CƠ QUAN",
            description: "Nộp hồ sơ lên cơ quan có thẩm quyền xử lý",
            duration: "1 ngày",
            icon: "upload",
            color: "purple" as "purple"
        },
        {
            title: "QUÁ TRÌNH XỬ LÝ ĐƠN",
            description: "Thẩm định hình thức (1 tháng) → Công bố đơn (2 tháng) → Thẩm định nội dung (7-12 tháng)",
            duration: "10-15 tháng",
            icon: "cog",
            color: "orange" as "orange"
        }
    ];
    return (
        <>
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
                title="QUY TRÌNH ĐĂNG KÝ TẠI TOTO LAW"
                steps={steps}
                layout="simple"
            />
            <ProcessTimeline
                title="THỜI GIAN THỰC HIỆN"
                subtitle="Quy trình đăng ký bảo hộ sáng chế được thực hiện theo các bước sau"
                steps={defaultSteps}
                layout="horizontal"
                showConnectors={true}
            />
            <ConsultationForm />
        </>
    )
}
