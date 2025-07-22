import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService'
import ConsultationForm from '../../../component/Consultation';
import InventionInfo from './sections/InventionInfo';
import Patent from './sections/PatentConditions';
import PatentBenefits from './sections/Benefits';
import ToToBenefits from './sections/ToToBenefits';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../component/service/ProcessTimeLine';
import { useParams } from 'react-router-dom';
import { Hero, Process, ProcessStep } from '../../../types/service';
import { getHeroByServiceId, getProcessByServiceId, getProcessTimeLineByServiceId } from '../../../service/service';
export default function Index() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? atob(id) : undefined;
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
