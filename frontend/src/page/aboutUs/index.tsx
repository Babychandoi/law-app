import React from 'react';
import HeroSection from '../../component/sections/HeroSection';
import AboutSection from './sections/AboutSection';
import ServicesSection from './sections/ServicesSection';
import TeamSection from './sections/TeamSection';
import VideoSection from '../../component/VideoSection';
import ContactSection from './sections/ContactSection';
import { Service } from './types';
import { Seo } from '../../component/Seo';

const HomePage: React.FC = () => {
  const aboutContent = [
    "Dịch vụ Sở hữu trí tuệ – Luật Poip",
    "Đối tác đáng tin cậy của doanh nghiệp bạn",
    "Luật Poip tự hào là Đại diện Sở hữu công nghiệp được Cục Sở hữu trí tuệ cấp phép, đồng thời là Tổ chức tư vấn, dịch vụ quyền tác giả, quyền liên quan do Cục Bản quyền cấp phép. Chúng tôi cam kết đồng hành cùng doanh nghiệp trong việc bảo vệ tài sản trí tuệ một cách toàn diện, hợp pháp và hiệu quả.",
    "Với đội ngũ chuyên gia giàu kinh nghiệm, Luật Poip cung cấp các giải pháp tối ưu, giúp khách hàng thực hiện thủ tục đăng ký một cách nhanh chóng, chính xác, đảm bảo tiết kiệm thời gian và chi phí.",
    "Tại Luật Poip, khách hàng luôn là trung tâm của mọi hoạt động. Chúng tôi không ngừng nỗ lực để mang đến dịch vụ chất lượng cao, giúp doanh nghiệp an tâm phát triển và khẳng định vị thế trên thị trường."
  ];

  const services: Service[] = [
    {
      title: "Nhóm Sở hữu trí tuệ",
      items: [
        "Đăng ký bảo hộ nhãn hiệu, kiểu dáng, sáng chế",
        "Gia hạn văn bằng bảo hộ nhãn hiệu, kiểu dáng, sáng chế",
        "Chuyển đổi đơn đăng ký/văn bằng bảo hộ",
        "Xử lý xâm phạm quyền sở hữu trí tuệ",
        "Đăng ký bản quyền tác giả"
      ]
    },
    {
      title: "Nhóm Giấy phép",
      items: [
        "Đăng ký Mã số mã vạch",
        "Xin Giấy phép Doanh nghiệp Khoa học Công nghệ",
        "Xin Giấy phép Mạng xã hội",
        "Đăng ký/Thông báo website thương mại điện tử",
        "Thành lập Công ty/Hộ Kinh doanh"
      ]
    },
    {
      title: "Nhóm Tư vấn",
      items: [
        "Tư vấn soạn thảo Hợp đồng",
        "Tư vấn pháp lý Doanh nghiệp"
      ]
    }
  ];

  const teamContent = [
    "Tại Luật Poip, đội ngũ luật sư chuyên môn về sở hữu trí tuệ được tuyển chọn kỹ lưỡng từ các trường đại học hàng đầu tại Việt Nam và các nước khác. Các luật sư của Luật Poip đều có trình độ học vị cao, kinh nghiệm trong lĩnh vực sở hữu trí tuệ và luôn cập nhật kiến thức mới nhất.",
    "Bên cạnh đó, Luật Poip còn có đội ngũ chuyên viên tư vấn bảo hộ nhãn hiệu, bao gồm các chuyên gia nghiên cứu thị trường, thiết kế đồ họa và bảo hộ sở hữu trí tuệ. Các chuyên viên này có khả năng đánh giá sâu sắc về sự phù hợp của một nhãn hiệu với thị trường, thiết kế một logo độc đáo và thu hút khách hàng, và đăng ký bảo hộ cho các sản phẩm và dịch vụ của khách hàng.",
    "Với đội ngũ nhân sự giàu kinh nghiệm và chuyên môn cao, Luật Poip luôn cam kết mang đến cho khách hàng những dịch vụ tốt nhất về sở hữu trí tuệ và đạt được các mục tiêu kinh doanh của mình."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Seo 
        title="Về chúng tôi - Luật Poip"
        keywords='Về Luật Poip, dịch vụ pháp lý, sở hữu trí tuệ, bảo hộ nhãn hiệu, bản quyền, giấy phép, tư vấn pháp lý, luật sư sở hữu trí tuệ, Luật Poip'
        description="Luật Poip - Đại diện Sở hữu công nghiệp được cấp phép, cung cấp dịch vụ pháp lý, bảo hộ nhãn hiệu, bản quyền, giấy phép, tư vấn pháp lý cho doanh nghiệp."
      />
      <HeroSection 
        title="Dịch vụ sở hữu trí tuệ"
        subtitle="Poip Law"
      />
      <AboutSection 
        title="VỀ CHÚNG TÔI"
        content={aboutContent}
        image="/assets/images/about-law.webp"
      />
      <ServicesSection 
        title="DỊCH VỤ CỦA CHÚNG TÔI"
        services={services}
        image="/assets/images/legal-services.webp"
      />
      <TeamSection 
        title="NHÂN SỰ CỦA CHÚNG TÔI"
        content={teamContent}
        image="/assets/images/law-team.webp"
      />
      <VideoSection />
      <ContactSection 
        title="Liên hệ chúng tôi"
        buttonText="Liên hệ"
      />
    </div>
  );
};

export default HomePage;
