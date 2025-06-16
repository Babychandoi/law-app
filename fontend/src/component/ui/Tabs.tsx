// src/components/ui/Tabs.tsx
import { cn } from '../../lib/utils';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({ value, onValueChange, children, className }: TabsProps) => (
  <div className={cn("w-full", className)}>
    {children}
  </div>
);

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => (
  <div className={cn(
    "inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500",
    className
  )}>
    {children}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const TabsTrigger = ({ value, children, isActive, onClick, className }: TabsTriggerProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      isActive 
        ? "bg-white text-gray-950 shadow-sm" 
        : "text-gray-600 hover:text-gray-900",
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const TabsContent = ({ children, isActive, className }: TabsContentProps) => (
  <div 
    className={cn(
      "mt-6 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      !isActive && "hidden",
      className
    )}
  >
    {children}
  </div>
);
