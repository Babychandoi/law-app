import React from 'react';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: number;
  className?: string;
  /** Nhãn cho screen reader (mặc định "Đang tải"). */
  label?: string;
  /** Bọc trong khối căn giữa (dùng cho trạng thái tải cả trang/khối). */
  center?: boolean;
}

/** Vòng quay tải dùng chung, có nhãn cho screen reader. */
const Spinner: React.FC<SpinnerProps> = ({
  size = 24,
  className = '',
  label = 'Đang tải',
  center,
}) => {
  const icon = (
    <span role="status" className="inline-flex items-center">
      <Loader2
        width={size}
        height={size}
        className={`animate-spin text-brand-goldDark ${className}`}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
  if (center) return <div className="flex items-center justify-center py-12">{icon}</div>;
  return icon;
};

export default Spinner;
