import React from 'react';
import { Brush, CheckCircle } from 'lucide-react';

interface ServiceItem {
  id: number;
  description: string;
}

interface Props {
  title?: string;
  services?: ServiceItem[];
  headerIcon?: React.ReactNode;
  serviceIcon?: React.ReactNode;
}

const ToToLawServices: React.FC<Props> = ({
  title = "CÔNG VIỆC LUẬT POIP THỰC HIỆN",
  services = [
    {
      id: 1,
      description: "Tra cứu hiệu lực văn bản và thủ tục theo yêu cầu của quý khách"
    },
    {
      id: 2,
      description: "Hỗ trợ và giải đáp các thắc mắc của quý khách thông qua email và điện thoại"
    },
    {
      id: 3,
      description: "Tham vấn ý kiến chuyên gia theo yêu cầu của quý khách (nếu cần)"
    },
    {
      id: 4,
      description: "Hợp tác và hướng dẫn quý khách chuẩn bị tài liệu, hồ sơ, giấy tờ"
    },
    {
      id: 5,
      description: "Hỗ trợ soạn thảo hồ sơ, giấy tờ, xác thực thông tin và đề nghị chỉnh sửa"
    },
    {
      id: 6,
      description: "Đại diện cho quý khách nộp, nhận hồ sơ, hỗ trợ việc nộp phí – lệ phí của Nhà nước"
    },
    {
      id: 7,
      description: "Đại diện và/hoặc hỗ trợ cho quý khách làm việc với cơ quan Nhà nước khi có yêu cầu, bao gồm những nội dung liên quan đến tiếp nhận, sửa đổi, bổ sung, thay thế và/hoặc loại bỏ thông tin trong hồ sơ, giấy tờ để phù hợp với pháp luật và/hoặc thông lệ làm việc."
    }
  ],
  headerIcon = <Brush className="w-8 h-8 text-emerald-600" />,
  serviceIcon = <CheckCircle className="w-5 h-5 text-emerald-500" />
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-blue-50 py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
            {headerIcon}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
            {title}
          </h1>
        </div>
      </section>

      {/* Services List */}
      <section>
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-6">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group flex items-start gap-4 p-4 rounded-xl hover:bg-emerald-50 transition-all duration-300"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                      {serviceIcon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 leading-relaxed text-justify">
                      <span className="font-semibold text-emerald-600 mr-2">
                        {service.id}.
                      </span>
                      {service.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ToToLawServices;