import React, { useState, useEffect } from 'react';
import { ArrowRight, Phone, Mail, Sparkles } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  showCTA?: boolean;
  ctaText?: string;
  onCTAClick?: () => void;
  showContactInfo?: boolean;
  phone?: string;
  email?: string;
  backgroundGradient?: string;
  icon?: React.ReactNode;
  enableAnimations?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  title, 
  subtitle,
  description,
  showCTA = false,
  ctaText = "Liên hệ tư vấn",
  onCTAClick,
  showContactInfo = false,
  phone,
  email,
  enableAnimations = true
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (enableAnimations) {
      setIsVisible(true);
    }
  }, [enableAnimations]);

  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-24 overflow-hidden">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Decorative geometric elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-yellow-400/30 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border-2 border-orange-400/30 transform rotate-45 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border-2 border-yellow-400/30 rounded-full animate-pulse" style={{animationDelay: '0.7s'}}></div>
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border-2 border-orange-400/20 transform rotate-12"></div>
      </div>

      <div className="relative container mx-auto px-6 text-center">
        {/* Decorative Header */}
        <div className={`flex items-center justify-center gap-2 mb-6 transition-all duration-1000 ${
          isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
          <Sparkles className="text-yellow-400" size={24} />
          <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
        </div>

        {/* Main content */}
        <div className={`transition-all duration-1000 ${
          isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light text-gray-300 mb-6">
            {subtitle}
          </h3>
          
          {description && (
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* CTA Button */}
        {showCTA && (
          <div className={`mb-8 transition-all duration-1000 delay-500 ${
            isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <button
              onClick={handleCTAClick}
              className="relative group inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold text-lg rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl hover:shadow-yellow-500/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10">{ctaText}</span>
              <ArrowRight className="ml-3 w-5 h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* Contact Info */}
        {showContactInfo && (phone || email) && (
          <div className={`flex flex-col md:flex-row justify-center items-center gap-4 md:gap-6 transition-all duration-1000 delay-700 ${
            isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {phone && (
              <a 
                href={`tel:${phone}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105 group"
              >
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-yellow-400 font-semibold">{phone}</span>
              </a>
            )}
            
            {email && (
              <a 
                href={`mailto:${email}`}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl border border-purple-400/30 hover:border-purple-400 transition-all duration-300 backdrop-blur-sm hover:transform hover:scale-105 group"
              >
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-purple-400 font-semibold">{email}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
