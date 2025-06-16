import React from 'react';
import {  ArrowRight, Clock,  } from 'lucide-react';

// Define types for data
type DetailItem = {
  type: string;
  desc: string;
  accuracy?: string;
  time?: string;
};

type StepItem = {
  id: number;
  step: string;
  title: string;
  icon: any;
  description: string;
  details?: DetailItem[];
};

type StatItem = {
  icon: any;
  value: string;
  label: string;
};

const UniversalProcess = ({
  title,
  subtitle = "",
  layout = "simple", // "simple" or "detailed"
  steps,
  statistics = [],
  statisticsTitle = "Tại sao chọn chúng tôi?"
}: {
  title: string; // Bắt buộc phải truyền
  subtitle?: string;
  layout?: "simple" | "detailed";
  steps: StepItem[]; // Bắt buộc phải truyền
  statistics?: StatItem[];
  statisticsTitle?: string;
}) => {
  const getColorClasses = (color: keyof typeof colors) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600", gradient: "from-blue-500 to-indigo-500", border: "border-blue-500" },
      green: { bg: "bg-green-100", text: "text-green-600", gradient: "from-green-500 to-emerald-500", border: "border-green-500" },
      purple: { bg: "bg-purple-100", text: "text-purple-600", gradient: "from-purple-500 to-indigo-500", border: "border-purple-500" },
      red: { bg: "bg-red-100", text: "text-red-600", gradient: "from-red-500 to-pink-500", border: "border-red-500" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600", gradient: "from-yellow-500 to-orange-500", border: "border-yellow-500" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600", gradient: "from-indigo-500 to-purple-500", border: "border-indigo-500" }
    };
    return colors[color] || colors.blue;
  };

  // Simple Layout
  if (layout === "simple") {
    return (
      <div className="bg-gray-50 py-16">
        {/* Header Section */}
        <div className="container mx-auto px-4 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6">
              <ArrowRight className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">
              {title}
            </h2>
            {subtitle && (
              <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Steps Section */}
        <div className="container mx-auto px-4">
          <div className={`grid grid-cols-1 md:grid-cols-${steps.length} gap-8`}>
            {steps.map((step) => {
              const IconComponent = step.icon;
              const colorClasses = getColorClasses("blue");
              
              return (
                <div key={step.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">
                        {step.step}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics Section */}
        {statistics.length > 0 && (
          <div className="container mx-auto px-4 mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold text-center mb-8">{statisticsTitle}</h3>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                {statistics.map((stat, index) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                        <StatIcon className="w-8 h-8" />
                      </div>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="text-blue-100">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Detailed Layout
  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {title}
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6"></div>
          {subtitle && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Process Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const colorClasses = getColorClasses("blue");
            
            return (
              <div key={step.id} className="relative">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-1 h-12 bg-gradient-to-b from-blue-400 to-transparent z-0 hidden lg:block"></div>
                )}
                
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                  {/* Step Header */}
                  <div className="lg:col-span-1">
                    <div className={`bg-white rounded-2xl p-6 shadow-lg border-l-4 ${colorClasses.border}`}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${colorClasses.gradient} rounded-full flex items-center justify-center text-white shadow-lg`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div>
                          <div className={`text-sm font-semibold ${colorClasses.text} mb-1`}>{step.step}</div>
                          <h3 className="text-xl font-bold text-gray-800 leading-tight">{step.title}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>

                  {/* Step Details */}
                  {step.details && step.details.length > 0 && (
                    <div className="lg:col-span-2">
                      <div className="grid gap-4">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-bold text-gray-800 text-lg">{detail.type}</h4>
                              {detail.accuracy && (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                                  {detail.accuracy}
                                </span>
                              )}
                              {detail.time && (
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {detail.time}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 leading-relaxed">{detail.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Connector */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center my-8 lg:hidden">
                    <ArrowRight className="w-8 h-8 text-blue-500 transform rotate-90" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Statistics Section */}
        {statistics.length > 0 && (
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">{statisticsTitle}</h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {statistics.map((stat, index) => {
                const StatIcon = stat.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                      <StatIcon className="w-8 h-8" />
                    </div>
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-blue-100">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export { UniversalProcess };