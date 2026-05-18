// src/components/layout/Breadcrumb.tsx
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/utils';
import { BreadcrumbItem } from '../../types/service';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => (
  <nav className="bg-gray-50 py-4" aria-label="Breadcrumb">
    <div className="container mx-auto px-4">
      <ol className="flex items-center space-x-2 text-sm" style={{
        fontFamily: 'Arial, sans-serif',
        fontSize : '1.5rem'
      }}>
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />}
            <a 
              href={item.href}
              className={cn(
                "flex items-center hover:text-blue-600 transition-colors",
                index === 0 && "text-gray-500",
                index === items.length - 1 ? "text-gray-900 font-medium" : "text-gray-600"
              )}
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.name}
            </a>
          </li>
        ))}
      </ol>
    </div>
  </nav>
);
