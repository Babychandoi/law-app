import React from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import { ContactSectionProps } from '../types';
import { useNavigate } from 'react-router-dom';
const ContactSection: React.FC<ContactSectionProps> = ({ title, buttonText }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/contact");
  };

  return (
    <section className="relative py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-8">{title}</h2>
        <button
          onClick={handleNavigate}
          className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center mx-auto group"
        >
          <Phone className="w-5 h-5 mr-3" />
          {buttonText}
          <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </div>
    </section>
  );
};

export default ContactSection;