import { Lightbulb, CheckCircle, Zap, Target, DollarSign } from "lucide-react";

// Define types for the service features
interface ServiceFeature {
  title: string;
  description: string;
  icon: 'zap' | 'target' | 'dollar' | 'check';
  color: 'blue' | 'emerald' | 'purple';
}

// Define the data structure
const data = {
  title: "ĐĂNG KÝ BẢO HỘ SÁNG CHẾ TẠI TOTO LAW",
  
  features: [
    {
      title: "ĐƠN GIẢN - NHANH CHÓNG",
      description: "Hoàn toàn do ToTo Law thực hiện - Khách hàng chỉ việc nhận kết quả",
      icon: "zap" as 'zap',
      color: "blue" as 'blue'
    },
    {
      title: "TỶ LỆ THÀNH CÔNG LÊN ĐẾN 99%",
      description: "Hỗ trợ kiểm tra khả năng bảo hộ trước khi đăng ký",
      icon: "target" as 'target',
      color: "emerald" as 'emerald'
    },
    {
      title: "TIẾT KIỆM CHI PHÍ",
      description: "Mức phí được ToTo Law hỗ trợ tối đa - Mức phí rẻ nhất thị trường",
      icon: "dollar" as 'dollar',
      color: "purple" as 'purple'
    }
  ]
};

// Function to get the appropriate icon component
const getIcon = (iconType: 'check' | 'zap' | 'target' | 'dollar') => {
  const icons = {
    check: CheckCircle,
    zap: Zap,
    target: Target,
    dollar: DollarSign
  };
  return icons[iconType] || CheckCircle;
};

// Function to get color classes based on the color type
const getColorClasses = (color: 'blue' | 'emerald' | 'purple') => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      accent: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200"
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200", 
      icon: "text-emerald-600",
      accent: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-200"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      accent: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-200"
    }
  };
  return colors[color];
};

// Feature Card Component
const FeatureCard: React.FC<{ feature: ServiceFeature; index: number }> = ({ feature, index }) => {
  const IconComponent = getIcon(feature.icon);
  const colorClasses = getColorClasses(feature.color);

  return (
    <div 
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-3xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group ${colorClasses.shadow}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Icon Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
          <div className={`relative w-16 h-16 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="text-center">
        <h4 className="text-xl font-bold text-gray-800 mb-4 leading-tight group-hover:text-gray-900 transition-colors duration-200">
          {feature.title}
        </h4>
        
        <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
          {feature.description}
        </p>
      </div>

      {/* Hover Effect Line */}
      <div className="mt-6 overflow-hidden">
        <div className={`w-0 h-0.5 bg-gradient-to-r ${colorClasses.gradient} group-hover:w-full transition-all duration-500 ease-out`}></div>
      </div>
    </div>
  );
};

// Main Component
const ToToBenefits: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pt-16 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 leading-tight">
                {data.title}
              </h1>
              
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.features.map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="pb-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Tại sao chọn ToTo Law?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Với đội ngũ chuyên gia giàu kinh nghiệm và quy trình làm việc chuyên nghiệp, 
                  ToTo Law cam kết mang đến dịch vụ đăng ký bảo hộ sáng chế tốt nhất với chi phí hợp lý nhất.
                </p>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    onClick={() => {
                        const contactForm = document.getElementById('contact-form');
                        if (contactForm) {
                            contactForm.scrollIntoView({ behavior: 'smooth' });
                    }
                    }}
                >
                  Liên hệ tư vấn ngay
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ToToBenefits;
