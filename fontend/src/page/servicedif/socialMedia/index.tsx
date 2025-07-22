import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import SocialNetworkDefinition from './sections/SocialNetworkDefinition';
import SocialNetworkLicenseConditions from './sections/SocialNetworkLicenseConditions';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { useParams } from 'react-router-dom';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { getHeroByServiceId, getProcessByServiceId, getProcessTimeLineByServiceId } from '../../../service/service';

export default function Index() {
    const { id } = useParams<{ id: string }>();
    const decodedId = id ? atob(id) : undefined;
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ khác',
        subtitle: 'ToTo Law',
        description: ''
    });
    const [process, setProcess] = useState<Process[]>([]);
    const [processTineLine, setProcessTimeLine] = useState<ProcessStep[]>([]);
    useEffect(() => {
        const fetchProcessTimeLine = async () => {
            try {
                if (decodedId) {
                    const response = await getProcessTimeLineByServiceId(decodedId);
                    setProcessTimeLine(response.data);
                } else {
                    console.error('Service ID is undefined');
                }
            } catch (error) {
                console.error('Failed to fetch process:', error);
            }
        }
        fetchProcessTimeLine()
    }, [decodedId]);
    useEffect(() => {
        const fetchProcess = async () => {
            try {
                if (decodedId) {
                    const response = await getProcessByServiceId(decodedId);
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
    }, [decodedId]);
    useEffect(() => {
        const fetchHero = async () => {
            try {
                if (decodedId) {
                    const response = await getHeroByServiceId(decodedId);
                    setHero(response.data);
                } else {
                    console.error('Service ID is undefined');
                }
            } catch (error) {
                console.error('Failed to fetch hero:', error);
            }
        };
        fetchHero();
    }, [decodedId]);

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
