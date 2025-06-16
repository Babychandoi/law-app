import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

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
  isExpanded,
  onToggle,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <button
        onClick={() => onToggle(id)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
            {icon}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
        </div>
        <div className="text-gray-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <div className="pt-6">
            <p className="text-gray-700 leading-relaxed text-justify">
              {content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Section;