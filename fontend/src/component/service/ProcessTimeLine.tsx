import React from 'react';
import { Clock, Search, FileText, Upload, Cog, LucideIcon } from 'lucide-react';
import { ProcessStep } from '../../types/service';

// Define types for better reusability


interface ProcessTimelineProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  layout?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
}

// Icon mapping for flexibility
const iconMap: Record<string, LucideIcon> = {
  search: Search,
  fileText: FileText,
  upload: Upload,
  cog: Cog,
  clock: Clock,
};

// Color schemes for different themes
const getColorClasses = (color: 'blue' | 'emerald' | 'purple' | 'orange') => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      accent: "bg-blue-600",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200/50"
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: "text-emerald-600",
      accent: "bg-emerald-600",
      gradient: "from-emerald-500 to-emerald-600",
      shadow: "shadow-emerald-200/50"
    },
    purple: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      icon: "text-purple-600",
      accent: "bg-purple-600",
      gradient: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-200/50"
    },
    orange: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "text-orange-600",
      accent: "bg-orange-600",
      gradient: "from-orange-500 to-orange-600",
      shadow: "shadow-orange-200/50"
    }
  };
  return colors[color];
};

// Step Card Component
const StepCard: React.FC<{
  step: ProcessStep;
  index: number;
  showConnector?: boolean;
  isLast?: boolean;
}> = ({ step, index, showConnector = false, isLast = false }) => {
  const IconComponent = iconMap[step?.icon ?? 'clock'] || Clock;
  const colorClasses = getColorClasses(step?.color || 'blue');

  return (
    <div className="relative flex flex-col items-center">

      {/* Card */}
      <div className={`${colorClasses.bg} ${colorClasses.border} border-2 rounded-3xl p-6 shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group w-full max-w-sm ${colorClasses.shadow}`}>
        {/* Icon */}
        <div className="text-center mb-4">
          <div className="relative inline-block">
            <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
            <div className={`relative w-16 h-16 bg-gradient-to-r ${colorClasses.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h4 className="text-lg font-bold text-gray-800 mb-3 leading-tight group-hover:text-gray-900 transition-colors duration-200">
            {step.title}
          </h4>

          {step.duration && (
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${colorClasses.accent} text-white`}>
              {step.duration}
            </div>
          )}

          <p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
            {step.description}
          </p>
        </div>

        {/* Hover Effect Line */}
        <div className="mt-4 overflow-hidden">
          <div className={`w-0 h-0.5 bg-gradient-to-r ${colorClasses.gradient} group-hover:w-full transition-all duration-500 ease-out`}></div>
        </div>
      </div>

      {/* Connector Line */}
      {showConnector && !isLast && (
        <div className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-gray-400 transform translate-x-6 z-0">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

// Main Reusable Component
const ProcessTimeline: React.FC<ProcessTimelineProps> = ({
  title = "THỜI GIAN THỰC HIỆN",
  subtitle,
  steps,
  layout = 'horizontal',
  showConnectors = true
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
              <Clock className="w-12 h-12 text-white" />
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {title}
          </h2>

          {subtitle && (
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Timeline Grid */}
        <div className={`grid gap-8 ${layout === 'horizontal'
            ? `grid-cols-1 md:grid-cols-${steps.length} lg:grid-cols-${steps.length}`
            : 'grid-cols-1 max-w-2xl mx-auto'
          }`}>
          {steps.map((step, index) => (
            <StepCard
              key={index}
              step={step}
              index={index}
              showConnector={showConnectors && layout === 'horizontal'}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Summary Section */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-gray-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Quy trình chuyên nghiệp
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi cam kết thực hiện quy trình một cách minh bạch,
              chuyên nghiệp và đúng thời hạn đã cam kết.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export { ProcessTimeline };
