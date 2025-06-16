import React from 'react';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';

// Configuration object - Change information here
const companyInfo = {
  title: "Dịch vụ Sở hữu trí tuệ - Taga Law",
  subtitle: "Đối tác tuyệt vời cho doanh nghiệp của bạn.",
  description: [
    "Với mục tiêu giúp khách hàng của mình bảo vệ quyền sở hữu trí tuệ, chúng tôi cam kết cung cấp các giải pháp phù hợp và hiệu quả nhất cho từng trường hợp cụ thể. Đội ngũ chuyên viên của chúng tôi luôn đảm bảo giải quyết các thủ tục đăng ký nhanh chóng và chính xác, giúp khách hàng tiết kiệm được thời gian và chi phí.",
    "Đối với Luật Taga, khách hàng là trung tâm của mọi hoạt động của chúng tôi. Chúng tôi cam kết mang lại cho khách hàng của mình sự hài lòng và một chất lượng dịch tuyệt vời."
  ],
  addresses: {
    headquarters: {
      label: "Địa chỉ trụ sở",
      address: "Số 12 Ngõ 203 đường Hữu Hưng, Phường Tây Mỗ, Quận Nam Từ Liêm, Thành phố Hà Nội, Việt Nam"
    },
    office: {
      label: "Văn phòng giao dịch",
      address: "Số 7 Đại Lộ Thăng Long, Phường Trung Hoà, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam"
    }
  },
  contact: {
    email: "lienhe@luattaga.vn",
    hotline: "0968.856.464",
    zalo: [
      { label: "Zalo 1", number: "0986.488.248" },
      { label: "Zalo 2", number: "0986.400.248" }
    ]
  }
};

const Contact: React.FC = () => {
  return (
    <div className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1  gap-12">
          {/* Left Column - About */}
          <div >
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {companyInfo.title}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {companyInfo.subtitle}
              </p>
              {companyInfo.description.map((paragraph, index) => (
                <p key={index} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
            </div>
            {/* Address Section */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Địa chỉ</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{companyInfo.addresses.headquarters.label}</h4>
                  <p className="text-gray-600">
                    {companyInfo.addresses.headquarters.address}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">{companyInfo.addresses.office.label}</h4>
                  <p className="text-gray-600">
                    {companyInfo.addresses.office.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Liên hệ chúng tôi</h3>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-blue-500 mr-3" />
                  <a 
                    href={`mailto:${companyInfo.contact.email}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {companyInfo.contact.email}
                  </a>
                </div>

                {/* Hotline */}
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <span className="text-gray-600 mr-2">Hotline:</span>
                    <a 
                      href={`tel:${companyInfo.contact.hotline.replace(/\./g, '')}`}
                      className="text-green-600 hover:text-green-800 transition-colors font-semibold"
                    >
                      {companyInfo.contact.hotline}
                    </a>
                  </div>
                </div>

                {/* Zalo contacts */}
                <div className="space-y-2">
                  {companyInfo.contact.zalo.map((zalo, index) => (
                    <div key={index} className={`flex items-center ${index > 0 ? 'ml-8' : ''}`}>
                      {index === 0 && <MessageCircle className="w-5 h-5 text-blue-400 mr-3" />}
                      {index > 0 && <div className="w-5 mr-3"></div>}
                      <div>
                        <span className="text-gray-600 mr-2">{zalo.label}:</span>
                        <a 
                          href={`tel:${zalo.number.replace(/\./g, '')}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          {zalo.number}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;