import React from 'react';

export type BadgeColor = 'gold' | 'green' | 'red' | 'gray' | 'blue' | 'yellow';

const COLORS: Record<BadgeColor, string> = {
  gold: 'bg-brand-surface text-brand-goldDark',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-100 text-blue-800',
  yellow: 'bg-yellow-100 text-yellow-800',
};

export interface BadgeProps {
  color?: BadgeColor;
  className?: string;
  children: React.ReactNode;
}

/** Nhãn trạng thái dùng chung. */
const Badge: React.FC<BadgeProps> = ({ color = 'gray', className = '', children }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[color]} ${className}`}
  >
    {children}
  </span>
);

export default Badge;
