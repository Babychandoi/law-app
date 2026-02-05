import React from 'react';
import SectionNumber from '../ui/SectionNumber';
import { AboutSectionProps } from '../types';

const AboutSection: React.FC<AboutSectionProps> = ({ title, content, image }) => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <img 
            src={image} 
            alt="About Poip Law" 
            className="w-full h-80 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="order-1 md:order-2">
          <div className="flex items-center mb-6">
            <SectionNumber number={1} />
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          <div className="space-y-4">
            {content.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;