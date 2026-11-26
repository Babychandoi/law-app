import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Kanban, List, Pencil, type LucideIcon } from 'lucide-react';
import type { CrmViewMode } from './types';

export type { CrmViewMode };

interface ViewModeOption {
  mode: CrmViewMode;
  label: string;
  Icon: LucideIcon;
}

const VIEW_MODE_OPTIONS: ViewModeOption[] = [
  { mode: 'list', label: 'Danh sách', Icon: List },
  { mode: 'kanban', label: 'KanBan', Icon: Kanban },
  { mode: 'quickEdit', label: 'Sửa nhanh', Icon: Pencil },
];

export interface CrmViewModeDropdownProps {
  value: CrmViewMode;
  onChange: (nextMode: CrmViewMode) => void;
  ariaLabel?: string;
}

export default function CrmViewModeDropdown({
  value,
  onChange,
  ariaLabel = 'Chuyển chế độ xem',
}: CrmViewModeDropdownProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const activeOption =
    VIEW_MODE_OPTIONS.find((item) => item.mode === value) ?? VIEW_MODE_OPTIONS[0];
  const ActiveIcon = activeOption.Icon;

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Chế độ xem: ${activeOption.label}`}
        className="inline-flex h-8 items-stretch overflow-hidden rounded-md border border-brand-line bg-white text-brand-ink transition-colors hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <span className="inline-flex items-center justify-center px-2.5">
          <ActiveIcon size={15} className="text-brand-primary" aria-hidden="true" />
        </span>
        <span className="inline-flex items-center justify-center border-l border-brand-line px-1.5 text-brand-muted">
          <ChevronDown size={13} aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Danh sách chế độ xem"
          className="absolute right-0 top-full z-40 mt-1.5 min-w-[168px] rounded-lg border border-brand-line bg-white py-1.5 shadow-soft"
        >
          {VIEW_MODE_OPTIONS.map((option) => {
            const isActive = option.mode === value;
            const ItemIcon = option.Icon;
            return (
              <button
                key={option.mode}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  onChange(option.mode);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  isActive
                    ? 'bg-brand-surface font-semibold text-brand-primary'
                    : 'font-medium text-brand-ink hover:bg-brand-surface/70'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <ItemIcon
                    size={14}
                    className={isActive ? 'text-brand-primary' : 'text-brand-muted'}
                    aria-hidden="true"
                  />
                  <span>{option.label}</span>
                </span>
                {isActive && (
                  <Check size={14} className="shrink-0 text-brand-primary" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
