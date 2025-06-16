import React from 'react'
import HeroService from '../../../component/service/HeroService';
import ConsultationForm from '../../../component/Consultation';
import CopyrightServices from './sections/CopyrightServices';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import CopyrightBenefits from './sections/CopyrightBenefits'
import ToToBenefitsSection from './sections/ToToBenefitsSection';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import { Users, FileText, CheckCheck } from 'lucide-react';
import PricingComponent from '../../../component/service/UniversalPricing';
export default function index() {
    const steps = [
        {
            id: 1,
            step: "BƯỚC 1",
            title: "BƯỚC 1",
            description: "Taga Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
            icon: Users,
        },
        {
            id: 2,
            step: "BƯỚC 2",
            title: "BƯỚC 2",
            description: "Ký kết Hợp đồng và Khách hàng cung cấp giấy tờ theo yêu cầu cho Taga Law",
            icon: FileText,
        },
        {
            id: 3,
            step: "BƯỚC 3",
            title: "BƯỚC 3",
            description: "Taga Law tiến hành đăng ký bản quyền và bàn giao kết quả cho Khách hàng",
            icon: CheckCheck,
        }
    ]
    const artworkPlans = [
        {
            id: 'art-work',
            name: 'Tác phẩm Mỹ thuật',
            price: '1.800.000',
            currency: 'đ',
            image: 'https://luattaga.vn/wp-content/uploads/2023/07/tac-pham-my-thuat-ung-dung.jpeg',
            imageAlt: 'tac-pham-my-thuat-ung-dung'
        },
        {
            id: 'computer-program',
            name: 'Chương trình máy tính',
            price: '2.500.000',
            currency: 'đ',
            image: 'https://luattaga.vn/wp-content/uploads/2023/07/chuong-trinh-may-tinh-la-gi-1-e1690767279710.jpeg',
            imageAlt: 'chuong-trinh-may-tinh-la-gi-1',
            featured: true
        },
        {
            id: 'other-types',
            name: 'Các loại hình khác',
            price: 'Liên hệ',
            currency: '',
            image: 'https://luattaga.vn/wp-content/uploads/2023/07/book-on-wooden-table-1565317730961314739093-e1690767356209.jpeg',
            imageAlt: 'book-on-wooden-table-1565317730961314739093'
        }
    ];
    return (
        <>
            <HeroService
                title="Đăng ký bảo hộ bản quyền"
                subtitle="ToTo Law"
                description="Tư vấn bởi đội ngũ Luật Sư có chuyên môn và kinh nghiệm trong lĩnh vực bảo hộ bản quyền."
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
                steps={steps}
                layout="simple"
            />
            <PricingComponent
                title="CHI PHÍ ĐĂNG KÝ TẠI TAGA LAW"
                plans={artworkPlans}
                variant="card"
                backgroundColor="bg-gray-50"
            />
            <ConsultationForm />
            <PartnersCarousel />
        </>
    )
}
