import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Shield, Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const TrademarkBrandComparison = () => {
  const [activeTab, setActiveTab] = useState('comparison');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);

  const toggleExpanded = (section: number | null) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  interface ComparisonCardProps {
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    content: { label: string; value: string }[];
    isProtected: boolean;
    color: string;
  }

  const ComparisonCard = ({ title, icon: Icon, content, isProtected, color }: ComparisonCardProps) => (
    <div className={`bg-white rounded-xl shadow-lg border-l-4 ${color} p-6 transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center mb-4">
        <Icon className={`w-8 h-8 mr-3 ${isProtected ? 'text-green-600' : 'text-orange-600'}`} />
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        {isProtected ? (
          <Shield className="w-6 h-6 ml-auto text-green-600" />
        ) : (
          <Users className="w-6 h-6 ml-auto text-orange-600" />
        )}
      </div>
      <div className="space-y-3">
        {content.map((item, index) => (
          <div key={index} className="text-gray-700">
            <strong className="text-gray-900">{item.label}:</strong> {item.value}
          </div>
        ))}
      </div>
    </div>
  );

  const ConditionCard = ({ number, title, description, isExpanded, onToggle }: { number: string; title: string; description: string; isExpanded: boolean; onToggle: () => void }) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center">
          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
            {number}
          </div>
          <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </div>
      {isExpanded && (
        <div className="mt-3 pl-11 text-gray-700 text-sm">
          {description}
        </div>
      )}
    </div>
  );

  const trademarkData = {
    title: "NHÃN HIỆU LÀ GÌ?",
    subtitle: "",
    icon: Lightbulb,
    isProtected: true,
    color: "border-green-500",
    content: [
      {
        label: "Định nghĩa",
        value: "Nhãn hiệu (marks) theo định nghĩa tại Khoản 16 Điều 4 Luật Sở hữu trí tuệ sửa đổi 2009 là dấu hiệu dùng để phân biệt hàng hoá, dịch vụ của các tổ chức, cá nhân khác nhau."
      }
    ]
  };

  const brandData = {
    title: "THƯƠNG HIỆU LÀ GÌ?",
    subtitle: "",
    icon: Users,
    isProtected: false,
    color: "border-orange-500",
    content: [
      {
        label: "Định nghĩa",
        value: "Thương hiệu (brands) theo định nghĩa của Tổ chức sở hữu trí tuệ thế giới (WIPO): là một dấu hiệu (hữu hình và vô hình) đặc biệt để nhận biết một sản phẩm hàng hoá hay một dịch vụ nào đó được sản xuất hay được cung cấp bởi một cá nhân hay một tổ chức."
      },
      {
        label: "Lưu ý quan trọng",
        value: "Tuy nhiên Thương hiệu không được pháp luật bảo hộ mà chỉ được xã hội và người tiêu dùng công nhận. Pháp luật Việt Nam cho phép đăng ký và bảo hộ độc quyền đối với nhãn hiệu."
      }
    ]
  };

  const conditions = [
    {
      number: "1",
      title: "Là dấu hiệu nhìn thấy được dưới dạng:",
      description: "Chữ cái, từ ngữ, hình vẽ, hình ảnh, hình ba chiều hoặc sự kết hợp các yếu tố đó, được thể hiện bằng một hoặc nhiều màu sắc hoặc dấu hiệu âm thanh thể hiện được dưới dạng đồ họa"
    },
    {
      number: "2", 
      title: "Có khả năng phân biệt",
      description: "Có khả năng phân biệt hàng hoá, dịch vụ của chủ sở hữu nhãn hiệu với hàng hoá, dịch vụ của chủ thể khác."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
          <Lightbulb className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          NHÃN HIỆU & THƯƠNG HIỆU LÀ GÌ?
        </h1>
        <p className="text-lg text-gray-600">
          Hiểu rõ sự khác biệt để bảo vệ tài sản trí tuệ của bạn
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-full p-1 shadow-lg">
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'comparison' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            So Sánh
          </button>
          <button
            onClick={() => setActiveTab('conditions')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'conditions' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Điều Kiện
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'summary' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Tổng Kết
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'comparison' && (
        <div className="grid md:grid-cols-2 gap-8">
          <ComparisonCard {...trademarkData} />
          <ComparisonCard {...brandData} />
        </div>
      )}

      {activeTab === 'conditions' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
              Điều Kiện Bảo Hộ Nhãn Hiệu
            </h2>
            <div className="space-y-4">
              {conditions.map((condition, index) => (
                <ConditionCard
                  key={index}
                  number={condition.number}
                  title={condition.title}
                  description={condition.description}
                  isExpanded={expandedSection === index}
                  onToggle={() => toggleExpanded(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Alert Box */}
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-bold text-red-800">Điểm Quan Trọng</h3>
            </div>
            <p className="text-red-700 mt-2">
              <strong>Tuy nhiên Thương hiệu không được pháp luật bảo hộ</strong> mà chỉ được xã hội và 
              người tiêu dùng công nhận. <strong>Pháp luật Việt Nam cho phép đăng ký và bảo hộ độc quyền đối với nhãn hiệu.</strong>
            </p>
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white text-center">So Sánh Tổng Quan</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tiêu chí</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Nhãn hiệu</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Thương hiệu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Bảo hộ pháp lý</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Đăng ký độc quyền</td>
                    <td className="px-6 py-4 text-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Công nhận</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">Pháp luật</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">Xã hội & người tiêu dùng</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Điều kiện</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">Có quy định cụ thể</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">Không có quy định</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
              Lời Khuyên Thực Tiễn
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">1</span>
                Xây dựng <strong>thương hiệu</strong> để tạo uy tín và nhận diện thị trường
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">2</span>
                Đăng ký <strong>nhãn hiệu</strong> để có được bảo vệ pháp lý độc quyền
              </li>
              <li className="flex items-start">
                <span className="bg-purple-100 text-purple-800 rounded-full px-2 py-1 text-xs font-medium mr-3 mt-0.5">3</span>
                Kết hợp cả hai để có chiến lược bảo vệ thương hiệu toàn diện
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default TrademarkBrandComparison;