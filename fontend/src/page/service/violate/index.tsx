import React from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import ToToServices from './sections/ToToService';
import TrademarkOpposition from './sections/TrademarkOpposition';
export default function index() {
  return (
    <>
      <HeroService
                title="Dịch vụ xử lý xâm phạm sở hữu trí tuệ"
                subtitle="ToTo Law"
                description="Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực sở hữu trí tuệ."
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
