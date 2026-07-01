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
    <nav
      className="mb-8 rounded-lg border border-brand-line bg-white p-6"
      aria-label="Mục lục bài viết"
    >
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-surface">
            <BookOpen className="h-5 w-5 text-brand-primaryDark" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-semibold text-brand-ink">Mục lục</h2>
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
    </nav>
  );
};

export default TableOfContents;
