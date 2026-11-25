import React, { useEffect, useRef, useState } from 'react';
import { Columns3, RotateCcw } from 'lucide-react';

export interface CrmColumnOption {
  key: string;
  label: string;
  locked?: boolean;
}

export function usePersistedColumns(
  storageKey: string,
  allColumns: CrmColumnOption[]
): {
  visibleKeys: string[];
  toggleColumn: (key: string) => void;
  resetColumns: () => void;
} {
  const defaultKeys = allColumns.map((c) => c.key);

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(String);
        }
      }
    } catch {
      // Ignore storage error
    }
    return defaultKeys;
  });

  const persist = (next: string[]) => {
    setVisibleKeys(next);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  const toggleColumn = (key: string) => {
    const col = allColumns.find((c) => c.key === key);
    if (col?.locked) return;
    if (visibleKeys.includes(key)) {
      if (visibleKeys.length <= 2) return;
      persist(visibleKeys.filter((k) => k !== key));
    } else {
      const ordered = allColumns
        .map((c) => c.key)
        .filter((k) => k === key || visibleKeys.includes(k));
      persist(ordered);
    }
  };

  const resetColumns = () => {
    persist(defaultKeys);
  };

  return { visibleKeys, toggleColumn, resetColumns };
}

export default function CrmColumnPicker({
  columns,
  visibleKeys,
  onToggle,
  onReset,
}: {
  columns: CrmColumnOption[];
  visibleKeys: string[];
  onToggle: (key: string) => void;
  onReset: () => void;
}) {
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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Tùy chỉnh cột hiển thị"
        aria-expanded={open}
        title="Tùy chỉnh cột"
        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
      >
        <Columns3 size={14} className="text-brand-muted" aria-hidden="true" />
        <span className="hidden sm:inline">Tùy chỉnh cột</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Chọn cột hiển thị trên bảng"
          className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-lg border border-brand-line bg-white p-3 shadow-soft"
        >
          <div className="mb-2 flex items-center justify-between border-b border-brand-line pb-2">
            <span className="text-xs font-semibold text-brand-ink">Tùy chỉnh cột bảng</span>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <RotateCcw size={12} aria-hidden="true" />
              <span>Mặc định</span>
            </button>
          </div>

          <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {columns.map((col) => {
              const checked = visibleKeys.includes(col.key);
              return (
                <label
                  key={col.key}
                  className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-xs text-brand-ink hover:bg-brand-surface"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={col.locked}
                    onChange={() => onToggle(col.key)}
                    aria-label={`Hiển thị cột ${col.label}`}
                    className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="truncate">{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
