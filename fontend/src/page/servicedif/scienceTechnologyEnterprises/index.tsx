import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import ScienceAndTechnologyBusiness from './sections/ScienceAndTechnologyBusiness';
import ScienceTechEnterpriseConditions from './sections/ScienceTechEnterpriseConditions';
import ToToLawServices from './sections/ScienceToToService';
import { useLocation } from 'react-router-dom';
import { Hero, Process } from '../../../types/service';
import { getHeroByServiceId, getProcessByServiceId } from '../../../service/service';
export default function Index() {
  const location = useLocation();
  const id = location.state?.id;
  const [hero, setHero] = useState<Hero>({
    title: 'Dịch vụ khác',
    subtitle: 'ToTo Law',
    description: ''
  });
  const [process, setProcess] = useState<Process[]>([]);
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
      <ScienceAndTechnologyBusiness />
      <UniversalProcess
        title="QUY TRÌNH XIN CẤP GIẤY CHỨNG NHẬN DOANH NGHIỆP KH&CN TẠI LUẬT TOTO"
        steps={process}
      />
      <ScienceTechEnterpriseConditions />
      <ToToLawServices />
      <ConsultationForm />
    </>
  )
}
