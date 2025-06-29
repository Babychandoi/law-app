import React from 'react';
import { ArrowRight, Users, FileText, CheckCheck } from 'lucide-react';

const RegistrationProcess = ({ 
  title = "QUY TRÌNH ĐĂNG KÝ TẠI TOTO LAW",
  steps = [
    {
      id: 1,
      title: "BƯỚC 1",
      description: "ToTo Law tiếp nhận yêu cầu dịch vụ và tiến hành tư vấn dịch vụ",
      icon: Users,
      color: "blue" as "blue" | "green" | "purple" | "red" | "yellow" | "indigo"
    },
    {
      id: 2,
      title: "BƯỚC 2", 
      description: "Ký kết Hợp đồng và Khách hàng cung cấp giấy tờ theo yêu cầu cho ToTo Law",
      icon: FileText,
      color: "green" as "blue" | "green" | "purple" | "red" | "yellow" | "indigo"
    },
    {
      id: 3,
      title: "BƯỚC 3",
      description: "ToTo Law tiến hành đăng ký bản quyền và bàn giao kết quả cho Khách hàng", 
      icon: CheckCheck,
      color: "purple" as "blue" | "green" | "purple" | "red" | "yellow" | "indigo"
    }
  ]
}) => {
  const getColorClasses = (color: keyof typeof colors) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      red: { bg: "bg-red-100", text: "text-red-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
      indigo: { bg: "bg-indigo-100", text: "text-indigo-600" }
    };
    return colors[color] || colors.blue;
  };

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
        </div>
      </div>

      {/* Steps Section */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => {
            const IconComponent = step.icon;
            const colorClasses = getColorClasses(step.color);
            
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
                      {step.title}
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
    </div>
  );
};

export default RegistrationProcess;