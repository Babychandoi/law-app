// components/ui/ServiceCard.tsx
import React from 'react';
import { Shield } from 'lucide-react';
import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <h3 className="text-xl font-semibold text-center mb-4 text-blue-700">
      {service.title}
    </h3>
    <ul className="space-y-3">
      {service.items.map((item, itemIndex) => (
        <li key={itemIndex} className="flex items-start">
          <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ServiceCard;