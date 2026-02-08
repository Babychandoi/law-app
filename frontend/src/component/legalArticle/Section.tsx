import React from 'react';

interface SectionProps {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({
  id,
  title,
  content,
  icon,
}) => {
  const colors = [
    'from-blue-400 to-indigo-400',
    'from-green-400 to-emerald-400',
    'from-purple-400 to-pink-400',
    'from-orange-400 to-red-400',
    'from-yellow-400 to-orange-400',
    'from-teal-400 to-cyan-400'
  ];
  
  const colorIndex = parseInt(id.replace(/\D/g, '') || '0') % colors.length;
  const gradientColor = colors[colorIndex];

  return (
    <div 
      id={id} 
      className="group bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:scale-[1.01] hover:border-gray-200"
    >
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`h-12 w-12 bg-gradient-to-br ${gradientColor} rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
            {icon}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
        </div>
        
        <div className={`h-1 w-20 bg-gradient-to-r ${gradientColor} rounded-full mb-4`}></div>
        <p className="text-gray-700 leading-relaxed text-justify whitespace-pre-line">
          {content}
        </p>
      </div>
    </div>
  );
};

export default Section;