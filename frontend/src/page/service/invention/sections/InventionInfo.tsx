import React from 'react';

const InventionInfo: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header Section */}
      <section className="mb-8 text-center">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 shadow-sm">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-blue-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            SÁNG CHẾ LÀ GÌ?
          </h1>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="prose prose-lg max-w-none">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          
          {/* Concept Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              Khái niệm
            </h2>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-4 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed mb-4">
                <strong>Sáng chế</strong> là giải pháp kỹ thuật dưới dạng sản phẩm hoặc quy trình nhằm giải quyết một vấn đề xác định bằng việc ứng dụng các quy luật tự nhiên.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                Sáng chế được bảo hộ độc quyền dưới hình thức cấp <span className="font-semibold text-blue-700">Bằng độc quyền sáng chế</span> hoặc <span className="font-semibold text-blue-700">Bằng độc quyền giải pháp hữu ích</span>.
              </p>
            </div>
          </div>

          {/* Technical Solution Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              Giải pháp kỹ thuật
            </h2>
            
            <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-6 rounded-r-lg">
              <p className="text-gray-700 leading-relaxed">
                <strong>Giải pháp kỹ thuật</strong> – đối tượng được bảo hộ dưới danh nghĩa là sáng chế là tập hợp cần và đủ các thông tin về cách thức kỹ thuật và/hoặc phương tiện kỹ thuật (ứng dụng các quy luật tự nhiên) nhằm giải quyết một nhiệm vụ (một vấn đề) xác định.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              Giải pháp kỹ thuật có thể thuộc một trong các dạng sau đây:
            </p>

            {/* Product Types */}
            <div className="space-y-6">
              
              {/* Type (i) - Products */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                    i
                  </span>
                  Sản phẩm:
                </h3>
                
                <div className="space-y-4 ml-8">
                  
                  {/* Physical Products */}
                  <div className="bg-white rounded-lg p-4 border-l-4 border-purple-300">
                    <h4 className="font-semibold text-gray-800 mb-2">• Sản phẩm dưới dạng vật thể</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      Ví dụ: dụng cụ, máy móc, thiết bị, linh kiện, mạch điện... được thể hiện bằng tập hợp các thông tin xác định một sản phẩm nhân tạo được đặc trưng bởi các dấu hiệu (đặc điểm) kỹ thuật về kết cấu, sản phẩm đó có chức năng (công dụng) như một phương tiện nhằm đáp ứng nhu cầu nhất định của con người.
                    </p>
                  </div>

                  {/* Chemical Products */}
                  <div className="bg-white rounded-lg p-4 border-l-4 border-purple-300">
                    <h4 className="font-semibold text-gray-800 mb-2">• Sản phẩm dưới dạng chất</h4>
                    <p className="text-gray-700 leading-relaxed text-sm mb-2">
                      (Gồm đơn chất, hợp chất và hỗn hợp chất) - Ví dụ: vật liệu, chất liệu, thực phẩm, dược phẩm... được thể hiện bằng tập hợp các thông tin xác định một sản phẩm nhân tạo được đặc trưng bởi các dấu hiệu (đặc điểm) kỹ thuật về sự hiện diện, tỷ lệ và trạng thái của các phần tử, có chức năng (công dụng) như một phương tiện nhằm đáp ứng nhu cầu nhất định của con người.
                    </p>
                  </div>

                  {/* Biological Products */}
                  <div className="bg-white rounded-lg p-4 border-l-4 border-purple-300">
                    <h4 className="font-semibold text-gray-800 mb-2">• Sản phẩm dưới dạng vật liệu sinh học</h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                      Ví dụ: gen, thực vật/động vật biến đổi gen... được thể hiện bằng tập hợp các thông tin về một sản phẩm chứa thông tin di truyền bị biến đổi dưới tác động của con người, có khả năng tự tái tạo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Type (ii) - Processes */}
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-2">
                    ii
                  </span>
                  Quy trình hay phương pháp
                </h3>
                
                <div className="ml-8">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-orange-300">
                    <p className="text-gray-700 leading-relaxed text-sm">
                      (Quy trình sản xuất; phương pháp chẩn đoán, dự báo, kiểm tra, xử lý, v.v.) được thể hiện bằng một tập hợp các thông tin xác định cách thức tiến hành một quá trình, một công việc cụ thể được đặc trưng bởi các dấu hiệu (đặc điểm) về trình tự, thành phần tham gia, biện pháp, phương tiện thực hiện các thao tác nhằm đạt được mục đích nhất định.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InventionInfo;