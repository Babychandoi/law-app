import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import TrademarkBrandComparison from "./sections/TrademarkBrandComparison"
import TrademarkBenefits from './sections/TrademarkBenefits';
import ToToBenefits from './sections/ToToBenefits';
import ConsultationForm from '../../../component/Consultation';
import CustomerTestimonials from './sections/CustomerTestimonials';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import { useParams } from 'react-router-dom';
import { getPricingByServiceId, getHeroByServiceId, getProcessByServiceId } from '../../../service/service';
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
      <TrademarkBrandComparison />
      <TrademarkBenefits />
      <ToToBenefits />
      <UniversalProcess
        title="QUY TRÌNH THỰC HIỆN TẠI TOTO LAW"
        subtitle="Quy trình đăng ký bảo hộ nhãn hiệu chuyên nghiệp với 3 bước đơn giản và hiệu quả"
        steps={process}
        layout="detailed"
      />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ BẢO HỘ NHÃN HIỆU TẠI TOTO"
        plans={pricingPlans}
        variant="feature"
        backgroundColor="bg-gradient-to-br from-blue-50 to-indigo-100"
      />
      <ConsultationForm />
      <PartnersCarousel />
      <CustomerTestimonials />
    </>
  )
}
