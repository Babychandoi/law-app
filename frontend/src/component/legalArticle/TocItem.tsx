import React from 'react';

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
      className="flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="text-blue-600 group-hover:text-blue-700">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
        {title}
      </span>
    </button>
  );
};

export default TocItem;