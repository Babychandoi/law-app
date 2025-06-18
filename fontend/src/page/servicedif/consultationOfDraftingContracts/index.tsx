import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import Consultation from '../../../component/Consultation';
import ContractTypesComponent from './sections/ContractTypesComponent';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { CheckCheck } from 'lucide-react';
import ToToBenefitsComponent from './sections/ToToBenefits';
import { useParams } from 'react-router-dom';
import { getHeroByServiceId } from '../../../service/service';
import { Hero } from '../../../types/service';
export default function Index() {
    const { id } = useParams<{ id: string }>();
    const [hero, setHero] = useState<Hero>({
        title: 'Dịch vụ khác',
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
    const steps = [
        {
            id: 1,
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Tiếp nhận thông tin và tư vấn lựa chọn loại Hợp đồng phù hợp",
            icon: CheckCheck,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Ký kết Hợp đồng dịch vụ",
            icon: CheckCheck,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Nhận kết quả - Không quá 3 ngày làm việc",
            icon: CheckCheck,
        }
      ]
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
        steps={steps}
        />
        <ToToBenefitsComponent />
        <Consultation />
    </>
  )
}
