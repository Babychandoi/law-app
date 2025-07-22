import React, { useEffect, useState } from 'react';
import { MapPin, Mail, Phone, MessageCircle } from 'lucide-react';
import { getCompany } from '../../../service/service';
import { TotoCompany } from '../../../types/company';
const Contact: React.FC = () => {
  const [contact,setContact] = useState<TotoCompany>()
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await getCompany();
        setContact(response.data);
      } catch (error) {
        console.error("Error fetching company information:", error);
      }
    };

    fetchCompanyInfo();
  }, []);
  return (
    <div className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1  gap-12">
          {/* Left Column - About */}
          <div >
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {contact?.company.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                  Đối tác tuyệt vời cho doanh nghiệp của bạn.
              </p>
                <p className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  Với mục tiêu giúp khách hàng của mình bảo vệ quyền sở hữu trí tuệ, chúng tôi cam kết cung cấp các giải pháp phù hợp và hiệu quả nhất cho từng trường hợp cụ thể. Đội ngũ chuyên viên của chúng tôi luôn đảm bảo giải quyết các thủ tục đăng ký nhanh chóng và chính xác, giúp khách hàng tiết kiệm được thời gian và chi phí.
                </p>
                <p className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  Đối với Luật ToTo, khách hàng là trung tâm của mọi hoạt động của chúng tôi. Chúng tôi cam kết mang lại cho khách hàng của mình sự hài lòng và một chất lượng dịch tuyệt vời.
                </p>
            </div>
            {/* Address Section */}
            <div className="bg-white rounded-lg p-8 shadow-lg">
              <div className="flex items-center mb-6">
                <MapPin className="w-6 h-6 text-yellow-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-800">Địa chỉ</h3>
              </div>
              
              <div className="space-y-4">
                {contact?.locations.map((location, index) => (
                  <div key={location.id || index}>
                    <h4 className="font-semibold text-gray-700 mb-2">{location.type}</h4>
                    <p className="text-gray-600">
                      {location.address}
                    </p>
                  </div>
                ))}
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
                    href={`mailto:${contact?.company.email}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {contact?.company.email}
                  </a>
                </div>

                {/* Hotline */}
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <span className="text-gray-600 mr-2">Hotline:</span>
                    <a 
                      href={`tel:${contact?.phoneContacts.find(contact => contact.label === "Hotline")?.number}`}
                      className="text-green-600 hover:text-green-800 transition-colors font-semibold"
                    >
                      {contact?.phoneContacts.find(contact => contact.label === "Hotline")?.number}
                    </a>
                  </div>
                </div>

                {/* Zalo contacts */}
                <div className="space-y-2">
                {contact?.phoneContacts
                    .filter(zalo => zalo.label.includes("Zalo"))
                    .map((zalo, index) => (
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