import React from 'react';
import { Users, Award, BookOpen } from 'lucide-react';
import SectionNumber from '../ui/SectionNumber';
import { TeamSectionProps } from '../types';

const TeamSection: React.FC<TeamSectionProps> = ({ title, content, image }) => (
  <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-6">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <img 
            src={image} 
            alt="Our Team" 
            className="w-full h-80 object-cover rounded-lg shadow-lg"
          />
        </div>
        <div>
          <div className="flex items-center mb-6">
            <SectionNumber number={3} />
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          <div className="space-y-4">
            {content.map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed text-justify">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="flex items-center mt-6 space-x-4">
            <Users className="w-8 h-8 text-blue-600" />
            <Award className="w-8 h-8 text-blue-600" />
            <BookOpen className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TeamSection;