// src/components/layout/Breadcrumb.tsx
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BreadcrumbItem } from '../../types/service';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav className="border-b border-brand-line bg-white py-3" aria-label="Breadcrumb">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-2 text-sm">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-brand-muted" aria-hidden="true" />
            )}
            <Link
              to={item.href}
              aria-current={index === items.length - 1 ? 'page' : undefined}
              className="flex items-center gap-1 rounded-sm text-brand-muted transition-colors hover:text-brand-primaryDark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/30 aria-[current=page]:font-semibold aria-[current=page]:text-brand-ink"
            >
              {index === 0 && <Home className="h-4 w-4" aria-hidden="true" />}
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  </nav>
);
