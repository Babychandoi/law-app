import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface PopoverProps {
  label: string;
  icon?: LucideIcon;
  align?: 'left' | 'right';
  panelClassName?: string;
  /** Nội dung panel; nhận hàm đóng. */
  children: (close: () => void) => React.ReactNode;
}

/** Menu bật/tắt nhẹ (nút + panel), đóng khi click ra ngoài / Escape. */
const Popover: React.FC<PopoverProps> = ({
  label,
  icon: Icon,
  align = 'right',
  panelClassName = '',
  children,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        {Icon && <Icon size={16} aria-hidden="true" />}
        {label}
        <ChevronDown size={14} className="text-gray-400" aria-hidden="true" />
      </button>
      {open && (
        <div
          className={`absolute z-50 mt-1 min-w-[220px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
};

export default Popover;
