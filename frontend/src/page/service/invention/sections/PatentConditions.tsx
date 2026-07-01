import { Lightbulb, CheckCircle, Sparkles } from 'lucide-react';

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
  title: 'ĐIỀU KIỆN BẢO HỘ SÁNG CHẾ',
  patentSection: {
    title:
      'Sáng chế được bảo hộ dưới hình thức cấp Bằng độc quyền sáng chế nếu đáp ứng các điều kiện sau:',
    conditions: ['Có tính mới', 'Có trình độ sáng tạo', 'Có khả năng áp dụng công nghiệp'],
    color: 'blue',
  },
  utilitySolution: {
    title:
      'Sáng chế được bảo hộ dưới hình thức cấp Bằng độc quyền giải pháp hữu ích nếu đáp ứng các điều kiện sau:',
    conditions: [
      'Có tính mới',
      'Không phải là hiểu biết thông thường',
      'Có khả năng áp dụng công nghiệp',
    ],
    color: 'emerald',
  },
};

// Define the return type for getColorClasses function
const getColorClasses = (color: 'blue' | 'emerald') => {
  const colors = {
    blue: {
      bg: 'bg-brand-surface',
      border: 'border-brand-line',
      icon: 'text-brand-primaryDark',
      accent: 'bg-brand-primary',
    },
    emerald: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      icon: 'text-emerald-600',
      accent: 'bg-emerald-600',
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
    <div
      className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-xl p-8 shadow-soft  hover:shadow-soft transition-all duration-200  group`}
    >
      <div className="flex items-center mb-6">
        <div
          className={`w-12 h-12 ${colorClasses.accent} rounded-xl flex items-center justify-center shadow-sm  transition-transform duration-300`}
        >
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
            <CheckCircle
              className={`w-6 h-6 ${colorClasses.icon} mr-4 group-hover/item:scale-110 transition-transform duration-200`}
            />
            <p className="text-gray-700 font-medium group-hover/item:text-gray-900 transition-colors duration-200">
              {condition}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const PatentProtectionConditions: React.FC = () => {
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
                <div className="absolute inset-0 bg-brand-primary rounded-full blur-lg opacity-30 "></div>
                <div className="relative w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center shadow-soft">
                  <Lightbulb className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-brand-ink mb-4">{data.title}</h1>
              <div className="w-24 h-1 bg-brand-primary mx-auto rounded-full"></div>
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
