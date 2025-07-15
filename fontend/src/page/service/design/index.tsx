import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService'
import ConsultationForm from '../../../component/Consultation';
import IndustrialDesignProtection from './sections/IndustrialDesignProtection';
import DesignProtectionServices from './sections/DesignProtectionServices';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { getHeroByServiceId, getProcessByServiceId, getProcessTimeLineByServiceId } from '../../../service/service';
import { useLocation } from 'react-router-dom';
export default function Index() {
    const location = useLocation();
    const id = location.state?.id;
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ sở hữu trí tuệ',
        subtitle: 'ToTo Law',
        description: ''
    });
    const [process, setProcess] = useState<Process[]>([]);
    const [processTineLine, setProcessTimeLine] = useState<ProcessStep[]>([]);
    useEffect(() => {
        const fetchProcessTimeLine = async () => {
            try {
                if (id) {
                    const response = await getProcessTimeLineByServiceId(id);
                    setProcessTimeLine(response.data);
                } else {
                    console.error('Service ID is undefined');
                }
            } catch (error) {
                console.error('Failed to fetch process:', error);
            }
        }
        fetchProcessTimeLine()
    }, [id]);
    useEffect(() => {
        const fetchProcess = async () => {
            try {
                if (id) {
                    const response = await getProcessByServiceId(id);
                    response.data.sort(
                        (a, b) => a.step.localeCompare(b.step)
                    )
                    setProcess(response.data);
                } else {
                    console.error('Service ID is undefined');
                }
            } catch (error) {
                console.error('Failed to fetch process:', error);
            }
        };
        fetchProcess();
    }, [id]);
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
