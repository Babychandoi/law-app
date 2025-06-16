import React from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import { CheckCheck } from 'lucide-react';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import SocialNetworkDefinition from './sections/SocialNetworkDefinition';
import SocialNetworkLicenseConditions from './sections/SocialNetworkLicenseConditions';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';

export default function index() {
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
                title="Dịch vụ xin giấy phép mạng xã hội"
                subtitle="ToTo Law"
                description="Dịch vụ chuyên nghiêp - nhanh chóng - tiết kiệm chi phí"
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
