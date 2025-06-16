import React from 'react';
import { Clock, RotateCcw } from 'lucide-react';

interface ProcessStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const ProcessTimeline: React.FC = () => {
  const processSteps: ProcessStep[] = [
    {
      title: "KIỂM TRA KHẢ NĂNG BẢO HỘ",
      description: "Không quá 3 ngày làm việc",
      icon: <RotateCcw className="w-8 h-8" />
    },
    {
      title: "SOẠN THẢO HỒ SƠ",
      description: "Không quá 1 ngày làm việc",
      icon: <RotateCcw className="w-8 h-8" />
    },
    {
      title: "NỘP HỒ SƠ LÊN CƠ QUAN CÓ THẨM QUYỀN",
      description: "Không quá 1 ngày làm việc",
      icon: <RotateCcw className="w-8 h-8" />
    },
    {
      title: "QUÁ TRÌNH XỬ LÝ ĐƠN",
      description: "Thẩm định hình thức: 01 tháng kể từ ngày nộp đơn - Công bố đơn: 02 tháng kể từ ngày hợp lệ hình thức - Thẩm định nội dung: 07 - 12 tháng kể từ ngày công bố đơn",
      icon: <RotateCcw className="w-8 h-8" />
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Time Implementation Section - Moved to top */}
        <div className="text-center bg-white rounded-lg p-8 shadow-lg mb-12">
          <div className="flex justify-center mb-4 text-blue-600">
            <Clock className="w-12 h-12" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            THỜI GIAN THỰC HIỆN
          </h3>
        </div>

        {/* Main Timeline Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {processSteps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex justify-center mb-4 text-blue-600">
                  {step.icon}
                </div>
                <h4 className="font-bold text-gray-800 mb-3 text-sm leading-tight">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessTimeline;