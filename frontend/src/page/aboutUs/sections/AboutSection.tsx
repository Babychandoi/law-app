import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';
import { AboutSectionProps } from '../types';

const AboutSection: React.FC<AboutSectionProps> = ({ title, content, image }) => (
  <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-r from-yellow-400/5 to-orange-400/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="order-2 md:order-1 group">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 group-hover:border-yellow-400 transition-all duration-500">
              <img 
                src={image} 
                alt="About Poip Law" 
                className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="order-1 md:order-2">
          <div className="mb-6">
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
          
          <div className="space-y-4">
            {content.map((paragraph, index) => (
              <div key={index} className="flex gap-3 group/item">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center group-hover/item:bg-yellow-100 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-justify flex-1">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
