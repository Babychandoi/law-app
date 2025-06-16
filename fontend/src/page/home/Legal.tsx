import React from 'react';
import { Scale, Shield, Lightbulb, Palette, Sword, BarChart3, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

const LegalServicesSection: React.FC = () => {
  const navigate = useNavigate();
  const services: ServiceItem[] = [
    {
      icon: <Shield className="w-12 h-12 text-yellow-500" />,
      title: "Bảo hộ nhãn hiệu",
      description: "Luật Taga hỗ trợ đăng ký nhãn hiệu với quy trình đơn giản, nhanh chóng và chi phí hợp lý, giúp doanh nghiệp bảo vệ thương hiệu hiệu quả.",
      href: "/service/brand"
    },
    {
      icon: <FileText className="w-12 h-12 text-yellow-500" />,
      title: "Bảo hộ bản quyền",
      description: "Chúng tôi cung cấp dịch vụ đăng ký bản quyền cho sách, bài báo, phim, nhạc, hình ảnh, phần mềm và nhiều loại tác phẩm khác, đảm bảo quyền lợi sáng tạo của bạn.",
      href: "/service/copyright"
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-yellow-500" />,
      title: "Bảo hộ sáng chế",
      description: "Dịch vụ tư vấn, đăng ký và bảo vệ sáng chế, giúp khách hàng bảo vệ ý tưởng kỹ thuật và sản phẩm một cách an toàn, hợp pháp.",
      href: "/service/invention"
    },
    {
      icon: <Palette className="w-12 h-12 text-yellow-500" />,
      title: "Bảo hộ kiểu dáng công nghiệp",
      description: "Hỗ trợ đăng ký quyền sở hữu trí tuệ cho thiết kế và kiểu dáng công nghiệp, giúp doanh nghiệp bảo vệ sản phẩm của mình trên thị trường.",
      href: "/service/design"
    },
    {
      icon: <Sword className="w-12 h-12 text-yellow-500" />,
      title: "Xử lý xâm phạm",
      description: "Luật Taga giúp giải quyết tranh chấp sở hữu trí tuệ, bảo vệ quyền lợi doanh nghiệp và cá nhân, tránh rủi ro pháp lý.",
      href: "/service/violate"
    },
    {
      icon: <BarChart3 className="w-12 h-12 text-yellow-500" />,
      title: "Mã số mã vạch",
      description: "Dịch vụ đăng ký mã số mã vạch giúp doanh nghiệp quản lý sản phẩm chuyên nghiệp, thuận tiện trong kinh doanh.",
      href: "/serivceDif/barcodeNumber"
    },
    {
      icon: <Scale className="w-12 h-12 text-yellow-500" />,
      title: "Giấy phép doanh nghiệp",
      description: "Tư vấn và hỗ trợ đăng ký các loại giấy phép liên quan đến khoa học, công nghệ và hoạt động doanh nghiệp.",
      href: "/serivceDif/scienceTechnologyEnterprises"
    },
    {
      icon: <Users className="w-12 h-12 text-yellow-500" />,
      title: "Tư vấn soạn thảo hợp đồng",
      description: "Chúng tôi cung cấp dịch vụ tư vấn và soạn thảo hợp đồng lao động, hợp đồng mua bán và nhiều loại hợp đồng khác, đảm bảo lợi ích pháp lý cho doanh nghiệp.",
      href: "/serivceDif/consultationOfDraftingContracts"
    }
  ];

  const handleServiceClick = (link: string) => {
    navigate(link);
  };

  return (
    <div className="min-h-screen">
      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="text-center group cursor-pointer p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handleServiceClick(service.href)}
              >
                <div className="flex justify-center mb-6">
                  <div className="transform group-hover:scale-110 transition-transform duration-300 bg-yellow-50 p-4 rounded-full">
                    {service.icon}
                  </div>
                </div>
                <h5 className="text-lg font-semibold mb-4 text-gray-800 group-hover:text-yellow-600 transition-colors duration-300">
                  {service.title}
                </h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LegalServicesSection;