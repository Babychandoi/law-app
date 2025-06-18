import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import { CheckCheck } from 'lucide-react';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import SocialNetworkDefinition from './sections/SocialNetworkDefinition';
import SocialNetworkLicenseConditions from './sections/SocialNetworkLicenseConditions';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { useParams } from 'react-router-dom';
import { Hero } from '../../../types/service';
import { getHeroByServiceId } from '../../../service/service';

export default function Index() {
    const { id } = useParams<{ id: string }>();
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ khác',
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
            description: "Chuẩn bị hồ sơ và điều kiện cấp giấy phép",
            icon: CheckCheck,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Nộp hồ sơ lên cơ quan nhà nước có thẩm quyền",
            icon: CheckCheck,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Thẩm định hồ sơ và cấp giấy phép",
            icon: CheckCheck,
        }, {
            id: 4,
            step: "BƯỚC 4",
            title: "BƯỚC 4",
            description: "Báo cáo hoạt động sau cấp giấy phép",
            icon: CheckCheck,
        }
    ]
    const defaultSteps = [
        {
            title: "",
            description: "20-30 NGÀY LÀM VIỆC",
            duration: "20-30 ngày",
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
            <SocialNetworkDefinition />
            <SocialNetworkLicenseConditions />
            <UniversalProcess
                title="QUY TRÌNH CẤP GIẤY PHÉP MẠNG XÃ HỘI"
                steps={steps}
            />
            <ProcessTimeline
                title="THỜI GIAN CUNG CẤP DỊCH VỤ"
                subtitle=""
                steps={defaultSteps}
                layout="horizontal"
                showConnectors={true}
            />

            <Consultation />
        </>
    )
}
