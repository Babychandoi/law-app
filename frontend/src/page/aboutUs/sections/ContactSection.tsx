import React from 'react';
import { ArrowRight, Phone, Mail, MapPin, Sparkles } from 'lucide-react';
import { ContactSectionProps } from '../types';
import { useNavigate } from 'react-router-dom';

const ContactSection: React.FC<ContactSectionProps> = ({ title, buttonText }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/lien-he");
  };

  return (
    <section className="relative py-20 bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
            <Sparkles className="text-yellow-400" size={24} />
            <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng hỗ trợ và tư vấn cho bạn
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-6 border border-blue-400/30 hover:border-blue-400 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Hotline</h3>
            <p className="text-blue-400 font-bold">0346.903.548</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105">
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-purple-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Email</h3>
            <p className="text-purple-400 font-bold text-sm">lienhe@luatpoip.com</p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl p-6 border border-green-400/30 hover:border-green-400 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Địa chỉ</h3>
            <p className="text-green-400 font-bold text-sm">Việt Nam</p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleNavigate}
          className="relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-lg rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-500/50 hover:scale-105"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Phone className="w-5 h-5 mr-3 relative z-10" />
          <span className="relative z-10">{buttonText}</span>
          <ArrowRight className="w-5 h-5 ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </section>
  );
};

export default ContactSection;
