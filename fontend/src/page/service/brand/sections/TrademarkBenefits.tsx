import React from 'react';
import { Check, Star } from 'lucide-react';

const TrademarkBenefits = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          LỢI ÍCH KHI ĐĂNG KÝ BẢO HỘ NHÃN HIỆU
        </h1>
        <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Brand Benefits Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-6">Lợi ích thương hiệu</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Xác lập quyền sở hữu
                </h3>
                <p className="text-gray-600">
                  Việc đăng ký nhãn hiệu giúp chủ sở hữu xác lập quyền độc quyền đối với thương hiệu, 
                  bảo vệ khỏi việc người khác sử dụng trái phép.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Ngăn chặn sao chép và bắt chước
                </h3>
                <p className="text-gray-600">
                  Bảo hộ thương hiệu ngăn chặn việc sao chép, bắt chước từ đối thủ, 
                  bảo vệ danh tiếng và sự độc đáo của sản phẩm hoặc dịch vụ.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Xây dựng niềm tin và uy tín
                </h3>
                <p className="text-gray-600">
                  Thương hiệu đăng ký tạo niềm tin với khách hàng, đem lại sự an tâm về 
                  chất lượng và xuất xứ của sản phẩm hoặc dịch vụ.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tạo sự khác biệt
                </h3>
                <p className="text-gray-600">
                  Thương hiệu đăng ký giúp tạo sự phân biệt với đối thủ, đem lại giá trị 
                  độc đáo và thu hút sự quan tâm từ người tiêu dùng.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Economic Benefits Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-orange-600 mb-6">Lợi ích kinh tế</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tăng giá trị thương hiệu
                </h3>
                <p className="text-gray-600">
                  Thương hiệu đăng ký tạo ra một tài sản vô hình có giá trị kinh tế, 
                  làm tăng giá trị toàn bộ doanh nghiệp.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Chuyển nhượng và thương mại hóa
                </h3>
                <p className="text-gray-600">
                  Quyền sở hữu thương hiệu có thể được chuyển nhượng hoặc thương mại hóa, 
                  tạo cơ hội kinh doanh và hợp tác với các đối tác khác.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Tăng khả năng gia tăng doanh số
                </h3>
                <p className="text-gray-600">
                  Thương hiệu mạnh mẽ và độc đáo giúp tạo sự thu hút với khách hàng, 
                  tăng cơ hội bán hàng và doanh số.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Cơ hội tiếp cận tài nguyên đầu tư
                </h3>
                <p className="text-gray-600">
                  Thương hiệu đăng ký thu hút sự quan tâm từ nhà đầu tư và đối tác tiềm năng, 
                  tạo cơ hội tiếp cận tài nguyên và nguồn vốn đầu tư.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default TrademarkBenefits;