import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Filter, RotateCcw, Search, X } from 'lucide-react';
import type { CrmSavedPreset, CrmSelectOption } from './constants';

export type CrmFilterFieldType = 'select' | 'text' | 'dateRange';

export interface CrmFilterFieldConfig {
  key: string;
  toKey?: string;
  label: string;
  type: CrmFilterFieldType;
  options?: (string | CrmSelectOption)[];
  placeholder?: string;
}

export interface CrmFilterPanelProps {
  open: boolean;
  onClose: () => void;
  presets?: CrmSavedPreset[];
  activePresetId?: string;
  onSelectPreset?: (presetId: string) => void;
  fields: CrmFilterFieldConfig[];
  values: Record<string, string>;
  onApply: (nextValues: Record<string, string>) => void;
  onReset: () => void;
}

export default function CrmFilterPanel({
  open,
  onClose,
  presets = [],
  activePresetId = '',
  onSelectPreset,
  fields,
  values,
  onApply,
  onReset,
}: CrmFilterPanelProps) {
  const [savedExpanded, setSavedExpanded] = useState(true);
  const [criteriaExpanded, setCriteriaExpanded] = useState(true);
  const [fieldQuery, setFieldQuery] = useState('');
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);

  useEffect(() => {
    setDraft(values);
    const active = fields
      .filter((f) => Boolean(values[f.key]) || (f.toKey && Boolean(values[f.toKey])))
      .map((f) => f.key);
    setCheckedKeys((prev) => Array.from(new Set([...prev, ...active])));
  }, [values, fields]);

  const filteredFields = useMemo(() => {
    const q = fieldQuery.trim().toLowerCase();
    if (!q) return fields;
    return fields.filter((f) => f.label.toLowerCase().includes(q));
  }, [fields, fieldQuery]);

  if (!open) return null;

  const toggleFieldCheck = (field: CrmFilterFieldConfig) => {
    const isChecked = checkedKeys.includes(field.key);
    if (isChecked) {
      setCheckedKeys((prev) => prev.filter((k) => k !== field.key));
      setDraft((prev) => {
        const next = { ...prev, [field.key]: '' };
        if (field.toKey) next[field.toKey] = '';
        return next;
      });
    } else {
      setCheckedKeys((prev) => [...prev, field.key]);
    }
  };

  const handleClear = () => {
    setCheckedKeys([]);
    setDraft({});
    onReset();
  };

  return (
    <aside
      aria-label="Bộ lọc dữ liệu"
      className="flex h-full w-[260px] shrink-0 flex-col rounded-lg border border-brand-line bg-white"
    >
      <div className="flex h-11 items-center justify-between border-b border-brand-line px-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-ink">
          <Filter size={15} className="text-brand-primary" aria-hidden="true" />
          <span>Bộ lọc</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bộ lọc"
          className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {presets.length > 0 && (
          <div className="border-b border-brand-line pb-3">
            <button
              type="button"
              onClick={() => setSavedExpanded((v) => !v)}
              aria-expanded={savedExpanded}
              className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wide text-brand-muted hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <span>ĐÃ LƯU</span>
              {savedExpanded ? (
                <ChevronDown size={14} aria-hidden="true" />
              ) : (
                <ChevronRight size={14} aria-hidden="true" />
              )}
            </button>

            {savedExpanded && (
              <div className="mt-1.5 space-y-1">
                {presets.map((preset) => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => onSelectPreset?.(isActive ? '' : preset.id)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                        isActive
                          ? 'bg-brand-primary text-white'
                          : 'text-brand-ink hover:bg-brand-surface'
                      }`}
                    >
                      <span className="truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={() => setCriteriaExpanded((v) => !v)}
            aria-expanded={criteriaExpanded}
            className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wide text-brand-muted hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span>TIÊU CHÍ LỌC</span>
            {criteriaExpanded ? (
              <ChevronDown size={14} aria-hidden="true" />
            ) : (
              <ChevronRight size={14} aria-hidden="true" />
            )}
          </button>

          {criteriaExpanded && (
            <div className="mt-2 space-y-2.5">
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={fieldQuery}
                  onChange={(e) => setFieldQuery(e.target.value)}
                  placeholder="Tìm tiêu chí lọc..."
                  aria-label="Tìm tiêu chí lọc"
                  className="w-full rounded-md border border-brand-line bg-brand-surface py-1.5 pl-8 pr-2.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                />
              </div>

              <div className="space-y-2">
                {filteredFields.map((field) => {
                  const checked = checkedKeys.includes(field.key);
                  return (
                    <div key={field.key} className="space-y-1.5">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-brand-ink">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleFieldCheck(field)}
                          aria-label={`Lọc theo ${field.label}`}
                          className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                        />
                        <span>{field.label}</span>
                      </label>

                      {checked && field.type === 'select' && (
                        <select
                          aria-label={field.label}
                          value={draft[field.key] ?? ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        >
                          <option value="">Tất cả</option>
                          {(field.options ?? []).map((opt) => {
                            const o = typeof opt === 'string' ? { value: opt, label: opt } : opt;
                            return (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            );
                          })}
                        </select>
                      )}

                      {checked && field.type === 'text' && (
                        <input
                          type="text"
                          aria-label={field.label}
                          placeholder={field.placeholder ?? `Nhập ${field.label.toLowerCase()}...`}
                          value={draft[field.key] ?? ''}
                          onChange={(e) =>
                            setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                          }
                          className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        />
                      )}

                      {checked && field.type === 'dateRange' && (
                        <div className="grid grid-cols-1 gap-1.5 rounded-md bg-brand-surface p-2">
                          <div>
                            <span className="mb-0.5 block text-[11px] text-brand-muted">
                              Từ ngày
                            </span>
                            <input
                              type="date"
                              aria-label={`${field.label} từ ngày`}
                              value={draft[field.key] ?? ''}
                              onChange={(e) =>
                                setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                              }
                              className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                            />
                          </div>
                          {field.toKey && (
                            <div>
                              <span className="mb-0.5 block text-[11px] text-brand-muted">
                                Đến ngày
                              </span>
                              <input
                                type="date"
                                aria-label={`${field.label} đến ngày`}
                                value={draft[field.toKey] ?? ''}
                                onChange={(e) =>
                                  setDraft((prev) => ({
                                    ...prev,
                                    [field.toKey as string]: e.target.value,
                                  }))
                                }
                                className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-brand-line p-3">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1 rounded-md border border-brand-line bg-white px-3 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <RotateCcw size={13} aria-hidden="true" />
          <span>Bỏ lọc</span>
        </button>
        <button
          type="button"
          onClick={() => onApply(draft)}
          className="flex-1 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          Áp dụng
        </button>
      </div>
    </aside>
  );
}
