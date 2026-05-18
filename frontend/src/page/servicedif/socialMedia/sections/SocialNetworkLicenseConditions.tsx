import React, { useState } from 'react';
import { Copy, Building, Users, Globe, Shield, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface SubCondition {
  id: string;
  content: string;
}

interface Condition {
  id: number;
  title: string;
  content?: string;
  subConditions?: SubCondition[];
  icon?: React.ReactNode;
}

interface Props {
  title?: string;
  conditions?: Condition[];
  headerIcon?: React.ReactNode;
}

const SocialNetworkLicenseConditions: React.FC<Props> = ({
  title = "ĐIỀU KIỆN ĐƯỢC CẤP GIẤY PHÉP THIẾT LẬP MẠNG XÃ HỘI",
  headerIcon = <Copy className="w-8 h-8 text-indigo-600" />,
  conditions = [
    {
      id: 1,
      title: "Tổ chức, doanh nghiệp hợp pháp",
      content: "Là tổ chức, doanh nghiệp được thành lập theo pháp luật Việt Nam có chức năng, nhiệm vụ hoặc ngành nghề đăng ký kinh doanh phù hợp với dịch vụ và nội dung thông tin cung cấp đã được đăng tải trên Cổng thông tin quốc gia về đăng ký doanh nghiệp.",
      icon: <Building className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 2,
      title: "Có tổ chức, nhân sự đáp ứng theo quy định",
      icon: <Users className="w-5 h-5 text-indigo-500" />,
      subConditions: [
        {
          id: "2.1",
          content: "Điều kiện về nhân sự chịu trách nhiệm quản lý nội dung thông tin:\na) Có ít nhất 01 nhân sự chịu trách nhiệm quản lý nội dung thông tin là người có quốc tịch Việt Nam hoặc đối với người nước ngoài có thẻ tạm trú do cơ quan có thẩm quyền cấp còn thời hạn ít nhất 06 tháng tại Việt Nam kể từ thời điểm nộp hồ sơ;\nb) Có bộ phận quản lý nội dung thông tin."
        },
        {
          id: "2.2",
          content: "Có ít nhất 01 nhân sự quản lý nội dung thông tin và 01 nhân sự quản lý kỹ thuật."
        }
      ]
    },
    {
      id: 3,
      title: "Đăng ký tên miền và đáp ứng quy định",
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      subConditions: [
        {
          id: "3.1",
          content: "Đối với tổ chức, doanh nghiệp không phải là cơ quan báo chí, dãy ký tự tạo nên tên miền không được giống hoặc trùng với tên cơ quan báo chí."
        },
        {
          id: "3.2",
          content: "Trang thông tin điện tử tổng hợp, mạng xã hội sử dụng ít nhất 01 tên miền \".vn\" và lưu giữ thông tin tại hệ thống máy chủ có địa chỉ IP ở Việt Nam."
        },
        {
          id: "3.3",
          content: "Trang thông tin điện tử tổng hợp và mạng xã hội của cùng tổ chức, doanh nghiệp không được sử dụng cùng tên miền có dãy ký tự giống nhau (bao gồm cả tên miền thứ cấp, ví dụ: forum.vnn.vn, news.vnn.vn là tên miền có dãy ký tự khác nhau)."
        },
        {
          id: "3.4",
          content: "Tên miền phải tuân thủ quy định về quản lý và sử dụng tài nguyên Internet. Đối với tên miền quốc tế phải có xác nhận sử dụng tên miền hợp pháp."
        }
      ]
    },
    {
      id: 4,
      title: "Đáp ứng các điều kiện về kỹ thuật theo quy định",
      icon: <Settings className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 5,
      title: "Có biện pháp bảo đảm an toàn thông tin, an ninh thông tin và quản lý thông tin theo quy định",
      icon: <Shield className="w-5 h-5 text-indigo-500" />
    }
  ]
}) => {
  const [expandedConditions, setExpandedConditions] = useState<Set<number>>(new Set());

  const toggleCondition = (conditionId: number) => {
    const newExpanded = new Set(expandedConditions);
    if (newExpanded.has(conditionId)) {
      newExpanded.delete(conditionId);
    } else {
      newExpanded.add(conditionId);
    }
    setExpandedConditions(newExpanded);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 py-16">
      {/* Header */}
      <section className="mb-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
            {headerIcon}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-800 leading-tight max-w-4xl mx-auto">
            {title}
          </h1>
        </div>
      </section>

      {/* Conditions */}
      <section>
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-6">
            {conditions.map((condition) => (
              <div
                key={condition.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  {/* Main Condition */}
                  <div 
                    className={`flex items-start gap-4 mb-4 ${
                      condition.subConditions ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => condition.subConditions && toggleCondition(condition.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        {condition.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-indigo-800 mb-2">
                          {condition.id}. {condition.title}
                        </h3>
                        {condition.subConditions && (
                          <div className="ml-4 flex-shrink-0">
                            {expandedConditions.has(condition.id) ? (
                              <ChevronDown className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-indigo-600 transition-transform duration-200" />
                            )}
                          </div>
                        )}
                      </div>
                      {condition.content && (
                        <p className="text-gray-700 leading-relaxed text-justify">
                          {condition.content}
                        </p>
                      )}
                      {condition.subConditions && !expandedConditions.has(condition.id) && (
                        <p className="text-sm text-indigo-600 mt-2 font-medium">
                          Nhấp để xem chi tiết ({condition.subConditions.length} mục)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sub Conditions - Collapsible */}
                  {condition.subConditions && expandedConditions.has(condition.id) && (
                    <div className="ml-14 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      {condition.subConditions.map((subCondition, index) => (
                        <div
                          key={subCondition.id}
                          className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-200 transform transition-all duration-200"
                          style={{
                            animationDelay: `${index * 50}ms`
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <span className="font-semibold text-indigo-600 text-sm flex-shrink-0">
                              {subCondition.id}.
                            </span>
                            <p className="text-gray-700 text-sm leading-relaxed text-justify whitespace-pre-line">
                              {subCondition.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
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

export default SocialNetworkLicenseConditions;