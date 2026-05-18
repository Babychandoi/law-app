import React, { useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import ToToServices from './sections/ToToService';
import TrademarkOpposition from './sections/TrademarkOpposition';
import { Hero } from '../../../types/service';
import { Seo } from '../../../component/Seo';
export default function Index() {
  const [hero] = useState<Hero>({
    title: 'Dịch vụ xử lý xâm phạm sở hữu trí tuệ',
    subtitle: 'Poip Law',
    description: 'Tư vấn bởi đội ngũ luật sư có chuyên môn và kinh nghiệm trong lĩnh vực sở hữu trí tuệ.'
  });

  return (
    <>
      <Seo title="Dịch vụ xử lý xâm phạm sở hữu trí tuệ - Luật Poip"
        keywords='Dịch vụ xử lý xâm phạm sở hữu trí tuệ, tư vấn pháp luật, luật sư sở hữu trí tuệ, Luật Poip'
        description="Dịch vụ xử lý xâm phạm sở hữu trí tuệ, tư vấn miễn phí bởi đội ngũ chuyên gia sở hữu trí tuệ giàu kinh nghiệm và tận tâm." />
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
