import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import SocialNetworkDefinition from './sections/SocialNetworkDefinition';
import SocialNetworkLicenseConditions from './sections/SocialNetworkLicenseConditions';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
    const [hero] = useState<Hero>({
        title: 'Dịch vụ xin giấy phép mạng xã hội',
        subtitle: 'Poip Law',
        description: 'Dịch vụ chuyên nghiêp - nhanh chóng - tiết kiệm chi phí'
    });
    const [process] = useState<Process[]>([
        {
            description: "Chuẩn bị hồ sơ và điều kiện cấp giấy phép",
            details: [],
            id: "86689bc3-c185-4181-a50a-f624c94bf8d0",
            step: "BƯỚC 1",
            title: "BƯỚC 1"
        },
        {
            description: "Nộp hồ sơ lên cơ quan nhà nước có thẩm quyền",
            details: [],
            id: "37f4cf18-b96d-477a-ba98-cf08830f4504",
            step: "BƯỚC 2",
            title: "BƯỚC 2"
        },
        {
            description: "Thẩm định hồ sơ và cấp giấy phép",
            details: [],
            id: "de68be62-0f85-42cd-bc31-ada2a2f623f5",
            step: "BƯỚC 3",
            title: "BƯỚC 3"
        },
        {
            description: "Báo cáo hoạt động sau cấp giấy phép",
            details: [],
            id: "44b69bbb-745e-4d9e-ac46-d79ac4d2a6a4",
            step: "BƯỚC 4",
            title: "BƯỚC 4"
        }
    ]);
    const [processTineLine] = useState<ProcessStep[]>([{
        color: "orange",
        description: "20-30 NGÀY LÀM VIỆC",
        duration: "20-30 ngày",
        icon: "cog",
        title: ""
    }]);

    return (
        <>
            <Seo title="Dịch vụ xin giấy phép mạng xã hội - Luật Poip"
                keywords='Dịch vụ xin giấy phép mạng xã hội, giấy phép mạng xã hội, luật sư sở hữu trí tuệ, Luật Poip'
                description="Cung cấp dịch vụ xin giấy phép mạng xã hội nhanh chóng, chuyên nghiệp và tiết kiệm chi phí. Đội ngũ chuyên gia giàu kinh nghiệm hỗ trợ tư vấn miễn phí." />
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
                steps={process}
            />
            <ProcessTimeline
                title="THỜI GIAN CUNG CẤP DỊCH VỤ"
                subtitle=""
                steps={processTineLine}
                layout="horizontal"
                showConnectors={true}
            />

            <Consultation />
        </>
    )
}
