import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TocItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  onClick: (id: string) => void;
}

const TocItem: React.FC<TocItemProps> = ({ id, title, icon, onClick }) => {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="group flex min-h-11 w-full items-center gap-3 rounded-md border border-brand-line bg-brand-surface p-4 text-left transition-colors duration-200 hover:border-brand-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/30"
    >
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-white text-brand-primaryDark">
        {icon}
      </div>
      <span className="flex-1 text-sm font-semibold text-brand-ink">{title}</span>
      <ArrowRight className="h-4 w-4 text-brand-primaryDark" aria-hidden="true" />
    </button>
  );
};

export default TocItem;
