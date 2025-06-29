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
    title: "Thủ tục phản đối đơn đăng ký bảo hộ nhãn hiệu tại Việt Nam.",
    icon: "shield",
    color: "blue"
  },
  {
    id: 2,
    title: "Hỗ trợ gửi thư khuyến cáo đến các đối tượng xâm phạm về quyền sở hữu nhãn hiệu.",
    icon: "mail",
    color: "emerald"
  },
  {
    id: 3,
    title: "Hỗ trợ gửi công văn đến cơ quan nhà nước có thẩm quyền yêu cầu áp dụng các biện pháp xử phạt đối với các đối tượng xâm phạm quyền sở hữu trí tuệ.",
    icon: "fileText",
    color: "purple"
  }
];

// Icon mapping
const getIcon = (iconType: 'shield' | 'mail' | 'fileText' | 'cart') => {
  const icons = {
    shield: Shield,
    mail: Mail,
    fileText: FileText,
    cart: ShoppingCart
  };
  return icons[iconType] || Shield;
};

// Color classes
const getColorClasses = (color: 'blue' | 'emerald' | 'purple') => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      accent: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200/50",
      number: "bg-blue-600 text-white"
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200", 
      icon: "text-emerald-600",
      accent: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-200/50",
      number: "bg-emerald-600 text-white"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      accent: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-200/50",
      number: "bg-purple-600 text-white"
    }
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
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-3xl p-6 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group ${colorClasses.shadow}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      <div className="flex items-start space-x-4">
        {/* Number Badge */}
        {showNumbering && (
          <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colorClasses.number} flex items-center justify-center font-bold text-sm shadow-lg`}>
            {service.id}
          </div>
        )}

        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            <div className={`relative w-12 h-12 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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
        <div className={`w-0 h-0.5 bg-gradient-to-r ${colorClasses.gradient} group-hover:w-full transition-all duration-500 ease-out`}></div>
      </div>
    </div>
  );
};

// Main Component
const ToToLawServices: React.FC<ToToServicesProps> = ({
  title = "CÁC DỊCH VỤ MÀ LUẬT TOTO CUNG CẤP",
  services = defaultServices,
  showNumbering = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <ShoppingCart className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
                {title}
              </h1>
              
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
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
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Cam kết chất lượng dịch vụ
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  ToTo Law cam kết cung cấp dịch vụ pháp lý chuyên nghiệp, 
                  uy tín và hiệu quả nhất cho khách hàng trong lĩnh vực sở hữu trí tuệ.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
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
