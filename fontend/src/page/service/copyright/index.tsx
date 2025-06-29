import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import CopyrightServices from './sections/CopyrightServices';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import CopyrightBenefits from './sections/CopyrightBenefits'
import ToToBenefitsSection from './sections/ToToBenefitsSection';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import { useParams } from 'react-router-dom';
import { getHeroByServiceId, getPricingByServiceId, getProcessByServiceId } from '../../../service/service';
import { Hero, Process } from '../../../types/service';
export default function Index() {
  const { id } = useParams<{ id: string }>();
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  const [hero, setHero] = useState<Hero>({
    title: 'Dịch vụ sở hữu trí tuệ',
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
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        if (id) {
          const response = await getPricingByServiceId(id);
          setPricingPlans(response.data);
        } else {
          console.error('Service ID is undefined');
        }
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
      }
    };
    fetchPricingPlans();
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
      <CopyrightServices />
      <CopyrightBenefits />
      <ToToBenefitsSection />
      <UniversalProcess
        title="QUY TRÌNH ĐĂNG KÝ TẠI TOTO LAW"
        steps={process}
        layout="simple"
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ TẠI TOTO LAW"
        plans={pricingPlans}
        variant="card"
        backgroundColor="bg-gray-50"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
