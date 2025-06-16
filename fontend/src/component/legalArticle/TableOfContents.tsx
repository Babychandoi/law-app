import React from 'react';
import { BookOpen } from 'lucide-react';
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
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" />
        Mục lục
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
  );
};

export default TableOfContents;