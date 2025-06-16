// components/sections/HeroSection.tsx
import React from 'react';
import { Scale } from 'lucide-react';
export interface HeroSectionProps {
    title: string;
    subtitle: string;
  }

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => (
  <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20">
    <div className="absolute inset-0 bg-black opacity-20"></div>
    <div className="relative container mx-auto px-6 text-center">
      <h1 className="text-5xl font-bold mb-4">{title}</h1>
      <h3 className="text-2xl font-light opacity-90">{subtitle}</h3>
      <div className="mt-8">
        <Scale className="w-16 h-16 mx-auto text-blue-200" />
      </div>
    </div>
  </section>
);

export default HeroSection;