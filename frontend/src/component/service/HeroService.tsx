import React, { useState, useEffect } from 'react';
import { ArrowRight, Phone, Mail } from 'lucide-react';

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
  backgroundGradient = "from-black to-gray-900",
  icon,
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
      // Default behavior - scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="relative text-white py-20 overflow-hidden" style={{backgroundColor: '#444444'}}>
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 opacity-50"></div>
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-32 h-32 border border-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-orange-400/20 transform rotate-45 animate-pulse delay-300"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 border border-yellow-400/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute top-1/4 left-1/4 w-20 h-20 border border-orange-400/10 transform rotate-12"></div>
      </div>

      <div className="relative container mx-auto px-6 text-center">
        {/* Main content */}
        <div className={`transition-all duration-1000 ${
          isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          
          <h3 className="text-xl md:text-2xl lg:text-3xl font-light opacity-90 mb-6">
            {subtitle}
          </h3>

          {description && (
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
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
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span>{ctaText}</span>
              <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* Contact Info */}
        {showContactInfo && (phone || email) && (
          <div className={`flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 transition-all duration-1000 delay-700 ${
            isVisible && enableAnimations ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {phone && (
              <a 
                href={`tel:${phone}`}
                className="flex items-center text-yellow-300 hover:text-yellow-400 transition-colors duration-300"
              >
                <Phone className="w-5 h-5 mr-2" />
                <span>{phone}</span>
              </a>
            )}
            {email && (
              <a 
                href={`mailto:${email}`}
                className="flex items-center text-yellow-300 hover:text-yellow-400 transition-colors duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                <span>{email}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;