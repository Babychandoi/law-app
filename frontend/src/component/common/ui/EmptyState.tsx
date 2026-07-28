import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Trạng thái rỗng dùng chung: icon + tiêu đề + mô tả + hành động tùy chọn. */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`text-center py-12 px-4 ${className}`}>
    {Icon && <Icon className="w-12 h-12 mx-auto mb-3 text-gray-300" aria-hidden="true" />}
    <p className="font-medium text-gray-900">{title}</p>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export default EmptyState;
