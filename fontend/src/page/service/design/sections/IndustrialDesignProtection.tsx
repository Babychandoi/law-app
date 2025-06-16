import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, XCircle, CheckCircle, Info } from 'lucide-react';

const IndustrialDesignProtection = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string | null) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const ExpandableSection = ({ id, title, icon: Icon, children, bgColor = "bg-white" }: { id: string; title: string; icon: React.ComponentType; children: React.ReactNode; bgColor?: string }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className={`${bgColor} rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl`}>
        <button
          onClick={() => toggleSection(id)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <div className="w-6 h-6 text-blue-600">
                <Icon />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          </div>
          {isExpanded ? 
            <ChevronUp className="w-6 h-6 text-gray-600" /> : 
            <ChevronDown className="w-6 h-6 text-gray-600" />
          }
        </button>
        
        {isExpanded && (
          <div className="px-6 pb-6 border-t border-gray-100">
            <div className="pt-4">
              {children}
            </div>
          </div>
        )}
      </div>
    );
  };

  const ConditionCard = ({ title, description, icon: Icon, color }: { title: string; description: string; icon: React.ComponentType<any>; color: string }) => (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-6 border-l-4 hover:shadow-md transition-shadow duration-200" style={{borderLeftColor: color}}>
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg" style={{backgroundColor: `${color}20`}}>
            <Icon className={`w-6 h-6`} style={{ color }} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
            <p className="text-gray-600 leading-relaxed text-justify">{description}</p>
          </div>
        </div>
      </div>
  );

  const ExcludedItem = ({ text }: { text: string }) => (
    <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-100">
      <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-gray-700 text-justify">{text}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Bảo Hộ Kiểu Dáng Công Nghiệp
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tìm hiểu về các điều kiện và quy định bảo hộ kiểu dáng công nghiệp tại Việt Nam
          </p>
        </div>

        {/* Definition Section */}
        <ExpandableSection
          id="definition"
          title="Định Nghĩa Kiểu Dáng Công Nghiệp"
          icon={Info}
          bgColor="bg-gradient-to-r from-blue-50 to-indigo-50"
        >
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Kiểu dáng công nghiệp:</h4>
              <p className="text-gray-700 leading-relaxed text-justify">
                Là hình dáng bên ngoài của sản phẩm hoặc bộ phận để lắp ráp thành sản phẩm phức hợp, 
                được thể hiện bằng hình khối, đường nét, màu sắc hoặc sự kết hợp những yếu tố này và 
                nhìn thấy được trong quá trình khai thác công dụng của sản phẩm hoặc sản phẩm phức hợp.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3">Sản phẩm:</h4>
              <p className="text-gray-700 leading-relaxed text-justify">
                Được hiểu là đồ vật, dụng cụ, thiết bị, phương tiện, hoặc bộ phận dùng để lắp ráp, 
                hợp thành các sản phẩm đó, được sản xuất bằng phương pháp công nghiệp hoặc thủ công nghiệp, 
                có kết cấu và chức năng rõ ràng, được lưu thông độc lập.
              </p>
            </div>
          </div>
        </ExpandableSection>

        {/* Protection Conditions */}
        <div className="mt-8">
          <ExpandableSection
            id="conditions"
            title="Điều Kiện Bảo Hộ Kiểu Dáng Công Nghiệp"
            icon={CheckCircle}
            bgColor="bg-gradient-to-r from-green-50 to-emerald-50"
          >
            <div className="space-y-6">
              <ConditionCard
                title="Có tính mới"
                description="Kiểu dáng công nghiệp được coi là có tính mới nếu kiểu dáng công nghiệp đó khác biệt đáng kể với những kiểu dáng công nghiệp đã bị bộc lộ công khai dưới hình thức sử dụng, mô tả bằng văn bản hoặc bất kỳ hình thức nào khác ở trong nước hoặc ở nước ngoài trước ngày nộp đơn hoặc trước ngày ưu tiên nếu đơn đăng ký kiểu dáng công nghiệp được hưởng quyền ưu tiên."
                icon={Lightbulb}
                color="#10B981"
              />
              <ConditionCard
                title="Có tính sáng tạo"
                description="Kiểu dáng công nghiệp được coi là có tính sáng tạo nếu căn cứ vào các kiểu dáng công nghiệp đã được bộc lộ công khai dưới hình thức sử dụng, mô tả bằng văn bản hoặc bất kỳ hình thức nào khác ở trong nước hoặc ở nước ngoài trước ngày nộp đơn hoặc trước ngày ưu tiên của đơn đăng ký kiểu dáng công nghiệp trong trường hợp đơn được hưởng quyền ưu tiên, kiểu dáng công nghiệp đó không thể được tạo ra một cách dễ dàng đối với người có hiểu biết trung bình về lĩnh vực tương ứng."
                icon={CheckCircle}
                color="#3B82F6"
              />
              <ConditionCard
                title="Có khả năng áp dụng công nghiệp"
                description="Kiểu dáng công nghiệp được coi là có khả năng áp dụng công nghiệp nếu có thể dùng làm mẫu để chế tạo hàng loạt sản phẩm có hình dáng bên ngoài là kiểu dáng công nghiệp đó bằng phương pháp công nghiệp hoặc thủ công nghiệp."
                icon={Info}
                color="#8B5CF6"
              />
            </div>
          </ExpandableSection>
        </div>

        {/* Excluded Objects */}
        <div className="mt-8">
          <ExpandableSection
            id="excluded"
            title="Đối Tượng Không Được Bảo Hộ"
            icon={XCircle}
            bgColor="bg-gradient-to-r from-red-50 to-pink-50"
          >
            <div className="space-y-4">
              <ExcludedItem text="Hình dáng bên ngoài của sản phẩm do đặc tính kỹ thuật của sản phẩm bắt buộc phải có." />
              <ExcludedItem text="Hình dáng bên ngoài của công trình xây dựng dân dụng hoặc công nghiệp." />
              <ExcludedItem text="Hình dáng của sản phẩm không nhìn thấy được trong quá trình sử dụng sản phẩm." />
              <ExcludedItem text="Đối tượng trái với đạo đức xã hội, trật tự công cộng, có hại cho quốc phòng, an ninh." />
            </div>
          </ExpandableSection>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Cần Hỗ Trợ Tư Vấn?</h3>
            <p className="text-gray-600 mb-6">
              Liên hệ với chúng tôi để được tư vấn chi tiết về quy trình đăng ký bảo hộ kiểu dáng công nghiệp
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
                onClick={() => {
                    const contactForm = document.getElementById('contact-form');
                    if (contactForm) {
                        contactForm.scrollIntoView({ behavior: 'smooth' });
                    }
                }}
            >
              Liên Hệ Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrialDesignProtection;