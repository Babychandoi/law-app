import React, { useEffect, useState } from 'react';
import { MapPin, Mail, Phone, Send, Facebook, Linkedin, Shield, FileText, Star, Award, Users, Globe } from 'lucide-react';
import {TotoCompany} from '../../../types/company';
import { getCompany } from '../../../service/service';
import { useNavigate } from 'react-router-dom';


const COLORS = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-400",
    border: "border-blue-400/50",
    shadow: "shadow-blue-500/20",
    hover: "hover:text-blue-400"
  },
  purple: {
    text: "text-purple-400",
    bg: "bg-purple-400",
    border: "border-purple-400/50",
    shadow: "shadow-purple-500/20",
    hover: "hover:text-purple-400"
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-400",
    border: "border-red-400/50",
    shadow: "shadow-red-500/20",
    hover: "hover:text-red-400"
  },
  green: {
    text: "text-green-400",
    bg: "bg-green-400",
    border: "border-green-400/50",
    shadow: "shadow-green-500/20",
    hover: "hover:text-green-400"
  }
};

// ============ COMPONENT CHÍNH ============
const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [company,setCompany] = useState<TotoCompany>();
  const iconMap: Record<string, React.ElementType> = {
    Facebook,
    Linkedin,
    Shield,
    FileText,
    Star,
    Award,
    Users,
    Globe,
    MapPin,
    Mail,
    Phone,
    Send
  };
  const navigate = useNavigate();
  useEffect(()=>{
    const fetchCompany = async() =>{
      const response =  await getCompany();
      setCompany(response.data);
    }
    fetchCompany()
  },[]);
  const handleSubmit = async () => {
    if (!email) return;
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Email submitted:', email);
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const formatPhoneNumber = (number: string) => {
    return number.replace(/\./g, '');
  };
  const hanldeNagivate = (href: string) => {
    navigate("/new",{state : {id : href}});
  };
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400/10 to-teal-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative z-10 py-20 px-6">
        {/* Company Header */}
        <div className="max-w-7xl mx-auto text-center mb-16">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-3xl blur-2xl"></div>
            
            <div className="relative p-8 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-3xl backdrop-blur-xl border border-yellow-400/30 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg">
                  <Award className="w-8 h-8 text-gray-900" />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                  {company?.company.name}
                </span>
              </h2>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-300">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span>Đại diện bởi: <span className="text-yellow-400 font-semibold"> {company?.company.representative}</span></span>
                </div>
                <div className="hidden md:block w-1 h-1 bg-gray-500 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-yellow-400" />
                  <span>MST: <span className="text-white font-mono font-semibold"> {company?.company.taxCode}</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Location Section */}
          <div className="space-y-8">
            <div className="group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white ml-4 group-hover:text-blue-400 transition-colors duration-300">
                  Địa điểm
                </h3>
              </div>
              
              <div className="space-y-4">
                {company?.locations.map((location) => {
                  const colorConfig = COLORS[location.color as keyof typeof COLORS];
                  return (
                    <div key={location.id} className={`relative p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 hover:${colorConfig.border} transition-all duration-500 hover:shadow-2xl hover:${colorConfig.shadow} backdrop-blur-sm group`}>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Star className="w-4 h-4 text-yellow-400" />
                      </div>
                      <h4 className={`${colorConfig.text} font-semibold mb-2 flex items-center`}>
                        <div className={`w-2 h-2 ${colorConfig.bg} rounded-full mr-2`}></div>
                        {location.type}
                      </h4>
                      <p className="text-gray-300 leading-relaxed">
                        {location.address}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-8">
            <div className="group">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white ml-4 group-hover:text-emerald-400 transition-colors duration-300">
                  Liên hệ
                </h3>
              </div>
              
              <div className="space-y-4">
                {/* Email */}
                <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 backdrop-blur-sm group">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-emerald-400 font-semibold mb-1">Email</h4>
                      <a 
                        href={`mailto:${company?.company.email}`}
                        className="text-white hover:text-emerald-400 transition-colors duration-300 flex items-center font-medium"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        {company?.company.email}
                      </a>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Send className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                </div>

                {/* Phone Numbers */}
                <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 hover:border-yellow-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-yellow-500/20 backdrop-blur-sm">
                  <h4 className="text-yellow-400 font-semibold mb-4">Số điện thoại</h4>
                  <div className="space-y-3">
                    {company?.phoneContacts.map((contact) => {
                      const colorConfig = COLORS[contact.color as keyof typeof COLORS];
                      return (
                        <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-all duration-300 group">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 ${colorConfig.bg} rounded-full mr-3`}></div>
                            <span className="text-gray-400 text-sm mr-3">{contact.label}:</span>
                            <a 
                              href={`tel:${formatPhoneNumber(contact.number)}`}
                              className={`${colorConfig.text} hover:text-white transition-colors duration-300 font-mono font-semibold`}
                            >
                              {contact.number}
                            </a>
                          </div>
                          <Phone className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors duration-300" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter & Links Section */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white ml-4">
                  Nhận tin tức
                </h3>
              </div>
              
              <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="Nhập email của bạn..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-4 pl-12 pr-4 rounded-xl bg-gray-700/50 text-white border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 group-hover:bg-gray-700/70"
                      required
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-pink-400 transition-colors duration-300" />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Đang gửi...' : 'Đăng ký nhận tin'}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
              <h4 className="text-white font-semibold mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-400" />
                Liên kết quan trọng
              </h4>
              <div className="space-y-2">
                {company?.importants.map((link) => {
                  const colorConfig = COLORS[link.color as keyof typeof COLORS];
                  return (
                    <button 
                      key={link.id}
                      onClick={() => hanldeNagivate(link.href)}
                      className={`flex items-center p-3 text-gray-400 ${colorConfig.hover} transition-all duration-300 rounded-lg hover:bg-gray-700/50 group`}
                    >
                      {React.createElement(iconMap[link.icon], { className: "w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-300" })}
                      <span className="group-hover:translate-x-1 transition-transform duration-300">{link.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mb-8"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm mb-2">
                © 2025 <span className="text-yellow-400 font-semibold">{company?.company.websiteName}</span> - All Rights Reserved
              </p>
              <p className="text-gray-500 text-xs">
                Được thiết kế với ❤️ cho sự thành công của bạn
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm mr-2">Theo dõi chúng tôi:</span>
              {company?.socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.label}
                  className={`p-3 bg-gray-800/50 rounded-xl border border-gray-700/50 text-gray-400 hover:text-white hover:bg-${social.color} hover:border-transparent transition-all duration-300 hover:scale-110 hover:shadow-lg transform`}
                >
                 {React.createElement(iconMap[social.icon], { className: "w-5 h-5" })}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;