import React from 'react';

const ScienceAndTechnologyBusiness: React.FC = () => {
    return (
        <div className="container mx-auto p-6">
            <section className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden">
                <div className="relative">
                    <img 
                        className="w-full h-64 object-cover" 
                        src="/assets/images/doanh-nghiep-khoa-hoc-va-cong-nghe.jpg" 
                        alt="Technology in the hands" 
                    />
                    <div className="absolute inset-0 bg-black opacity-40"></div>
                    <div className="relative z-10 p-6 text-center">
                        <h3 className="text-4xl font-extrabold text-white">DOANH NGHIỆP KHOA HỌC VÀ CÔNG NGHỆ LÀ GÌ?</h3>
                    </div>
                </div>
            </section>

            <section className="bg-gray-50 rounded-lg shadow-lg p-6">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">THÔNG TIN VỀ DOANH NGHIỆP KHOA HỌC VÀ CÔNG NGHỆ</h2>
                <p className="text-gray-700 text-lg leading-relaxed text-justify">
                    Doanh nghiệp khoa học và công nghệ là doanh nghiệp thực hiện sản xuất, kinh doanh, dịch vụ khoa học và công nghệ để tạo ra sản phẩm, hàng hoá từ kết quả nghiên cứu khoa học và phát triển công nghệ.
                </p>
            </section>

            <section className="bg-white rounded-lg shadow-lg p-6 mt-8">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">LỢI ÍCH CỦA DOANH NGHIỆP KHOA HỌC VÀ CÔNG NGHỆ</h2>
                <ul className="list-disc list-inside text-gray-700 text-lg leading-relaxed">
                    <li>Cải tiến quy trình sản xuất và nâng cao chất lượng sản phẩm.</li>
                    <li>Tăng cường khả năng cạnh tranh trên thị trường.</li>
                    <li>Đáp ứng nhanh chóng nhu cầu của khách hàng.</li>
                    <li>Thúc đẩy đổi mới sáng tạo và phát triển bền vững.</li>
                </ul>
            </section>
        </div>
    );
};

export default ScienceAndTechnologyBusiness;
