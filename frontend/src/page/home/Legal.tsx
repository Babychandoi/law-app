import React from 'react';
import { Scale, Shield, Lightbulb, Palette, Sword, BarChart3, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceItem } from '../../types/service';
const LegalServicesSection: React.FC = () => {
  const [services ] = React.useState<ServiceItem[]>([
  {
    description: "Chúng tôi cung cấp dịch vụ đăng ký bản quyền cho sách, bài báo, phim, nhạc, hình ảnh, phần mềm và nhiều loại tác phẩm khác, đảm bảo quyền lợi sáng tạo của bạn.",
    href: "/dang-ky-bao-ho-ban-quyen",
    icon: "fileText",
    id: "0c9be387-bc1b-4086-96e6-37982098389f",
    title: "Dịch vụ đăng ký bảo hộ bản quyền"
  },
  {
    description: "Dịch vụ tư vấn, đăng ký và bảo vệ sáng chế, giúp khách hàng bảo vệ ý tưởng kỹ thuật và sản phẩm một cách an toàn, hợp pháp.",
    href: "/bao-ho-sang-che-giai-phap-huu-ich",
    icon: "lightbulb",
    id: "1a424061-0090-4a4c-91e3-73b8e18b8120",
    title: "Đăng ký bảo hộ Sáng chế, giải pháp hữu ích"
  },
  {
    description: "Luật Poip giúp giải quyết tranh chấp sở hữu trí tuệ, bảo vệ quyền lợi doanh nghiệp và cá nhân, tránh rủi ro pháp lý.",
    href: "/xu-ly-xam-pham",
    icon: "sword",
    id: "423fac48-b2da-4e2c-a959-b9574c319372",
    title: "Dịch vụ xử lý xâm phạm sở hữu trí tuệ"
  },
  {
    description: "Luật Poip hỗ trợ đăng ký nhãn hiệu với quy trình đơn giản, nhanh chóng và chi phí hợp lý, giúp doanh nghiệp bảo vệ thương hiệu hiệu quả.",
    href: "/dang-ky-bao-ho-nhan-hieu",
    icon: "shield",
    id: "85b4089a-4bb7-4c03-aca0-a3512d564f38",
    title: "Dịch vụ đăng ký nhãn hiệu thương hiệu độc quyền"
  },
  {
    description: "Dịch vụ đăng ký mã số mã vạch giúp doanh nghiệp quản lý sản phẩm chuyên nghiệp, thuận tiện trong kinh doanh.",
    href: "/ma-so-ma-vach",
    icon: "barChart3",
    id: "d41b35ef-d0d8-4f6f-a1c5-31add9e9515b",
    title: "Dịch vụ đăng ký mã số mã vạch"
  },
  {
    description: "Hỗ trợ đăng ký quyền sở hữu trí tuệ cho thiết kế và kiểu dáng công nghiệp, giúp doanh nghiệp bảo vệ sản phẩm của mình trên thị trường.",
    href: "/bao-ho-kieu-dang-cong-nghiep",
    icon: "palette",
    id: "ec1aa474-a597-49ad-a895-aade313aa50f",
    title: "Dịch vụ Đăng ký bảo hộ kiểu dáng công nghiệp"
  },
  {
    description: "Tư vấn và hỗ trợ đăng ký các loại giấy phép liên quan đến khoa học, công nghệ và hoạt động doanh nghiệp.",
    href: "/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe",
    icon: "scale",
    id: "fc8f620f-c2a7-43f8-befa-e9c73b939aaa",
    title: "Giấy phép Doanh nghiệp Khoa học Công nghệ"
  },
  {
    description: "Chúng tôi cung cấp dịch vụ tư vấn và soạn thảo hợp đồng lao động, hợp đồng mua bán và nhiều loại hợp đồng khác, đảm bảo lợi ích pháp lý cho doanh nghiệp.",
    href: "/tu-van-soan-thao-hop-dong",
    icon: "users",
    id: "fe04fe2b-7659-41e1-82b9-7988e00defbd",
    title: "Dịch vụ Tư vấn soạn thảo Hợp đồng"
  }
]);
  const navigate = useNavigate();
 
  
  const handleServiceClick = (link: string) => {
    navigate(`${link}`);
  };
  const icon  = (iconName: string) => {
    switch (iconName) {
      case 'scale':
        return <Scale className="w-12 h-12 text-yellow-500" />;
      case 'shield':
        return <Shield className="w-12 h-12 text-yellow-500" />;
      case 'lightbulb':
        return <Lightbulb className="w-12 h-12 text-yellow-500" />;
      case 'palette':
        return <Palette className="w-12 h-12 text-yellow-500" />;
      case 'sword':
        return <Sword className="w-12 h-12 text-yellow-500" />;
      case 'barChart3':
        return <BarChart3 className="w-12 h-12 text-yellow-500" />;
      case 'fileText':
        return <FileText className="w-12 h-12 text-yellow-500" />;
      case 'users':
        return <Users className="w-12 h-12 text-yellow-500" />;
      default:
        return null;
    }
  }
  return (
    <div className="min-h-screen">
      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="text-center group cursor-pointer p-6 bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300"
                onClick={() => handleServiceClick(service.href)}
              >
                <div className="flex justify-center mb-6">
                  <div className="transform group-hover:scale-110 transition-transform duration-300 bg-yellow-50 p-4 rounded-full">
                    {icon(service.icon)}
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