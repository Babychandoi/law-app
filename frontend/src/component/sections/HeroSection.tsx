import React from 'react';
import { Scale, Sparkles } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => (
  <section className="relative bg-gradient-to-b from-gray-900 via-black to-gray-900 text-white py-24 overflow-hidden">
    {/* Top Accent Line */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
    
    {/* Animated Background Elements */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
    </div>

    <div className="relative container mx-auto px-6 text-center">
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-orange-400"></div>
        <Sparkles className="text-yellow-400" size={24} />
        <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400"></div>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold mb-4">
        <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
          {title}
        </span>
      </h1>
      
      <h3 className="text-2xl md:text-3xl font-light text-gray-300 mb-8">
        {subtitle}
      </h3>
      
      <div className="flex justify-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
          <div className="relative p-6 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-full backdrop-blur-sm border border-yellow-400/30">
            <Scale className="w-16 h-16 text-yellow-400" />
          </div>
        </div>
      </div>
    </div>

    {/* Bottom Decorative Line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
  </section>
);

export default HeroSection;
