import { Lightbulb, CheckCircle, Sparkles } from "lucide-react";

// Define types for the conditions and sections
interface Condition {
  title: string;
  conditions: string[];
  color: 'blue' | 'emerald'; // Restrict color to specific values
}

interface Data {
  title: string;
  patentSection: Condition;
  utilitySolution: Condition;
}

// Data structure
const data: Data = {
  title: "ĐIỀU KIỆN BẢO HỘ SÁNG CHẾ",
  patentSection: {
    title: "Sáng chế được bảo hộ dưới hình thức cấp Bằng độc quyền sáng chế nếu đáp ứng các điều kiện sau:",
    conditions: [
      "Có tính mới",
      "Có trình độ sáng tạo",
      "Có khả năng áp dụng công nghiệp",
    ],
    color: "blue",
  },
  utilitySolution: {
    title: "Sáng chế được bảo hộ dưới hình thức cấp Bằng độc quyền giải pháp hữu ích nếu đáp ứng các điều kiện sau:",
    conditions: [
      "Có tính mới",
      "Không phải là hiểu biết thông thường",
      "Có khả năng áp dụng công nghiệp",
    ],
    color: "emerald",
  },
};

// Define the return type for getColorClasses function
const getColorClasses = (color: 'blue' | 'emerald') => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      accent: "bg-blue-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      accent: "bg-emerald-600",
    },
  };
  return colors[color];
};

// Define the props for ConditionCard component
interface ConditionCardProps {
  section: Condition;
}

const ConditionCard: React.FC<ConditionCardProps> = ({ section }) => {
  const { title, conditions, color } = section;
  const colorClasses = getColorClasses(color);

  return (
    <div className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-3xl p-8 shadow-2xl backdrop-blur-sm hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 group`}>
      <div className="flex items-center mb-6">
        <div className={`w-12 h-12 ${colorClasses.accent} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <div className={`w-full h-1 ${colorClasses.accent} rounded-full`}></div>
        </div>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-6 leading-relaxed">{title}</h2>
      <div className="space-y-4">
        {conditions.map((condition: string, index: number) => (
          <div key={index} className="flex items-center group/item">
            <CheckCircle className={`w-6 h-6 ${colorClasses.icon} mr-4 group-hover/item:scale-110 transition-transform duration-200`} />
            <p className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors duration-200">{condition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PatentProtectionConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
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
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {data.title}
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <ConditionCard section={data.patentSection} />
              <ConditionCard section={data.utilitySolution} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PatentProtectionConditions;
