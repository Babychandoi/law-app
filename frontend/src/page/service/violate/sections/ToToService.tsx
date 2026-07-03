import React from 'react';
import { ShoppingCart, Shield, Mail, FileText } from 'lucide-react';

// Define types for service items
interface ServiceItem {
  id: number;
  title: string;
  icon: string;
  color: 'blue' | 'emerald' | 'purple';
}

interface ToToServicesProps {
  title?: string;
  services?: ServiceItem[];
  showNumbering?: boolean;
}

// Default services data
const defaultServices: ServiceItem[] = [
  {
    id: 1,
    title: 'Thủ tục phản đối đơn đăng ký bảo hộ nhãn hiệu tại Việt Nam.',
    icon: 'shield',
    color: 'blue',
  },
  {
    id: 2,
    title: 'Hỗ trợ gửi thư khuyến cáo đến các đối tượng xâm phạm về quyền sở hữu nhãn hiệu.',
    icon: 'mail',
    color: 'emerald',
  },
  {
    id: 3,
    title:
      'Hỗ trợ gửi công văn đến cơ quan nhà nước có thẩm quyền yêu cầu áp dụng các biện pháp xử phạt đối với các đối tượng xâm phạm quyền sở hữu trí tuệ.',
    icon: 'fileText',
    color: 'purple',
  },
];

// Icon mapping
const getIcon = (iconType: 'shield' | 'mail' | 'fileText' | 'cart') => {
  const icons = {
    shield: Shield,
    mail: Mail,
    fileText: FileText,
    cart: ShoppingCart,
  };
  return icons[iconType] || Shield;
};

// Color classes
const getColorClasses = (color: 'blue' | 'emerald' | 'purple') => {
  const colors = {
    blue: {
      bg: 'bg-brand-surface',
      border: 'border-brand-line',
      icon: 'text-brand-goldDark',
      accent: 'bg-brand-goldDark',
      gradient: ' ',
      shadow: 'shadow-brand-gold/20',
      number: 'bg-brand-goldDark text-white',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      accent: 'bg-emerald-600',
      gradient: ' ',
      shadow: 'shadow-emerald-200/50',
      number: 'bg-emerald-600 text-white',
    },
    purple: {
      bg: 'bg-brand-surface',
      border: 'border-brand-line',
      icon: 'text-brand-goldDark',
      accent: 'bg-brand-goldDark',
      gradient: ' ',
      shadow: 'shadow-brand-gold/20',
      number: 'bg-brand-goldDark text-white',
    },
  };
  return colors[color];
};

// Service Item Component
const ServiceItemComponent: React.FC<{
  service: ServiceItem;
  showNumbering: boolean;
  index: number;
}> = ({ service, showNumbering, index }) => {
  const IconComponent = getIcon(service.icon as 'shield' | 'mail' | 'fileText' | 'cart');
  const colorClasses = getColorClasses(service.color);

  return (
    <div
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl p-6 shadow-soft  hover:shadow-soft transition-all duration-200  group ${colorClasses.shadow}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start space-x-4">
        {/* Number Badge */}
        {showNumbering && (
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClasses.number} flex items-center justify-center font-bold text-sm shadow-sm`}
          >
            {service.id}
          </div>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="relative inline-block">
            <div
              className={`absolute inset-0 bg-brand-surface ${colorClasses.gradient} rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
            ></div>
            <div
              className={`relative w-12 h-12 bg-brand-surface ${colorClasses.gradient} rounded-lg flex items-center justify-center shadow-sm  transition-transform duration-300`}
            >
              <IconComponent className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors duration-200">
            {service.title}
          </p>
        </div>
      </div>

      {/* Hover Effect Line */}
      <div className="mt-4 overflow-hidden">
        <div
          className={`w-0 h-0.5 bg-brand-surface ${colorClasses.gradient} group-hover:w-full transition-all duration-200 ease-out`}
        ></div>
      </div>
    </div>
  );
};

// Main Component
const ToToLawServices: React.FC<ToToServicesProps> = ({
  title = 'CÁC DỊCH VỤ MÀ LUẬT POIP CUNG CẤP',
  services = defaultServices,
  showNumbering = true,
}) => {
  return (
    <div className="min-h-screen bg-brand-surface    py-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-brand-goldDark rounded-full blur-lg opacity-30 "></div>
                <div className="relative w-24 h-24 bg-brand-goldDark rounded-full flex items-center justify-center shadow-soft">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-ink mb-4 leading-tight">
                {title}
              </h1>

              <div className="w-24 h-1 bg-brand-goldDark mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Services List Section */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="space-y-6">
              {services.map((service, index) => (
                <ServiceItemComponent
                  key={service.id}
                  service={service}
                  showNumbering={showNumbering}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white/80  rounded-xl p-8 shadow-soft border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Cam kết chất lượng dịch vụ
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Poip Legal Law cam kết cung cấp dịch vụ pháp lý chuyên nghiệp, uy tín và hiệu quả nhất
                  cho khách hàng trong lĩnh vực sở hữu trí tuệ.
                </p>
                <button
                  type="button"
                  className="bg-brand-goldDark text-white px-8 py-3 rounded-full font-semibold hover:shadow-sm  transition-all duration-300"
                  onClick={() => {
                    const contactForm = document.getElementById('contact-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Liên hệ tư vấn
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ToToLawServices;
