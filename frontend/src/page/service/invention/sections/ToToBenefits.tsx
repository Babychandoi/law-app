import { Lightbulb, CheckCircle, Zap, Target, DollarSign } from 'lucide-react';

// Define types for the service features
interface ServiceFeature {
  title: string;
  description: string;
  icon: 'zap' | 'target' | 'dollar' | 'check';
  color: 'blue' | 'emerald' | 'purple';
}

// Define the data structure
const data = {
  title: 'ĐĂNG KÝ BẢO HỘ SÁNG CHẾ TẠI POIP LAW',

  features: [
    {
      title: 'ĐƠN GIẢN - NHANH CHÓNG',
      description: 'Hoàn toàn do Poip Law thực hiện - Khách hàng chỉ việc nhận kết quả',
      icon: 'zap' as 'zap',
      color: 'blue' as 'blue',
    },
    {
      title: 'TỶ LỆ THÀNH CÔNG LÊN ĐẾN 99%',
      description: 'Hỗ trợ kiểm tra khả năng bảo hộ trước khi đăng ký',
      icon: 'target' as 'target',
      color: 'emerald' as 'emerald',
    },
    {
      title: 'TIẾT KIỆM CHI PHÍ',
      description: 'Mức phí được Poip Law hỗ trợ tối đa - Mức phí rẻ nhất thị trường',
      icon: 'dollar' as 'dollar',
      color: 'purple' as 'purple',
    },
  ],
};

// Function to get the appropriate icon component
const getIcon = (iconType: 'check' | 'zap' | 'target' | 'dollar') => {
  const icons = {
    check: CheckCircle,
    zap: Zap,
    target: Target,
    dollar: DollarSign,
  };
  return icons[iconType] || CheckCircle;
};

// Function to get color classes based on the color type
const getColorClasses = (color: 'blue' | 'emerald' | 'purple') => {
  const colors = {
    blue: {
      bg: 'bg-brand-surface',
      border: 'border-brand-line',
      icon: 'text-brand-goldDark',
      accent: 'bg-brand-goldDark',
      gradient: ' ',
      shadow: 'shadow-brand-gold/20',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      accent: 'bg-emerald-600',
      gradient: ' ',
      shadow: 'shadow-emerald-200',
    },
    purple: {
      bg: 'bg-brand-surface',
      border: 'border-brand-line',
      icon: 'text-brand-goldDark',
      accent: 'bg-brand-goldDark',
      gradient: ' ',
      shadow: 'shadow-brand-gold/20',
    },
  };
  return colors[color];
};

// Feature Card Component
const FeatureCard: React.FC<{ feature: ServiceFeature; index: number }> = ({ feature, index }) => {
  const IconComponent = getIcon(feature.icon);
  const colorClasses = getColorClasses(feature.color);

  return (
    <div
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl p-8 shadow-soft  hover:shadow-soft transition-all duration-200  group ${colorClasses.shadow}`}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Icon Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div
            className={`absolute inset-0 bg-brand-surface ${colorClasses.gradient} rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
          ></div>
          <div
            className={`relative w-16 h-16 bg-brand-surface ${colorClasses.gradient} rounded-lg flex items-center justify-center shadow-sm  transition-transform duration-300`}
          >
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
        <div
          className={`w-0 h-0.5 bg-brand-surface ${colorClasses.gradient} group-hover:w-full transition-all duration-200 ease-out`}
        ></div>
      </div>
    </div>
  );
};

// Main Component
const ToToBenefits: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-surface   ">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none"></div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pt-16 pb-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-brand-goldDark rounded-full blur-lg opacity-30 "></div>
                <div className="relative w-24 h-24 bg-brand-goldDark rounded-full flex items-center justify-center shadow-soft">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-ink mb-4 leading-tight">
                {data.title}
              </h1>

              <div className="w-24 h-1 bg-brand-goldDark mx-auto rounded-full"></div>
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
            <div className="bg-white/80  rounded-xl p-8 shadow-soft border border-gray-200">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Tại sao chọn Poip Law ?</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Với đội ngũ chuyên gia giàu kinh nghiệm và quy trình làm việc chuyên nghiệp, Poip
                  Law cam kết mang đến dịch vụ đăng ký bảo hộ sáng chế tốt nhất với chi phí hợp lý
                  nhất.
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
