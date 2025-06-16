import React from 'react';
import { FastForward, TrendingUp, Clock, FileText, LucideIcon } from 'lucide-react';

interface ProcessStep {
  id: number;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'indigo';
}

interface SectionData {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  backgroundClass?: string;
  iconBgClass?: string;
}

interface AdditionalSection {
  icon: LucideIcon;
  title: string;
  content: string;
  iconBgClass?: string;
}

interface TrademarkOppositionProps {
  className?: string;
  mainSection?: SectionData;
  processSection?: SectionData;
  processSteps?: ProcessStep[];
  additionalSections?: AdditionalSection[];
}

const TrademarkOpposition: React.FC<TrademarkOppositionProps> = ({ 
  className = '',
  mainSection = {
    icon: FastForward,
    title: 'THỦ TỤC PHẢN ĐỐI ĐƠN ĐĂNG KÝ',
    subtitle: 'BẢO HỘ NHÃN HIỆU',
    backgroundClass: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    iconBgClass: 'bg-blue-600'
  },
  processSection = {
    icon: TrendingUp,
    title: 'QUY TRÌNH PHẢN ĐỐI ĐƠN',
    iconBgClass: 'bg-gradient-to-r from-green-500 to-teal-500'
  },
  processSteps = [
    {
      id: 1,
      title: 'Tiếp nhận hồ sơ',
      description: 'Kiểm tra và tiếp nhận đơn phản đối từ khách hàng',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Xử lý đơn',
      description: 'Thẩm định và xử lý đơn phản đối theo quy định',
      color: 'green'
    },
    {
      id: 3,
      title: 'Kết quả',
      description: 'Thông báo kết quả xử lý đơn phản đối',
      color: 'purple'
    }
  ],
  additionalSections = [
    {
      icon: Clock,
      title: 'THỜI HẠN XỬ LÝ',
      content: 'Thời gian để Cục SHTT xem xét yêu cầu phản đối đơn đăng ký nhãn hiệu là từ 06-09 tháng kể từ ngày nộp hồ sơ.',
      iconBgClass: 'bg-gradient-to-r from-orange-500 to-red-500'
    },
    {
      icon: FileText,
      title: 'TÀI LIỆU CẦN CUNG CẤP',
      content: ' 01 Giấy ủy quyền phản đối đơn nhãn hiệu (theo mẫu).\n Tài liệu chứng minh căn cứ phản đối.',
      iconBgClass: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    }
  ]
}) => {
  
  const getColorClasses = (color: ProcessStep['color']) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const MainIcon = mainSection.icon;
  const ProcessIcon = processSection.icon;

  return (
    <div className={`w-full ${className}`}>
      {/* Main Title Section */}
      <section className={`py-16 ${mainSection.backgroundClass}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 ${mainSection.iconBgClass} rounded-full mb-6 shadow-lg`}>
              <MainIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide leading-tight">
              {mainSection.title}
              {mainSection.subtitle && (
                <>
                  <br />
                  <span className="text-blue-600">{mainSection.subtitle}</span>
                </>
              )}
            </h2>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${processSection.iconBgClass} rounded-full shadow-md`}>
                  <ProcessIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 uppercase tracking-wide">
                  {processSection.title}
                </h3>
                <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto md:mx-0 rounded-full"></div>
              </div>
            </div>

            {/* Process Steps */}
            {processSteps && processSteps.length > 0 && (
              <div className={`mt-12 grid grid-cols-1 ${processSteps.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-8`}>
                {processSteps.map((step) => (
                  <div key={step.id} className="text-center">
                    <div className={`w-12 h-12 ${getColorClasses(step.color)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="font-bold text-lg">{step.id}</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Additional Sections */}
      {additionalSections && additionalSections.length > 0 && (
        <div className="space-y-8 pb-12">
          {additionalSections.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <section key={index} className="bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 py-8">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center justify-center w-16 h-16 ${section.iconBgClass || 'bg-gradient-to-r from-blue-500 to-indigo-500'} rounded-full shadow-md`}>
                          <SectionIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 uppercase tracking-wide">
                          {section.title}
                        </h3>
                        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto md:mx-0 rounded-full mb-6"></div>
                        <div className="text-gray-700 leading-relaxed">
                          {section.content.split('\n').map((line, lineIndex) => (
                            <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrademarkOpposition;