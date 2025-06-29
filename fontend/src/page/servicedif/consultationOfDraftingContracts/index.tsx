import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import ContractTypesComponent from './sections/ContractTypesComponent';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import ToToBenefitsComponent from './sections/ToToBenefits';
import { useParams } from 'react-router-dom';
import { getHeroByServiceId, getProcessByServiceId } from '../../../service/service';
import { Hero, Process } from '../../../types/service';
export default function Index() {
  const { id } = useParams<{ id: string }>();
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
      <ContractTypesComponent />
      <UniversalProcess
        title="QUY TRÌNH VÀ THỜI GIAN CUNG CẤP DỊCH VỤ"
        steps={process}
      />
      <ToToBenefitsComponent />
      <Consultation />
    </>
  )
}
