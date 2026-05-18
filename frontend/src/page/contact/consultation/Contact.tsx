import React, { useEffect, useState } from 'react';
import { MapPin, Mail, Phone, MessageCircle, Sparkles, Building2 } from 'lucide-react';
import { getCompany } from '../../../service/service';
import { TotoCompany } from '../../../types/company';

const Contact: React.FC = () => {
  const [contact, setContact] = useState<TotoCompany>()
  
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await getCompany();
        setContact(response.data);
      } catch (error) {
        throw new Error('Không thể lấy thông tin công ty');
      }
    };
    fetchCompanyInfo();
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20 px-0 md:px-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Thông tin liên hệ
          </h2>
          <p className="text-gray-600 text-lg">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* About Section */}
          <div className="relative bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:border-yellow-400/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
            <div className="absolute top-4 right-4 opacity-5">
              <Building2 className="w-32 h-32 text-yellow-400" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">{contact?.company.name}</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed text-lg font-semibold">
                  Đối tác tuyệt vời cho doanh nghiệp của bạn.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Với mục tiêu giúp khách hàng của mình bảo vệ quyền sở hữu trí tuệ, chúng tôi cam kết cung cấp các giải pháp phù hợp và hiệu quả nhất cho từng trường hợp cụ thể. Đội ngũ chuyên viên của chúng tôi luôn đảm bảo giải quyết các thủ tục đăng ký nhanh chóng và chính xác, giúp khách hàng tiết kiệm được thời gian và chi phí.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Đối với Luật Poip, khách hàng là trung tâm của mọi hoạt động của chúng tôi. Chúng tôi cam kết mang lại cho khách hàng của mình sự hài lòng và một chất lượng dịch vụ tuyệt vời.
                </p>
              </div>
            </div>
          </div>

          {/* Address and Contact Grid */}
          <div className="grid grid-cols-1 gap-8">
            {/* Address Section */}
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:border-blue-400/30 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Địa chỉ</h3>
              </div>
              
              <div className="space-y-6">
                {contact?.locations.map((location, index) => (
                  <div key={location.id || index} className="group/item">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">{location.type}</h4>
                        <p className="text-gray-600 leading-relaxed">{location.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Section */}
            <div className="relative bg-white rounded-2xl p-8 shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:border-green-400/30 group">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400"></div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Liên hệ</h3>
              </div>
              
              <div className="space-y-5">
                {/* Email */}
                <div className="flex items-center gap-3 group/item">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center group-hover/item:from-blue-100 group-hover/item:to-blue-200 transition-all duration-300">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <a 
                      href={`mailto:${contact?.company.email}`}
                      className="text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                    >
                      {contact?.company.email}
                    </a>
                  </div>
                </div>

                {/* Hotline */}
                <div className="flex items-center gap-3 group/item">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center group-hover/item:from-green-100 group-hover/item:to-green-200 transition-all duration-300">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hotline</p>
                    <a 
                      href={`tel:${contact?.phoneContacts.find(contact => contact.label === "Hotline")?.number}`}
                      className="text-green-600 hover:text-green-800 transition-colors font-bold text-lg"
                    >
                      {contact?.phoneContacts.find(contact => contact.label === "Hotline")?.number}
                    </a>
                  </div>
                </div>

                {/* Zalo contacts */}
                <div className="space-y-3">
                  {contact?.phoneContacts.filter(zalo => zalo.label.includes("Zalo")).map((zalo, index) => (
                    <div key={index} className="flex items-center gap-3 group/item">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center group-hover/item:from-purple-100 group-hover/item:to-purple-200 transition-all duration-300">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{zalo.label}</p>
                        <a 
                          href={`tel:${zalo.number.replace(/\./g, '')}`}
                          className="text-purple-600 hover:text-purple-800 transition-colors font-semibold"
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
