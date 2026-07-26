import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

/** Breadcrumb điều hướng: mục cuối là trang hiện tại (không link). */
const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {it.to && !last ? (
                <Link to={it.to} className="hover:text-brand-goldDark">
                  {it.label}
                </Link>
              ) : (
                <span
                  className={last ? 'text-gray-700 font-medium' : ''}
                  aria-current={last ? 'page' : undefined}
                >
                  {it.label}
                </span>
              )}
              {!last && <ChevronRight className="h-3 w-3 text-gray-400" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
