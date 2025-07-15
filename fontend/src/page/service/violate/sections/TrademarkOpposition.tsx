import React, { useEffect, useState } from 'react';
import { FastForward, FileText } from 'lucide-react';
import { UniversalProcess } from '../../../../component/service/UniversalProcess';
import { ProcessTimeline } from '../../../../component/service/ProcessTimeLine';
import { Process, ProcessStep } from '../../../../types/service';
import { getProcessByServiceId, getProcessTimeLineByServiceId } from '../../../../service/service';
import { useLocation } from 'react-router-dom';

const TrademarkOpposition: React.FC = () => {

  const additionalSections = [
    {
      icon: FileText,
      title: 'TÀI LIỆU CẦN CUNG CẤP',
      content: ' 01 Giấy ủy quyền phản đối đơn nhãn hiệu (theo mẫu).\n Tài liệu chứng minh căn cứ phản đối.',
      iconBgClass: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    }
  ]
  const location = useLocation();
  const id = location.state?.id;
  const [process, setProcess] = useState<Process[]>([]);
  const [processTineLine, setProcessTimeLine] = useState<ProcessStep[]>([]);
  useEffect(() => {
    const fetchProcessTimeLine = async () => {
      try {
        if (id) {
          const response = await getProcessTimeLineByServiceId(id);
          setProcessTimeLine(response.data);
        } else {
          console.error('Service ID is undefined');
        }
      } catch (error) {
        console.error('Failed to fetch process:', error);
      }
    }
    fetchProcessTimeLine()
  }, [id]);

  useEffect(() => {
    const fetchProcess = async () => {
      try {
        if (id) {
          const response = await getProcessByServiceId(id);
          response.data.sort(
            (a, b) => a.step.localeCompare(b.step)
          )
          setProcess(response.data);
        } else {
          console.error('Service ID is undefined');
        }
      } catch (error) {
        console.error('Failed to fetch process:', error);
      }
    };
    fetchProcess();
  }, [id]);

  return (
    <div className='w-full'>
      {/* Main Title Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 shadow-lg">
              <FastForward className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-800 uppercase tracking-wide leading-tight">
              THỦ TỤC PHẢN ĐỐI ĐƠN ĐĂNG KÝ
              <>
                <br />
                <span className="text-blue-600">BẢO HỘ NHÃN HIỆU</span>
              </>
            </h2>
          </div>
        </div>
      </section>
      <UniversalProcess
        title="QUY TRÌNH PHẢN ĐỐI ĐƠN"
        steps={process} />
      <ProcessTimeline
        title="THỜI GIAN THỰC HIỆN"
        subtitle=""
        steps={processTineLine}
        layout="horizontal"
        showConnectors={true}
      />
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