import React from 'react';
import SectionNumber from '../ui/SectionNumber';
import ServiceCard from '../ui/ServiceCard';
import { ServicesSectionProps } from '../types';

const ServicesSection: React.FC<ServicesSectionProps> = ({ title, services, image }) => (
  <section className="py-16 bg-white">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <div className="flex items-center mb-6">
            <SectionNumber number={2} />
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          
          <div className="space-y-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <img 
            src={image} 
            alt="Services" 
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  </section>
);

export default ServicesSection;