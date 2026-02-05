import React from 'react';
import { CheckCircle } from 'lucide-react'; // Importing an icon from lucide-react

const BarcodeBenefits: React.FC = () => {
    const benefits = [
        {
            title: "QUẢN LÝ SẢN PHẨM HIỆU QUẢ",
            description: "Mã số mã vạch giúp cho quản lý hàng hóa, sản phẩm trở lên dễ dàng, giảm chi phí quản lý, nhanh chóng, chính xác."
        },
        {
            title: "THUẬN LỢI XUẤT KHẨU HÀNG HÓA",
            description: "Đăng ký mã vạch là cơ hội để doanh nghiệp mở rộng thị trường và tăng doanh thu, bao gồm cả việc xuất khẩu sản phẩm sang các quốc gia khác."
        },
        {
            title: "MINH BẠCH THÔNG TIN SẢN PHẨM",
            description: "Mã số mã vạch trên sản phẩm giúp người tiêu dùng xác minh thông tin xuất xứ, tạo lòng tin."
        },
        {
            title: "TẠO NÊN THƯƠNG HIỆU RIÊNG",
            description: "Góp phần tạo nên thương hiệu riêng cho tổ chức, doanh nghiệp cung cấp dịch vụ, sản xuất hàng hóa."
        },
        {
            title: "TƯ VẤN CHUYÊN NGHIỆP",
            description: "Dịch vụ của Luật Poip cung cấp tư vấn chuyên nghiệp, giúp bạn hiểu rõ quy trình đăng ký mã vạch và đảm bảo tuân thủ đúng quy định."
        },
        {
            title: "THỦ TỤC NHANH CHÓNG",
            description: "Đăng ký mã vạch thông qua Luật Poip giúp bạn tiết kiệm thời gian với quy trình đăng ký nhanh chóng và hiệu quả."
        },
        {
            title: "TIẾT KIỆM CHI PHÍ",
            description: "Sử dụng dịch vụ của Luật Poip giúp bạn tiết kiệm tiền bạc so với việc tự thực hiện thủ tục đăng ký."
        },
        {
            title: "CẤP MÃ TRONG VÒNG 1 NGÀY",
            description: "Một lợi ích đáng chú ý, Luật Poip thường cấp mã vạch cho bạn trong vòng 1 ngày, giúp bạn triển khai sản phẩm nhanh chóng."
        }
    ];

    return (
        <section className="p-8 bg-white rounded-lg shadow-lg">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800">LỢI ÍCH KHI ĐĂNG KÝ SỬ DỤNG MÃ VẠCH</h2>
                <h5 className="text-lg text-gray-600 mt-2">
                    Việc đăng ký sử dụng mã vạch mang lại nhiều lợi ích cho các doanh nghiệp và tổ chức trong quản lý sản phẩm và dịch vụ.
                </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.slice(0, 4).map((benefit, index) => (
                    <div key={index} className="flex items-start p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CheckCircle className="text-green-500 mr-3 w-6 h-6" />
                        <div>
                            <h4 className="font-semibold text-lg">{benefit.title}</h4>
                            <p className="text-gray-700">{benefit.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-10 mb-8 text-center">
                <h2 className="text-3xl font-bold text-gray-800">ĐĂNG KÝ MÃ SỐ MÃ VẠCH TẠI LUẬT POIP</h2>
                <h5 className="text-lg text-gray-600 mt-2">
                    Luật sư tại Luật Poip có thể mang lại nhiều lợi ích cho việc đăng ký mã số mã vạch, bao gồm:
                </h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.slice(4).map((benefit, index) => (
                    <div key={index} className="flex items-start p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                        <CheckCircle className="text-green-500 mr-3 w-6 h-6" />
                        <div>
                            <h4 className="font-semibold text-lg">{benefit.title}</h4>
                            <p className="text-gray-700">{benefit.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BarcodeBenefits;
