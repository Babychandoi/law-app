import React from 'react';
import { LucideIcon } from 'lucide-react';
import Breadcrumb, { BreadcrumbItem } from './Breadcrumb';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

/** Tiêu đề trang admin dùng chung: breadcrumb + icon + tiêu đề + mô tả + vùng hành động. */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  actions,
  breadcrumb,
  className = '',
}) => (
  <div className={className}>
    {breadcrumb && breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} className="mb-2" />}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-surface text-brand-goldDark">
            <Icon className="h-6 w-6" aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </div>
);

export default PageHeader;
