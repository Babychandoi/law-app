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
      onClick={() => onClick(id)}
      className="group flex items-center gap-3 p-4 text-left rounded-xl border-2 border-gray-100 hover:border-blue-400/50 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
    >
      <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:from-blue-400 group-hover:to-indigo-400 group-hover:text-white transition-all duration-300 flex-shrink-0">
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 flex-1 transition-colors">
        {title}
      </span>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
    </button>
  );
};

export default TocItem;