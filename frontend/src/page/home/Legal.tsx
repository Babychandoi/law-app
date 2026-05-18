import React from 'react';
import { Scale, Shield, Lightbulb, Palette, Sword, BarChart3, FileText, Users, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceItem } from '../../types/service';

const LegalServicesSection: React.FC = () => {
  const [services] = React.useState<ServiceItem[]>([
    {
      description: "Chúng tôi cung cấp dịch vụ đăng ký bản quyền cho sách, bài báo, phim, nhạc, hình ảnh, phần mềm và nhiều loại tác phẩm khác, đảm bảo quyền lợi sáng tạo của bạn.",
      href: "/dang-ky-bao-ho-ban-quyen",
      icon: "fileText",
      id: "0c9be387-bc1b-4086-96e6-37982098389f",
      title: "Dịch vụ đăng ký bảo hộ bản quyền",
      color: "blue"
    },
    {
      description: "Dịch vụ tư vấn, đăng ký và bảo vệ sáng chế, giúp khách hàng bảo vệ ý tưởng kỹ thuật và sản phẩm một cách an toàn, hợp pháp.",
      href: "/bao-ho-sang-che-giai-phap-huu-ich",
      icon: "lightbulb",
      id: "1a424061-0090-4a4c-91e3-73b8e18b8120",
      title: "Đăng ký bảo hộ Sáng chế, giải pháp hữu ích",
      color: "yellow"
    },
    {
      description: "Luật Poip giúp giải quyết tranh chấp sở hữu trí tuệ, bảo vệ quyền lợi doanh nghiệp và cá nhân, tránh rủi ro pháp lý.",
      href: "/xu-ly-xam-pham",
      icon: "sword",
      id: "423fac48-b2da-4e2c-a959-b9574c319372",
      title: "Dịch vụ xử lý xâm phạm sở hữu trí tuệ",
      color: "red"
    },
    {
      description: "Luật Poip hỗ trợ đăng ký nhãn hiệu với quy trình đơn giản, nhanh chóng và chi phí hợp lý, giúp doanh nghiệp bảo vệ thương hiệu hiệu quả.",
      href: "/dang-ky-bao-ho-nhan-hieu",
      icon: "shield",
      id: "85b4089a-4bb7-4c03-aca0-a3512d564f38",
      title: "Dịch vụ đăng ký nhãn hiệu thương hiệu độc quyền",
      color: "green"
    },
    {
      description: "Dịch vụ đăng ký mã số mã vạch giúp doanh nghiệp quản lý sản phẩm chuyên nghiệp, thuận tiện trong kinh doanh.",
      href: "/ma-so-ma-vach",
      icon: "barChart3",
      id: "d41b35ef-d0d8-4f6f-a1c5-31add9e9515b",
      title: "Dịch vụ đăng ký mã số mã vạch",
      color: "purple"
    },
    {
      description: "Hỗ trợ đăng ký quyền sở hữu trí tuệ cho thiết kế và kiểu dáng công nghiệp, giúp doanh nghiệp bảo vệ sản phẩm của mình trên thị trường.",
      href: "/bao-ho-kieu-dang-cong-nghiep",
      icon: "palette",
      id: "ec1aa474-a597-49ad-a895-aade313aa50f",
      title: "Dịch vụ Đăng ký bảo hộ kiểu dáng công nghiệp",
      color: "pink"
    },
    {
      description: "Tư vấn và hỗ trợ đăng ký các loại giấy phép liên quan đến khoa học, công nghệ và hoạt động doanh nghiệp.",
      href: "/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe",
      icon: "scale",
      id: "fc8f620f-c2a7-43f8-befa-e9c73b939aaa",
      title: "Giấy phép Doanh nghiệp Khoa học Công nghệ",
      color: "indigo"
    },
    {
      description: "Chúng tôi cung cấp dịch vụ tư vấn và soạn thảo hợp đồng lao động, hợp đồng mua bán và nhiều loại hợp đồng khác, đảm bảo lợi ích pháp lý cho doanh nghiệp.",
      href: "/tu-van-soan-thao-hop-dong",
      icon: "users",
      id: "fe04fe2b-7659-41e1-82b9-7988e00defbd",
      title: "Dịch vụ Tư vấn soạn thảo Hợp đồng",
      color: "teal"
    }
  ]);

  const navigate = useNavigate();

  const handleServiceClick = (link: string) => {
    navigate(`${link}`);
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: { icon: string; bg: string; border: string; shadow: string; text: string } } = {
      blue: {
        icon: 'text-blue-600',
        bg: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-400/40',
        shadow: 'shadow-blue-500/30',
        text: 'text-blue-600'
      },
      yellow: {
        icon: 'text-yellow-600',
        bg: 'from-yellow-500/20 to-orange-600/20',
        border: 'border-yellow-400/40',
        shadow: 'shadow-yellow-500/30',
        text: 'text-yellow-600'
      },
      red: {
        icon: 'text-red-600',
        bg: 'from-red-500/20 to-red-600/20',
        border: 'border-red-400/40',
        shadow: 'shadow-red-500/30',
        text: 'text-red-600'
      },
      green: {
        icon: 'text-green-600',
        bg: 'from-green-500/20 to-emerald-600/20',
        border: 'border-green-400/40',
        shadow: 'shadow-green-500/30',
        text: 'text-green-600'
      },
      purple: {
        icon: 'text-purple-600',
        bg: 'from-purple-500/20 to-purple-600/20',
        border: 'border-purple-400/40',
        shadow: 'shadow-purple-500/30',
        text: 'text-purple-600'
      },
      pink: {
        icon: 'text-pink-600',
        bg: 'from-pink-500/20 to-rose-600/20',
        border: 'border-pink-400/40',
        shadow: 'shadow-pink-500/30',
        text: 'text-pink-600'
      },
      indigo: {
        icon: 'text-indigo-600',
        bg: 'from-indigo-500/20 to-indigo-600/20',
        border: 'border-indigo-400/40',
        shadow: 'shadow-indigo-500/30',
        text: 'text-indigo-600'
      },
      teal: {
        icon: 'text-teal-600',
        bg: 'from-teal-500/20 to-cyan-600/20',
        border: 'border-teal-400/40',
        shadow: 'shadow-teal-500/30',
        text: 'text-teal-600'
      }
    };
    return colors[color] || colors.blue;
  };

  const getIcon = (iconName: string, colorClass: string) => {
    const iconProps = { className: `w-12 h-12 ${colorClass}` };
    
    switch (iconName) {
      case 'scale':
        return <Scale {...iconProps} />;
      case 'shield':
        return <Shield {...iconProps} />;
      case 'lightbulb':
        return <Lightbulb {...iconProps} />;
      case 'palette':
        return <Palette {...iconProps} />;
      case 'sword':
        return <Sword {...iconProps} />;
      case 'barChart3':
        return <BarChart3 {...iconProps} />;
      case 'fileText':
        return <FileText {...iconProps} />;
      case 'users':
        return <Users {...iconProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Services Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
              <Sparkles className="text-yellow-400" size={24} />
              <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                Dịch Vụ Của Chúng Tôi
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Giải pháp toàn diện về sở hữu trí tuệ và pháp lý doanh nghiệp
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const colors = getColorClasses(service.color || 'blue');
              return (
                <div
                  key={service.id}
                  className={`group cursor-pointer p-6 bg-white rounded-2xl border-2 ${colors.border} hover:border-opacity-100 transition-all duration-500 hover:shadow-2xl hover:${colors.shadow} hover:transform hover:scale-[1.02] relative overflow-hidden`}
                  onClick={() => handleServiceClick(service.href)}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon Container */}
                    <div className="flex justify-center mb-6">
                      <div className={`relative transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 p-4 rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border}`}>
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                        <div className="relative">
                          {getIcon(service.icon, colors.icon)}
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h5 className={`text-lg font-semibold mb-4 text-gray-800 group-hover:${colors.text} transition-colors duration-300 text-center min-h-[56px] flex items-center justify-center`}>
                      {service.title}
                    </h5>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed text-center mb-4 line-clamp-4">
                      {service.description}
                    </p>

                    {/* Arrow Indicator */}
                    <div className="flex justify-center">
                      <div className={`flex items-center gap-2 ${colors.text} opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0`}>
                        <span className="text-sm font-medium">Xem chi tiết</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Custom Styles */}
      <style>{`
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LegalServicesSection;
