import React from 'react';
import { Users, Award, BookOpen, Sparkles, CheckCircle } from 'lucide-react';
import { TeamSectionProps } from '../types';

const TeamSection: React.FC<TeamSectionProps> = ({ title, content, image }) => (
  <section className="py-16 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
    {/* Animated Background */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-400/5 to-pink-400/5 rounded-full mix-blend-multiply filter blur-3xl"></div>
    </div>

    <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="group">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200 group-hover:border-purple-400 transition-all duration-500">
              <img 
                src={image} 
                alt="Our Team" 
                className="w-full h-96 object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
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
          
          <div className="space-y-4 mb-6">
            {content.map((paragraph, index) => (
              <div key={index} className="flex gap-3 group/item">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-6 h-6 bg-purple-50 rounded-full flex items-center justify-center group-hover/item:bg-purple-100 transition-colors duration-300">
                    <CheckCircle className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-justify flex-1">
                  {paragraph}
                </p>
              </div>
            ))}
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg group text-center">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-xs font-semibold text-gray-700">Đội ngũ chuyên nghiệp</div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-lg group text-center">
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-xs font-semibold text-gray-700">Giàu kinh nghiệm</div>
            </div>

            <div className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg group text-center">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-xs font-semibold text-gray-700">Cập nhật kiến thức</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TeamSection;
