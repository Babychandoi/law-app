import React, { useState } from 'react';
import { FastForward, FileText } from 'lucide-react';
import { UniversalProcess } from '../../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../../component/service/ProcessTimeLine';
import { Process, ProcessStep } from '../../../../types/service';

const TrademarkOpposition: React.FC = () => {

  const additionalSections = [
    {
      icon: FileText,
      title: 'TÀI LIỆU CẦN CUNG CẤP',
      content: ' 01 Giấy ủy quyền phản đối đơn nhãn hiệu (theo mẫu).\n Tài liệu chứng minh căn cứ phản đối.',
      iconBgClass: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    }
  ]
  const [process] = useState<Process[]>([
  {
    id: "7b37d31b-5432-4f61-8a8f-195c7dc6a2a8",
    step: "Bước 1",
    title: "Tiếp nhận hồ sơ",
    description: "Kiểm tra và tiếp nhận đơn phản đối từ khách hàng",
    details: []
  },
  {
    id: "7202779b-eb6f-4e3e-b4e9-fa796b849223",
    step: "Bước 2",
    title: "Xử lý đơn",
    description: "Thẩm định và xử lý đơn phản đối theo quy định",
    details: []
  },
  {
    id: "7e6e9e34-57d3-43e9-925c-3c0593bfa4f3",
    step: "Bước 3",
    title: "Kết quả",
    description: "Thông báo kết quả xử lý đơn phản đối",
    details: []
  }
]);
  const [processTineLine] = useState<ProcessStep[]>([
  {
    title: "", // Tên bước không có (có thể để trống hoặc thêm tiêu đề nếu cần)
    description: "Thời gian để Cục SHTT xem xét yêu cầu phản đối đơn đăng ký nhãn hiệu là từ 06-09 tháng kể từ ngày nộp hồ sơ.",
    color: "orange",
    duration: "6 - 9 tháng",
    icon: "clock"
  }
]);
  return (
    <div className='w-full'>
      {/* Main Container - Everything within one cohesive section */}
      <div className="bg-gradient-to-b from-blue-50 via-indigo-50 to-gray-50 min-h-screen">
        {/* Main Title Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 shadow-lg">
                <FastForward className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-gray-800 uppercase tracking-wide leading-tight">
                THỦ TỤC PHẢN ĐỐI ĐƠN ĐĂNG KÝ
                <>
                  <br />
                  <span className="text-blue-600">BẢO HỘ NHÃN HIỆU</span>
                </>
              </h1>
            </div>
          </div>
        </section>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 space-y-12 pb-16">
          
          {/* Process Steps */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <UniversalProcess
              title="QUY TRÌNH PHẢN ĐỐI ĐƠN"
              steps={process} />
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <ProcessTimeline
              title="THỜI GIAN THỰC HIỆN"
              subtitle=""
              steps={processTineLine}
              layout="horizontal"
              showConnectors={true}
            />
          </div>

          {/* Additional Sections */}
          {additionalSections && additionalSections.length > 0 && (
            <div className="space-y-8">
              {additionalSections.map((section, index) => {
                const SectionIcon = section.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="p-8 md:p-12">
                      <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className={`inline-flex items-center justify-center w-16 h-16 ${section.iconBgClass || 'bg-gradient-to-r from-blue-500 to-indigo-500'} rounded-full shadow-md`}>
                            <SectionIcon className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 uppercase tracking-wide">
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrademarkOpposition;