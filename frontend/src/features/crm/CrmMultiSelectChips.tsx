import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

export interface CrmMultiSelectChipsProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  allowCustom?: boolean;
  customPlaceholder?: string;
  required?: boolean;
}

export default function CrmMultiSelectChips({
  label,
  options,
  selected,
  onChange,
  allowCustom = false,
  customPlaceholder = 'Nhập thêm rồi nhấn Enter...',
  required = false,
}: CrmMultiSelectChipsProps) {
  const [customInput, setCustomInput] = useState('');

  const toggleItem = (item: string) => {
    if (selected.includes(item)) {
      onChange(selected.filter((x) => x !== item));
    } else {
      onChange([...selected, item]);
    }
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val) return;
    if (!selected.includes(val)) {
      onChange([...selected, val]);
    }
    setCustomInput('');
  };

  const allChoices = Array.from(new Set([...options, ...selected]));

  return (
    <div>
      <span className="mb-1.5 block text-xs font-semibold text-brand-ink">
        {label}
        {required && <span className="ml-0.5 text-[#9f1239]">*</span>}
      </span>
      <div
        role="group"
        aria-label={label}
        className="flex flex-wrap gap-1.5 rounded-lg border border-brand-line bg-white p-2.5"
      >
        {allChoices.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={active}
              onClick={() => toggleItem(opt)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                active
                  ? 'border-brand-primary bg-brand-primary text-white'
                  : 'border-brand-line bg-brand-surface text-brand-ink hover:border-brand-primary'
              }`}
            >
              <span>{opt}</span>
              {active && <X size={12} aria-hidden="true" />}
            </button>
          );
        })}

        {allowCustom && (
          <div className="mt-1 flex w-full items-center gap-1.5 pt-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustom();
                }
              }}
              placeholder={customPlaceholder}
              aria-label={`Thêm ${label}`}
              className="flex-1 rounded-md border border-brand-line bg-white px-2.5 py-1 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
            <button
              type="button"
              onClick={addCustom}
              aria-label={`Thêm thẻ vào ${label}`}
              className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-ink hover:bg-brand-line/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Plus size={13} aria-hidden="true" />
              <span>Thêm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
