import React from 'react';
import { CARD_BASE } from './tokens';

export interface CardProps {
  title?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/** Khối nội dung dùng chung: nền trắng, bo góc, đổ bóng nhẹ, có header tùy chọn. */
const Card: React.FC<CardProps> = ({
  title,
  actions,
  className = '',
  bodyClassName = '',
  children,
}) => (
  <div className={`${CARD_BASE} ${className}`}>
    {(title || actions) && (
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        {typeof title === 'string' ? (
          <h3 className="font-semibold text-gray-900">{title}</h3>
        ) : (
          title
        )}
        {actions}
      </div>
    )}
    <div className={`p-5 ${bodyClassName}`}>{children}</div>
  </div>
);

export default Card;
