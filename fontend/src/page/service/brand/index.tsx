import React from 'react'
import HeroService from '../../../component/service/HeroService';
import TrademarkBrandComparison from "./sections/TrademarkBrandComparison"
import TrademarkBenefits from './sections/TrademarkBenefits';
import ToToBenefits from './sections/ToToBenefits';
import ConsultationForm from '../../../component/Consultation';
import CustomerTestimonials from './sections/CustomerTestimonials';
import PartnersCarousel from '../../../component/service/PartnersCarousel';
import { UniversalProcess } from '../../../component/service/UniversalProcess';
import PricingComponent from '../../../component/service/UniversalPricing';
import { Search, FileText, CheckCircle } from 'lucide-react';
export default function index() {
  const steps = [
    {
      id : 1,
      step: "BƯỚC 1",
      title: "Tra cứu khả năng bảo hộ nhãn hiệu",
      icon: Search ,
      description: "Tra cứu khả năng bảo hộ nhãn hiệu là bước quan trọng để đánh giá xem nhãn hiệu dự định đăng ký có trùng hoặc tương tự với nhãn hiệu đã được bảo hộ trước đó không.",
      details: [
        {
          type: "Tra cứu sơ bộ",
          desc: "Tra cứu thông qua dữ liệu trực tuyến của Cục sở hữu trí tuệ và tổ chức Sở hữu trí tuệ thế giới, kết quả chính xác khoảng 60-70%.",
          accuracy: "60-70%"
        },
        {
          type: "Tra cứu chuyên sâu",
          desc: "Tra cứu bởi chuyên viên tại Cục sở hữu trí tuệ, kết quả chính xác khoảng 90-95%.",
          accuracy: "90-95%"
        }
      ]
    },
    {
      id : 2,
      step: "BƯỚC 2",
      title: "Nộp hồ sơ đăng ký bảo hộ nhãn hiệu",
      icon: FileText ,
      description: "ToTo Law hỗ trợ toàn bộ quá trình soạn thảo và nộp hồ sơ một cách nhanh chóng và chính xác.",
      details: [
        {
          type: "1. Soạn hồ sơ",
          desc: "ToTo Law sẽ hỗ trợ Quý Khách hàng soạn thảo bộ hồ sơ hoàn chỉnh.",
          time: "Không quá 01 ngày làm việc"
        },
        {
          type: "2. Nộp hồ sơ tại Cục Sở hữu trí tuệ",
          desc: "ToTo Law sẽ thay mặt Quý Khách hàng nộp hồ sơ.",
          time: "Không quá 01 ngày làm việc"
        }
      ]
    },
    {
      id : 3,
      step: "BƯỚC 3",
      title: "Thẩm định đơn đăng ký",
      icon: CheckCircle ,
      description: "Quá trình thẩm định được thực hiện qua 4 giai đoạn chính bởi Cục Sở hữu trí tuệ.",
      details: [
        {
          type: "Giai đoạn 1: Thẩm định hình thức",
          desc: "Thẩm định tính hợp lệ của hồ sơ đăng ký",
          time: "01-02 tháng"
        },
        {
          type: "Giai đoạn 2: Công bố đơn",
          desc: "Công bố trên Công báo sở hữu công nghiệp",
          time: "02 tháng sau khi đơn hợp lệ"
        },
        {
          type: "Giai đoạn 3: Thẩm định nội dung",
          desc: "Thẩm định khả năng đáp ứng tiêu chuẩn bảo hộ nhãn hiệu",
          time: "18-20 tháng sau công bố"
        },
        {
          type: "Giai đoạn 4: Cấp văn bằng",
          desc: "Cấp giấy chứng nhận đăng ký nhãn hiệu",
          time: "01-02 tháng"
        }
      ]
    }
  ];
  const pricingPlans = [
    {
      id : "basic-plan",
      name: "Cơ bản",
      price: "2.200.000",
      currency: "VND",
      description: "Tra cứu sơ bộ và nộp đơn đăng ký nhãn hiệu cho 1 nhóm sản phẩm/dịch vụ (tối đa 6 sản phẩm/dịch vụ).",
      features: [
        "Tư vấn quy trình và thủ tục đăng ký",
        "Tra cứu sơ bộ (tối đa 5 nhãn)",
        "Tư vấn sửa đổi nhãn hiệu sau tra cứu",
        "Soạn thảo, nộp hồ sơ đăng ký nhãn hiệu",
        "Theo dõi hồ sơ sau khi đăng ký",
        "Tư vấn đặt tên thương hiệu (tối đa 3 thương hiệu)"
      ],
      featured: false
    },
    {
      id : "advanced-plan",
      name: "Nâng cao",
      price: "2.800.000",
      currency: "VND",
      description: "Tra cứu chuyên sâu và nộp đơn đăng ký nhãn hiệu cho 1 nhóm sản phẩm/dịch vụ (tối đa 6 sản phẩm/dịch vụ).",
      features: [
        "Bao gồm gói cơ bản",
        "Tra cứu chuyên sâu khả năng bảo hộ",
        "Hỗ trợ tra cứu chuyên sâu lần 2 nếu kết quả tra cứu thất bại",
        "Miễn phí phí dịch vụ lần 2 nếu bị từ chối cấp văn bằng",
        "Tư vấn sửa nhãn sau tra cứu chuyên sâu nếu có"
      ],
      featured: true
    },
    {
      id : "custom-plan",
      name: "Tùy chỉnh",
      price: "Liên hệ",
      currency: "",
      description: "Tư vấn đăng ký bảo hộ nhãn hiệu theo nhu cầu của Quý khách hàng. Vui lòng liên hệ với Luật Taga để được tư vấn chi tiết.",
      features: [
        "Bao gồm gói cơ bản",
        "Bao gồm gói nâng cao",
        "Tư vấn thiết kế nhãn hiệu, thiết kế Logo, bộ nhận diện thương hiệu",
        "Tư vấn tùy theo nhu cầu đặc biệt của quý khách hàng",
        "Liên hệ với Luật Taga để được tư vấn chi tiết"
      ],
      featured: false
    }
  ];
  return (
    <>
      <HeroService
        title="Dịch vụ sở hữu trí tuệ"
        subtitle="ToTo Law"
        description="Đội ngũ luật sư chuyên nghiệp, tư vấn và bảo vệ quyền sở hữu trí tuệ cho doanh nghiệp và cá nhân"
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
        steps={steps}
        layout="detailed"
       />
      <PricingComponent
        title="CHI PHÍ ĐĂNG KÝ BẢO HỘ NHÃN HIỆU TẠI TAGA"
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
