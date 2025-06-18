import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import ToToServices from './sections/ToToService';
import TrademarkOpposition from './sections/TrademarkOpposition';
import { useParams } from 'react-router-dom';
import { Hero } from '../../../types/service';
import { getHeroByServiceId } from '../../../service/service';
export default function Index() {
  const { id } = useParams<{ id: string }>();
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ sở hữu trí tuệ',
        subtitle: 'ToTo Law',
        description: ''
      });
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
            <ToToServices />
            <TrademarkOpposition />
        <ConsultationForm />
    </>
  )
}
