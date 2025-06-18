import React, { useEffect, useState } from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { CheckCheck } from 'lucide-react';
import ScienceAndTechnologyBusiness from './sections/ScienceAndTechnologyBusiness';
import ScienceTechEnterpriseConditions from './sections/ScienceTechEnterpriseConditions';
import ToToLawServices from './sections/ScienceToToService';
import { useParams } from 'react-router-dom';
import { Hero } from '../../../types/service';
import { getHeroByServiceId } from '../../../service/service';
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
            description: "Tiếp nhận thông tin và tư vấn",
            icon: CheckCheck,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Khách hàng cung cấp thông tin - Luật ToTo tiến hành soạn thảo hồ sơ",
            icon: CheckCheck,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Nộp hồ sơ lên cơ quan nhà nước có thẩm quyền",
            icon: CheckCheck,
        },{
            id: 4,
            step: "BƯỚC 4",
            title: "BƯỚC 4",
            description: "Thuyết minh phương án sản xuất kinh doanh và nhận kết quả",
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
        <ScienceAndTechnologyBusiness />
        <UniversalProcess
        title="QUY TRÌNH XIN CẤP GIẤY CHỨNG NHẬN DOANH NGHIỆP KH&CN TẠI LUẬT TOTO"
        steps={steps}
        />
        <ScienceTechEnterpriseConditions />
        <ToToLawServices />
        <ConsultationForm />
    </>
  )
}
