import React from 'react';

interface BarcodeInfoSectionProps {
  className?: string;
}

const BarcodeInfoSection: React.FC<BarcodeInfoSectionProps> = ({ className = '' }) => {
  return (
    <div className={`max-w-6xl mx-auto px-4 ${className}`}>
      {/* Phần tiêu đề với animation */}
      <section className="py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
          <span className="inline-block relative">
            <span className="relative z-10">MÃ SỐ MÃ VẠCH</span>
            <span className="absolute bottom-0 left-0 w-full h-2 bg-blue-100 -z-0 transform translate-y-1"></span>
          </span>
          <br />
          <span className="text-xl md:text-2xl font-medium text-blue-600 mt-2 inline-block">
            CHỨNG MINH THƯ CỦA SẢN PHẨM
          </span>
        </h2>
      </section>

      {/* Phần nội dung với card effect */}
      <section className="flex flex-col lg:flex-row gap-8 pb-16 items-center">
        {/* Hình ảnh với hover effect */}
        <div className="w-full lg:w-2/5 max-w-md group relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
          <img
            src="/assets/images/masomavach.webp"
            alt="Mã số mã vạch"
            className="relative w-full h-auto object-cover rounded-lg shadow-xl transform group-hover:-translate-y-1 transition duration-300"
            loading="lazy"
          />
        </div>

        {/* Nội dung văn bản với gradient border */}
        <div className="w-full lg:w-3/5">
          <div className="relative p-6 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-300"></div>
            <p className="text-gray-700 leading-relaxed text-justify pl-5">
              Mã số mã vạch là một thẻ chứng minh xuất xứ và lưu thông của sản phẩm trên các thị trường quốc tế. Mỗi sản phẩm được gắn một mã số duy nhất, tương tự như mã số điện thoại trong viễn thông. Mã vạch là dãy số dưới dạng vạch đặc biệt để máy đọc được.
              <br /><br />
              Hiện nay, có hai loại chính là mã số 1 chiều và mã số hai chiều. Các hệ thống mã vạch phổ biến bao gồm EAN-13, CODE 39, và QR CODE. Luật Poip cung cấp dịch vụ đăng ký mã EAN-13 cho khách hàng.
            </p>
            <div className="mt-6 flex justify-end">
              <a href='https://thuvienphapluat.vn/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/tu-van-phap-luat/55245/ma-so-ma-vach-la-gi-huong-dan-thu-tuc-cap-giay-chung-nhan-quyen-su-dung-ma-so-ma-vach-tren-san-pham' className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition duration-300"
               
              >
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BarcodeInfoSection;