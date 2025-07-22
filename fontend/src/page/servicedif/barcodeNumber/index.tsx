import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import BarcodeSection from "./sections/BarcodeSection";
import BarcodeBenefits from './sections/BarcodeBenefits';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import {  useParams } from 'react-router-dom';
import { Hero, Process } from '../../../types/service';
import { getHeroByServiceId, getProcessByServiceId,getPricingByServiceId } from '../../../service/service';
export default function Index() {
  const { id } = useParams<{ id: string }>();
  const decodedId = id ? atob(id) : undefined;
  const [hero, setHero] = useState<Hero>({
    title: 'Dịch vụ khác',
    subtitle: 'ToTo Law',
    description: ''
  });
  const [process, setProcess] = useState<Process[]>([]);
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
  const [pricingPlans, setPricingPlans] = useState<any[]>([]);
  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        if (decodedId) {
          const response = await getPricingByServiceId(decodedId);
          const sorted = [...response.data].sort((a, b) => {
            const numA = parseInt(a.title.match(/\d+/)?.[0] || "0");
            const numB = parseInt(b.title.match(/\d+/)?.[0] || "0");
            return numA - numB;
          });
          
          setPricingPlans(sorted);
        } else {
          console.error('Service ID is undefined');
        }
      } catch (error) {
        console.error('Failed to fetch pricing plans:', error);
      }
    };
    fetchPricingPlans();
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
      <BarcodeSection />
      <BarcodeBenefits />
      <UniversalProcess
        title="Quy trình đăng ký mã số mã vạch tại Luật ToTo"
        steps={process}
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ MÃ SỐ MÃ VẠCH TẠI TOTO"
        plans={pricingPlans}
        variant="card"
        backgroundColor="bg-gray-50"
      />
      <ConsultationForm />
      <PartnersCarousel />
    </>
  )
}
