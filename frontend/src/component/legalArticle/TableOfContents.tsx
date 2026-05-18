import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import TocItem from './TocItem';

interface TableOfContentsProps {
  sections: {
    id: string;
    title: string;
    icon: React.ReactNode;
  }[];
  onItemClick: (id: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ sections, onItemClick }) => {
  return (
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-8 border-2 border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-3xl hover:border-blue-400/30">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400"></div>
      
      {/* Decorative background */}
      <div className="absolute top-4 right-4 opacity-5">
        <Sparkles className="w-24 h-24 text-blue-400" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Mục lục
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections.map((section) => (
            <TocItem
              key={section.id}
              id={section.id}
              title={section.title}
              icon={section.icon}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableOfContents;