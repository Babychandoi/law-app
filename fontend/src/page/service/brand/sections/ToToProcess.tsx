import React from 'react';
import { Search, FileText, CheckCircle, Award, ArrowRight, Clock, Users, Shield } from 'lucide-react';

// Define types for your data
type DetailItem = {
  type: string;
  desc: string;
  accuracy?: string;
  time?: string;
};

type StepItem = {
  step: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  details: DetailItem[];
};

const ToToProcess = () => {
  const steps: StepItem[] = [
    {
      step: "BƯỚC 1",
      title: "Tra cứu khả năng bảo hộ nhãn hiệu",
      icon: <Search className="w-8 h-8" />,
      description: "Tra cứu khả năng bảo hộ nhãn hiệu là bước quan trọng để đánh giá xem nhãn hiệu dự định đăng ký có trùng hoặc tương tự với nhãn hiệu đã được bảo hộ trước đó không.",
      details: [
        {
          type: "Tra cứu sơ bộ",
          desc: "Tra cứu thông qua dữ liệu trực tuyến của Cục sở hữu trí tuệ và tổ chức Sở hữu trí tuệ thế giới, kết quả chính xác khoảng 60-70%.",
          accuracy: "60-70%"
        },
        {
          type: "Tra cứu chuyên sâu",
          desc: "Tra cứu bởi chuyên viên tại Cục sở hữu trí tuệ, kết quả chính xác khoảng 90-95%.",
          accuracy: "90-95%"
        }
      ]
    },
    {
      step: "BƯỚC 2",
      title: "Nộp hồ sơ đăng ký bảo hộ nhãn hiệu",
      icon: <FileText className="w-8 h-8" />,
      description: "ToTo Law hỗ trợ toàn bộ quá trình soạn thảo và nộp hồ sơ một cách nhanh chóng và chính xác.",
      details: [
        {
          type: "1. Soạn hồ sơ",
          desc: "ToTo Law sẽ hỗ trợ Quý Khách hàng soạn thảo bộ hồ sơ hoàn chỉnh.",
          time: "Không quá 01 ngày làm việc"
        },
        {
          type: "2. Nộp hồ sơ tại Cục Sở hữu trí tuệ",
          desc: "ToTo Law sẽ thay mặt Quý Khách hàng nộp hồ sơ.",
          time: "Không quá 01 ngày làm việc"
        }
      ]
    },
    {
      step: "BƯỚC 3",
      title: "Thẩm định đơn đăng ký",
      icon: <CheckCircle className="w-8 h-8" />,
      description: "Quá trình thẩm định được thực hiện qua 4 giai đoạn chính bởi Cục Sở hữu trí tuệ.",
      details: [
        {
          type: "Giai đoạn 1: Thẩm định hình thức",
          desc: "Thẩm định tính hợp lệ của hồ sơ đăng ký",
          time: "01-02 tháng"
        },
        {
          type: "Giai đoạn 2: Công bố đơn",
          desc: "Công bố trên Công báo sở hữu công nghiệp",
          time: "02 tháng sau khi đơn hợp lệ"
        },
        {
          type: "Giai đoạn 3: Thẩm định nội dung",
          desc: "Thẩm định khả năng đáp ứng tiêu chuẩn bảo hộ nhãn hiệu",
          time: "18-20 tháng sau công bố"
        },
        {
          type: "Giai đoạn 4: Cấp văn bằng",
          desc: "Cấp giấy chứng nhận đăng ký nhãn hiệu",
          time: "01-02 tháng"
        }
      ]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            QUY TRÌNH THỰC HIỆN TẠI TOTO LAW
          </h2>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quy trình đăng ký bảo hộ nhãn hiệu chuyên nghiệp với 3 bước đơn giản và hiệu quả
          </p>
        </div>

        {/* Process Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-1 h-12 bg-gradient-to-b from-blue-400 to-transparent z-0 hidden lg:block"></div>
              )}
              
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                {/* Step Header */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg">
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-blue-600 mb-1">{step.step}</div>
                        <h3 className="text-xl font-bold text-gray-800 leading-tight">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Step Details */}
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
              </div>

              {/* Mobile Connector */}
              {index < steps.length - 1 && (
                <div className="flex justify-center my-8 lg:hidden">
                  <ArrowRight className="w-8 h-8 text-blue-500 transform rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h3 className="text-2xl font-bold text-center mb-8">Tại sao chọn ToTo Law?</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-blue-100">Khách hàng tin tưởng</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-blue-100">Tỷ lệ thành công</div>
            </div>
            <div className="space-y-2">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold">10+</div>
              <div className="text-blue-100">Năm kinh nghiệm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToToProcess;