import { ArrowDown, CheckCircle, Shield, Star, TrendingUp, DollarSign } from "lucide-react";

// Define types for the benefits
interface Benefit {
  title: string;
  icon: 'shield' | 'check' | 'star' | 'dollar' | 'trending';
  color: 'blue' | 'emerald' | 'purple' | 'orange';
  description: string;
}

// Define the data structure
const data: { title: string; benefits: Benefit[] } = {
  title: "LỢI ÍCH KHI ĐĂNG KÝ BẢO HỘ SÁNG CHẾ",
  benefits: [
    {
      title: "XÁC LẬP QUYỀN CỦA CSH ĐỐI VỚI SÁNG CHẾ",
      icon: "shield",
      color: "blue",
      description: "Bảo vệ quyền sở hữu trí tuệ của bạn một cách chính thức và pháp lý"
    },
    {
      title: "NGĂN CHẶN VIỆC SAO CHÉP VÀ BẮT CHƯỚC",
      icon: "check",
      color: "emerald",
      description: "Ngăn cản các đối thủ cạnh tranh sao chép ý tưởng sáng tạo của bạn"
    },
    {
      title: "TĂNG GIÁ TRỊ THƯƠNG HIỆU - TĂNG UY TÍN",
      icon: "star",
      color: "purple",
      description: "Nâng cao uy tín và giá trị thương hiệu trong mắt khách hàng và đối tác"
    },
    {
      title: "CƠ HỘI TIẾP CẬN TÀI NGUYÊN ĐẦU TƯ",
      icon: "dollar",
      color: "orange",
      description: "Tạo cơ hội thu hút các nhà đầu tư và nguồn vốn phát triển"
    }
  ]
};

// Function to get the appropriate icon component
const getIcon = (iconType: 'shield' | 'check' | 'star' | 'dollar' | 'trending') => {
  const icons = {
    shield: Shield,
    check: CheckCircle,
    star: Star,
    dollar: DollarSign,
    trending: TrendingUp
  };
  return icons[iconType] || CheckCircle;
};

// Function to get color classes based on the color type
const getColorClasses = (color: 'blue' | 'emerald' | 'purple' | 'orange') => {
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
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      accent: "bg-orange-600",
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-200"
    }
  };
  return colors[color];
};

// Benefit Card Component
const BenefitCard: React.FC<{ benefit: Benefit }> = ({ benefit }) => {
  const IconComponent = getIcon(benefit.icon);
  const colorClasses = getColorClasses(benefit.color);

  return (
    <div 
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-3xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 group ${colorClasses.shadow}`}
    >
      <div className="text-center mb-6">
        <div className={`relative inline-block`}>
          <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
          <div className={`relative w-16 h-16 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-4 leading-tight group-hover:text-gray-900 transition-colors duration-200">
        {benefit.title}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
        {benefit.description}
      </p>
      <div className="mt-6 overflow-hidden">
        <div className={`w-0 h-0.5 bg-gradient-to-r ${colorClasses.gradient} group-hover:w-full transition-all duration-500 ease-out`}></div>
      </div>
    </div>
  );
};

// Main Component
const PatentBenefits: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-16 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-64 right-16 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-32 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="pt-16 pb-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <ArrowDown className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                {data.title}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Benefits Grid Section */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {data.benefits.map((benefit, index) => (
                <BenefitCard key={index} benefit={benefit} />
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
                  Tại sao nên đăng ký bảo hộ sáng chế?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Việc đăng ký bảo hộ sáng chế không chỉ bảo vệ ý tưởng sáng tạo của bạn mà còn mở ra nhiều cơ hội phát triển kinh doanh, 
                  nâng cao vị thế cạnh tranh và tạo giá trị tài sản vô hình cho doanh nghiệp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatentBenefits;
