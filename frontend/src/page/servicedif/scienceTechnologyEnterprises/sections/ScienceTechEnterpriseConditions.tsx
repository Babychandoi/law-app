import React from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface ConditionItem {
  title: string;
  description?: string;
}

interface Props {
  title?: string;
  conditions?: ConditionItem[];
  headerIcon?: React.ReactNode;
  conditionIcon?: React.ReactNode;
}

const ScienceTechEnterpriseConditions: React.FC<Props> = ({
  title = "ĐIỀU KIỆN CẤP GIẤY CHỨNG NHẬN DOANH NGHIỆP KHOA HỌC VÀ CÔNG NGHỆ",
  conditions = [
    {
      title: "Được thành lập và hoạt động theo Luật doanh nghiệp"
    },
    {
      title: "Có khả năng tạo ra hoặc ứng dụng kết quả KH&CN"
    },
    {
      title: "Đáp ứng điều kiện về tỷ lệ doanh thu",
      description: "Đối với doanh nghiệp đã thành lập từ đủ 5 năm trở lên: có doanh thu từ việc sản xuất, kinh doanh sản phẩm hình thành từ kết quả KH&CN đạt tỷ lệ tối thiểu 30% trên tổng doanh thu."
    }
  ],
  headerIcon = <Lightbulb className="w-8 h-8 text-blue-600" />,
  conditionIcon = <ChevronDown className="w-6 h-6 text-blue-600" />
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
            {headerIcon}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight max-w-4xl mx-auto">
            {title}
          </h1>
        </div>
      </section>

      {/* Conditions Grid */}
      <section>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {conditions.map((condition, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    {conditionIcon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 leading-snug">
                    {condition.title}
                  </h3>
                  {condition.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {condition.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ScienceTechEnterpriseConditions;