import React from 'react';
import { ArrowRight, Users, FileText, CheckCheck } from 'lucide-react';

const RegistrationProcess = ({
  title = 'QUY TRÌNH ĐĂNG KÝ TẠI POIP LAW',
  steps = [
    {
      id: 1,
      title: 'BƯỚC 1',
      description: 'Poip Legal Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ',
      icon: Users,
      color: 'blue' as 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo',
    },
    {
      id: 2,
      title: 'BƯỚC 2',
      description: 'Ký kết Hợp đồng và Khách hàng cung cấp giấy tờ theo yêu cầu cho Poip Legal Law',
      icon: FileText,
      color: 'green' as 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo',
    },
    {
      id: 3,
      title: 'BƯỚC 3',
      description: 'Poip Legal Law tiến hành đăng ký bản quyền và bàn giao kết quả cho Khách hàng',
      icon: CheckCheck,
      color: 'purple' as 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo',
    },
  ],
}) => {
  const getColorClasses = (color: keyof typeof colors) => {
    const colors = {
      blue: { bg: 'bg-brand-surface', text: 'text-brand-goldDark' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-brand-surface', text: 'text-brand-goldDark' },
      red: { bg: 'bg-red-100', text: 'text-red-600' },
      yellow: { bg: 'bg-brand-surface', text: 'text-brand-goldDark' },
      indigo: { bg: 'bg-brand-surface', text: 'text-brand-goldDark' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-gray-50 py-16">
      {/* Header Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-goldDark text-white rounded-full mb-6">
            <ArrowRight className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const IconComponent = step.icon;
            const colorClasses = getColorClasses(step.color);

            return (
              <div
                key={step.id}
                className="bg-white rounded-lg shadow-sm p-8 hover:shadow-soft transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center`}
                    >
                      <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">{step.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RegistrationProcess;
