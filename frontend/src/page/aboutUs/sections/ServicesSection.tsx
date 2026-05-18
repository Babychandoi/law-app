import React from 'react';
import { Sparkles, CheckCircle, Shield, FileText, Users } from 'lucide-react';
import { ServicesSectionProps } from '../types';

const ServicesSection: React.FC<ServicesSectionProps> = ({ title, services, image }) => {
  const getServiceIcon = (index: number) => {
    const icons = [Shield, FileText, Users];
    const Icon = icons[index] || Shield;
    return Icon;
  };

  const getServiceColor = (index: number) => {
    const colors = [
      { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-400/40', icon: 'text-blue-600', iconBg: 'bg-blue-50' },
      { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-400/40', icon: 'text-green-600', iconBg: 'bg-green-50' },
      { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-400/40', icon: 'text-purple-600', iconBg: 'bg-purple-50' }
    ];
    return colors[index] || colors[0];
  };

  return (
    <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Services List */}
          <div>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <Sparkles className="text-yellow-400" size={20} />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                  {title}
                </span>
              </h2>
            </div>
            
            <div className="space-y-6">
              {services.map((service, index) => {
                const Icon = getServiceIcon(index);
                const colors = getServiceColor(index);
                
                return (
                  <div 
                    key={index} 
                    className={`bg-white rounded-2xl border-2 ${colors.border} p-6 hover:shadow-2xl transition-all duration-500 group`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 ${colors.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${colors.icon}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {service.title}
                      </h3>
                    </div>
                    
                    <ul className="space-y-2">
                      {service.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-gray-700">
                          <CheckCircle className={`w-4 h-4 ${colors.icon} flex-shrink-0 mt-1`} />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Image */}
          <div className="space-y-6">
            <div className="group">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 group-hover:border-blue-400 transition-all duration-500">
                  <img 
                    src={image} 
                    alt="Services" 
                    className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">10+</div>
                <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
              </div>
              <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-1">1000+</div>
                <div className="text-sm text-gray-600">Khách hàng tin tưởng</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
