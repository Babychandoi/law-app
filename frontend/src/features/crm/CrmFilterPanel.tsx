import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookmarkPlus,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Filter,
  RotateCcw,
  Search,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import type { CrmSavedPreset, CrmSelectOption } from './constants';
import { formatVnd } from './formatters';
import type { CrmFilterRule } from './types';

export type CrmFilterFieldType = 'select' | 'text' | 'number' | 'date' | 'boolean' | 'dateRange';

export interface CrmFilterFieldConfig {
  key: string;
  toKey?: string;
  label: string;
  type: CrmFilterFieldType;
  options?: (string | CrmSelectOption)[];
  placeholder?: string;
  isExtended?: boolean;
}

export interface CrmQuickStatRow {
  label: string;
  count: number;
  amount?: number;
}

export interface CrmQuickStatGroup {
  title: string;
  items: CrmQuickStatRow[];
}

interface CustomSavedFilter {
  id: string;
  label: string;
  rules: CrmFilterRule[];
}

export interface CrmFilterPanelProps {
  open: boolean;
  onClose: () => void;
  presets?: CrmSavedPreset[];
  activePresetId?: string;
  onSelectPreset?: (presetId: string) => void;
  fields: CrmFilterFieldConfig[];
  rules?: CrmFilterRule[];
  onApplyRules?: (nextRules: CrmFilterRule[]) => void;
  values?: Record<string, string>;
  onApply?: (nextValues: Record<string, string>) => void;
  onReset: () => void;
  storageKey?: string;
  quickStats?: CrmQuickStatGroup[];
}

interface OperatorOption {
  op: string;
  label: string;
  hideValue?: boolean;
  isRange?: boolean;
}

const TEXT_OPERATORS: OperatorOption[] = [
  { op: 'CONTAINS', label: 'Chứa' },
  { op: 'NOT_CONTAINS', label: 'Không chứa' },
  { op: 'EQ', label: 'Bằng' },
  { op: 'STARTS_WITH', label: 'Bắt đầu bằng' },
  { op: 'NOT_EMPTY', label: 'Không trống', hideValue: true },
  { op: 'IS_EMPTY', label: 'Trống', hideValue: true },
];

const NUMBER_OPERATORS: OperatorOption[] = [
  { op: 'GTE', label: 'Lớn hơn hoặc bằng ≥' },
  { op: 'LTE', label: 'Nhỏ hơn hoặc bằng ≤' },
  { op: 'BETWEEN', label: 'Trong khoảng', isRange: true },
  { op: 'EQ', label: 'Bằng =' },
  { op: 'GT', label: 'Lớn hơn >' },
  { op: 'LT', label: 'Nhỏ hơn <' },
  { op: 'GT_ZERO', label: 'Khác 0 (> 0)', hideValue: true },
  { op: 'ZERO', label: 'Bằng 0', hideValue: true },
];

const DATE_OPERATORS: OperatorOption[] = [
  { op: 'BETWEEN', label: 'Trong khoảng', isRange: true },
  { op: 'TODAY', label: 'Hôm nay', hideValue: true },
  { op: 'THIS_WEEK', label: 'Tuần này', hideValue: true },
  { op: 'THIS_MONTH', label: 'Tháng này', hideValue: true },
  { op: 'LAST_MONTH', label: 'Tháng trước', hideValue: true },
  { op: 'THIS_YEAR', label: 'Năm nay', hideValue: true },
  { op: 'EQ', label: 'Bằng ngày' },
  { op: 'BEFORE', label: 'Trước ngày' },
  { op: 'AFTER', label: 'Sau ngày' },
  { op: 'IS_EMPTY', label: 'Trống', hideValue: true },
  { op: 'NOT_EMPTY', label: 'Không trống', hideValue: true },
];

const SELECT_OPERATORS: OperatorOption[] = [
  { op: 'EQ', label: 'Là' },
  { op: 'NEQ', label: 'Không là' },
  { op: 'NOT_EMPTY', label: 'Không trống', hideValue: true },
  { op: 'IS_EMPTY', label: 'Trống', hideValue: true },
];

function getDefaultOp(type: CrmFilterFieldType): string {
  switch (type) {
    case 'text':
      return 'CONTAINS';
    case 'number':
      return 'GTE';
    case 'date':
    case 'dateRange':
      return 'BETWEEN';
    case 'select':
      return 'EQ';
    case 'boolean':
      return 'TRUE';
    default:
      return 'EQ';
  }
}

function getOperatorsForType(type: CrmFilterFieldType): OperatorOption[] {
  switch (type) {
    case 'text':
      return TEXT_OPERATORS;
    case 'number':
      return NUMBER_OPERATORS;
    case 'date':
    case 'dateRange':
      return DATE_OPERATORS;
    case 'select':
      return SELECT_OPERATORS;
    default:
      return [];
  }
}

interface DraftFieldRule {
  op: string;
  value: string;
  valueTo: string;
}

const EMPTY_PRESETS: CrmSavedPreset[] = [];
const EMPTY_RULES: CrmFilterRule[] = [];
const EMPTY_VALUES: Record<string, string> = {};
const EMPTY_QUICK_STATS: CrmQuickStatGroup[] = [];

export default function CrmFilterPanel({
  open,
  onClose,
  presets = EMPTY_PRESETS,
  activePresetId = '',
  onSelectPreset,
  fields,
  rules = EMPTY_RULES,
  onApplyRules,
  values = EMPTY_VALUES,
  onApply,
  onReset,
  storageKey,
  quickStats = EMPTY_QUICK_STATS,
}: CrmFilterPanelProps) {
  const [panelTab, setPanelTab] = useState<'filter' | 'stats'>('filter');
  const [savedExpanded, setSavedExpanded] = useState(true);
  const [criteriaExpanded, setCriteriaExpanded] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldQuery, setFieldQuery] = useState('');
  const [showExtended, setShowExtended] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [ruleMap, setRuleMap] = useState<Record<string, DraftFieldRule>>({});
  const [activeCustomId, setActiveCustomId] = useState('');
  const [savingFilterOpen, setSavingFilterOpen] = useState(false);
  const [customFilterName, setCustomFilterName] = useState('');

  const [customFilters, setCustomFilters] = useState<CustomSavedFilter[]>(() => {
    if (!storageKey) return [];
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomSavedFilter[];
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomSavedFilter[];
        if (Array.isArray(parsed)) setCustomFilters(parsed);
      }
    } catch {
      // Ignore
    }
  }, [storageKey]);

  useEffect(() => {
    if (rules.length > 0) {
      const nextChecked: string[] = [];
      const nextMap: Record<string, DraftFieldRule> = {};
      rules.forEach((r) => {
        if (!nextChecked.includes(r.field)) nextChecked.push(r.field);
        nextMap[r.field] = {
          op: r.op || 'EQ',
          value: r.value ?? '',
          valueTo: r.valueTo ?? '',
        };
      });
      setCheckedKeys(nextChecked);
      setRuleMap((prev) => ({ ...prev, ...nextMap }));
      return;
    }

    const legacyActive = fields.filter(
      (f) => Boolean(values[f.key]) || (f.toKey && Boolean(values[f.toKey]))
    );
    if (legacyActive.length > 0) {
      setCheckedKeys((prev) => Array.from(new Set([...prev, ...legacyActive.map((f) => f.key)])));
      setRuleMap((prev) => {
        const next = { ...prev };
        legacyActive.forEach((f) => {
          next[f.key] = {
            op: getDefaultOp(f.type),
            value: values[f.key] ?? '',
            valueTo: f.toKey ? (values[f.toKey] ?? '') : '',
          };
        });
        return next;
      });
    }
  }, [rules, values, fields]);

  const hasExtendedFields = useMemo(() => fields.some((f) => f.isExtended), [fields]);

  const visibleFields = useMemo(() => {
    const q = fieldQuery.trim().toLowerCase();
    if (q) {
      return fields.filter((f) => f.label.toLowerCase().includes(q));
    }
    if (showExtended) {
      return fields;
    }
    return fields.filter((f) => !f.isExtended || checkedKeys.includes(f.key));
  }, [fields, fieldQuery, showExtended, checkedKeys]);

  if (!open) return null;

  const persistCustomFilters = (next: CustomSavedFilter[]) => {
    setCustomFilters(next);
    if (!storageKey) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Ignore storage error
    }
  };

  const toggleFieldCheck = (field: CrmFilterFieldConfig) => {
    const isChecked = checkedKeys.includes(field.key);
    if (isChecked) {
      setCheckedKeys((prev) => prev.filter((k) => k !== field.key));
    } else {
      setCheckedKeys((prev) => [...prev, field.key]);
      setRuleMap((prev) => ({
        ...prev,
        [field.key]: prev[field.key] ?? {
          op: getDefaultOp(field.type),
          value: field.type === 'boolean' ? 'true' : '',
          valueTo: '',
        },
      }));
    }
  };

  const updateFieldRule = (key: string, patch: Partial<DraftFieldRule>) => {
    setRuleMap((prev) => {
      const existing = prev[key] ?? { op: 'EQ', value: '', valueTo: '' };
      return {
        ...prev,
        [key]: { ...existing, ...patch },
      };
    });
  };

  const buildActiveRules = (): CrmFilterRule[] => {
    const built: CrmFilterRule[] = [];
    checkedKeys.forEach((key) => {
      const field = fields.find((f) => f.key === key);
      if (!field) return;
      const draftRule = ruleMap[key] ?? {
        op: getDefaultOp(field.type),
        value: '',
        valueTo: '',
      };

      if (field.type === 'boolean') {
        const boolOp = draftRule.op === 'FALSE' ? 'FALSE' : 'TRUE';
        built.push({
          field: key,
          op: boolOp,
          value: boolOp === 'FALSE' ? 'false' : 'true',
        });
        return;
      }

      const ops = getOperatorsForType(field.type);
      const opMeta = ops.find((o) => o.op === draftRule.op) ?? ops[0];
      const opCode = opMeta?.op ?? draftRule.op;

      if (opMeta?.hideValue) {
        built.push({ field: key, op: opCode });
        return;
      }

      if (opMeta?.isRange) {
        const v1 = draftRule.value.trim();
        const v2 = draftRule.valueTo.trim();
        if (v1 || v2) {
          built.push({
            field: key,
            op: opCode,
            value: v1 || undefined,
            valueTo: v2 || undefined,
          });
        }
        return;
      }

      const val = draftRule.value.trim();
      if (val) {
        built.push({
          field: key,
          op: opCode,
          value: val,
        });
      }
    });
    return built;
  };

  const handleApply = () => {
    const nextRules = buildActiveRules();
    onApplyRules?.(nextRules);

    if (onApply) {
      const legacyOut: Record<string, string> = {};
      checkedKeys.forEach((key) => {
        const field = fields.find((f) => f.key === key);
        const r = ruleMap[key];
        if (!field || !r) return;
        legacyOut[key] = r.value;
        if (field.toKey) {
          legacyOut[field.toKey] = r.valueTo;
        }
      });
      onApply(legacyOut);
    }
  };

  const handleClear = () => {
    setCheckedKeys([]);
    setRuleMap({});
    setActiveCustomId('');
    setSavingFilterOpen(false);
    setCustomFilterName('');
    onReset();
  };

  const handleSaveCustomFilter = () => {
    const trimmed = customFilterName.trim();
    if (!trimmed) return;
    const nextRules = buildActiveRules();
    if (nextRules.length === 0) return;

    const newEntry: CustomSavedFilter = {
      id: `custom-${Date.now()}`,
      label: trimmed,
      rules: nextRules,
    };
    persistCustomFilters([...customFilters, newEntry]);
    setActiveCustomId(newEntry.id);
    setSavedExpanded(true);
    setCustomFilterName('');
    setSavingFilterOpen(false);
    onSelectPreset?.('');
    onApplyRules?.(nextRules);
  };

  const handleSelectCustomFilter = (item: CustomSavedFilter) => {
    if (activeCustomId === item.id) {
      handleClear();
      return;
    }
    setActiveCustomId(item.id);
    onSelectPreset?.('');
    const nextChecked = item.rules.map((r) => r.field);
    const nextMap: Record<string, DraftFieldRule> = {};
    item.rules.forEach((r) => {
      nextMap[r.field] = {
        op: r.op,
        value: r.value ?? '',
        valueTo: r.valueTo ?? '',
      };
    });
    setCheckedKeys(nextChecked);
    setRuleMap(nextMap);
    onApplyRules?.(item.rules);
  };

  const handleDeleteCustomFilter = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = customFilters.filter((c) => c.id !== id);
    persistCustomFilters(next);
    if (activeCustomId === id) {
      setActiveCustomId('');
    }
  };

  const toggleSearchBox = () => {
    setCriteriaExpanded(true);
    setSearchOpen((prev) => {
      const next = !prev;
      if (!next) {
        setFieldQuery('');
      } else {
        setTimeout(() => searchInputRef.current?.focus(), 0);
      }
      return next;
    });
  };

  return (
    <aside
      aria-label="Bộ lọc dữ liệu"
      className="flex h-full w-[276px] shrink-0 flex-col rounded-lg border border-brand-line bg-white"
    >
      {/* Header with Quick Chart / Filter Segmented Pill */}
      <div className="flex h-11 items-center justify-between border-b border-brand-line px-3">
        <span className="text-sm font-semibold text-brand-ink">
          {panelTab === 'stats' ? 'Thống kê nhanh' : 'Bộ lọc'}
        </span>

        <div className="flex items-center gap-1.5">
          <div
            role="group"
            aria-label="Chuyển giữa Thống kê nhanh và Bộ lọc"
            className="inline-flex rounded-md border border-brand-line bg-brand-surface p-0.5"
          >
            <button
              type="button"
              onClick={() => setPanelTab('stats')}
              aria-pressed={panelTab === 'stats'}
              aria-label="Xem thống kê nhanh trong thanh bên"
              title="Thống kê nhanh"
              className={`inline-flex h-6 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                panelTab === 'stats'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              <TrendingUp size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setPanelTab('filter')}
              aria-pressed={panelTab === 'filter'}
              aria-label="Xem tiêu chí lọc"
              title="Tiêu chí lọc"
              className={`inline-flex h-6 w-7 items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                panelTab === 'filter'
                  ? 'bg-brand-primary text-white'
                  : 'text-brand-muted hover:text-brand-ink'
              }`}
            >
              <Filter size={13} aria-hidden="true" />
            </button>
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
      </div>

      {panelTab === 'stats' ? (
        <div className="flex-1 space-y-4 overflow-y-auto p-3">
          {quickStats.length === 0 ? (
            <p className="py-8 text-center text-xs text-brand-muted">
              Chưa có dữ liệu thống kê cho danh sách hiện tại.
            </p>
          ) : (
            quickStats.map((group) => {
              const totalCount = group.items.reduce((acc, item) => acc + item.count, 0);
              return (
                <div
                  key={group.title}
                  className="space-y-2 border-b border-brand-line pb-3 last:border-b-0"
                >
                  <div className="text-xs font-bold text-brand-ink">{group.title}</div>
                  <div className="space-y-2">
                    {group.items.map((row) => {
                      const pct = totalCount > 0 ? Math.round((row.count / totalCount) * 100) : 0;
                      return (
                        <div key={row.label} className="space-y-1">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="truncate text-brand-ink">{row.label}</span>
                            <span className="shrink-0 font-semibold tabular-nums text-brand-ink">
                              {row.count} ({pct}%)
                            </span>
                          </div>
                          {row.amount !== undefined && row.amount > 0 && (
                            <div className="text-[11px] tabular-nums text-brand-muted">
                              {formatVnd(row.amount, true)}
                            </div>
                          )}
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface">
                            <div
                              className="h-full rounded-full bg-brand-primary"
                              style={{ width: `${Math.max(pct, row.count > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {/* ĐÃ LƯU */}
            {(presets.length > 0 || customFilters.length > 0) && (
              <div className="border-b border-brand-line pb-3">
                <button
                  type="button"
                  onClick={() => setSavedExpanded((v) => !v)}
                  aria-expanded={savedExpanded}
                  className="flex w-full items-center justify-between py-1 text-left text-xs font-bold text-brand-ink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <span>ĐÃ LƯU</span>
                  {savedExpanded ? (
                    <ChevronUp size={14} className="text-brand-muted" aria-hidden="true" />
                  ) : (
                    <ChevronRight size={14} className="text-brand-muted" aria-hidden="true" />
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
                          onClick={() => {
                            setActiveCustomId('');
                            onSelectPreset?.(isActive ? '' : preset.id);
                          }}
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

                    {customFilters.map((custom) => {
                      const isActive = activeCustomId === custom.id;
                      return (
                        <div
                          key={custom.id}
                          className={`group flex items-center justify-between rounded-md px-2.5 py-1 text-xs transition-colors ${
                            isActive
                              ? 'bg-brand-primary text-white'
                              : 'text-brand-ink hover:bg-brand-surface'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectCustomFilter(custom)}
                            className="min-w-0 flex-1 truncate py-0.5 text-left font-medium focus-visible:outline-none"
                          >
                            {custom.label}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomFilter(custom.id, e)}
                            aria-label={`Xóa bộ lọc đã lưu ${custom.label}`}
                            title="Xóa bộ lọc đã lưu"
                            className={`ml-1.5 shrink-0 rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                              isActive
                                ? 'text-white/90 hover:bg-brand-primaryDark'
                                : 'text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239]'
                            }`}
                          >
                            <Trash2 size={12} aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TIÊU CHÍ LỌC */}
            <div>
              <div className="flex items-center justify-between py-1">
                <button
                  type="button"
                  onClick={() => setCriteriaExpanded((v) => !v)}
                  aria-expanded={criteriaExpanded}
                  className="inline-flex items-center gap-1 text-left text-xs font-bold text-brand-ink hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <span>TIÊU CHÍ LỌC</span>
                  {criteriaExpanded ? (
                    <ChevronDown size={13} className="text-brand-muted" aria-hidden="true" />
                  ) : (
                    <ChevronRight size={13} className="text-brand-muted" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleSearchBox}
                  aria-label="Tìm tiêu chí lọc"
                  aria-expanded={searchOpen}
                  title="Tìm tiêu chí lọc"
                  className={`rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                    searchOpen || fieldQuery
                      ? 'bg-brand-surface text-brand-primary'
                      : 'text-brand-muted hover:bg-brand-surface hover:text-brand-ink'
                  }`}
                >
                  <Search size={14} aria-hidden="true" />
                </button>
              </div>

              {criteriaExpanded && (
                <div className="mt-2 space-y-2.5">
                  {(searchOpen || Boolean(fieldQuery)) && (
                    <div className="relative">
                      <Search
                        size={14}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                        aria-hidden="true"
                      />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={fieldQuery}
                        onChange={(e) => setFieldQuery(e.target.value)}
                        placeholder="Tìm tiêu chí lọc..."
                        aria-label="Ô nhập tìm tiêu chí lọc"
                        className="w-full rounded-md border border-brand-line bg-brand-surface py-1.5 pl-8 pr-2.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    {visibleFields.map((field) => {
                      const checked = checkedKeys.includes(field.key);
                      const draftRule = ruleMap[field.key] ?? {
                        op: getDefaultOp(field.type),
                        value: '',
                        valueTo: '',
                      };
                      const operators = getOperatorsForType(field.type);
                      const selectedOp =
                        operators.find((o) => o.op === draftRule.op) ?? operators[0];

                      return (
                        <div key={field.key} className="space-y-1.5">
                          <label className="flex cursor-pointer items-center gap-2.5 py-0.5 text-xs font-medium text-brand-ink">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleFieldCheck(field)}
                              aria-label={`Lọc theo ${field.label}`}
                              className="h-4 w-4 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
                            />
                            <span>{field.label}</span>
                          </label>

                          {checked && field.type === 'boolean' && (
                            <div className="pl-6">
                              <select
                                aria-label={`Giá trị lọc ${field.label}`}
                                value={draftRule.op === 'FALSE' ? 'FALSE' : 'TRUE'}
                                onChange={(e) =>
                                  updateFieldRule(field.key, {
                                    op: e.target.value,
                                    value: e.target.value === 'FALSE' ? 'false' : 'true',
                                  })
                                }
                                className="w-full rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              >
                                <option value="TRUE">Có</option>
                                <option value="FALSE">Không</option>
                              </select>
                            </div>
                          )}

                          {checked && field.type !== 'boolean' && (
                            <div className="space-y-1.5 rounded-md bg-brand-surface/70 p-2">
                              <select
                                aria-label={`Toán tử ${field.label}`}
                                value={selectedOp?.op ?? draftRule.op}
                                onChange={(e) => updateFieldRule(field.key, { op: e.target.value })}
                                className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                              >
                                {operators.map((opItem) => (
                                  <option key={opItem.op} value={opItem.op}>
                                    {opItem.label}
                                  </option>
                                ))}
                              </select>

                              {!selectedOp?.hideValue && field.type === 'text' && (
                                <input
                                  type="text"
                                  aria-label={`Giá trị lọc ${field.label}`}
                                  placeholder={
                                    field.placeholder ?? `Nhập ${field.label.toLowerCase()}...`
                                  }
                                  value={draftRule.value}
                                  onChange={(e) =>
                                    updateFieldRule(field.key, { value: e.target.value })
                                  }
                                  className="w-full rounded border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                />
                              )}

                              {!selectedOp?.hideValue &&
                                field.type === 'number' &&
                                (selectedOp?.isRange ? (
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input
                                      type="number"
                                      aria-label={`${field.label} từ`}
                                      placeholder="Từ"
                                      value={draftRule.value}
                                      onChange={(e) =>
                                        updateFieldRule(field.key, { value: e.target.value })
                                      }
                                      className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    />
                                    <input
                                      type="number"
                                      aria-label={`${field.label} đến`}
                                      placeholder="Đến"
                                      value={draftRule.valueTo}
                                      onChange={(e) =>
                                        updateFieldRule(field.key, { valueTo: e.target.value })
                                      }
                                      className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                    />
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    aria-label={`Giá trị lọc ${field.label}`}
                                    placeholder="Nhập giá trị số..."
                                    value={draftRule.value}
                                    onChange={(e) =>
                                      updateFieldRule(field.key, { value: e.target.value })
                                    }
                                    className="w-full rounded border border-brand-line bg-white px-2.5 py-1.5 text-xs tabular-nums text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                  />
                                ))}

                              {!selectedOp?.hideValue &&
                                (field.type === 'date' || field.type === 'dateRange') &&
                                (selectedOp?.isRange ? (
                                  <div className="space-y-1.5">
                                    <div>
                                      <span className="mb-0.5 block text-[11px] text-brand-muted">
                                        Từ ngày
                                      </span>
                                      <input
                                        type="date"
                                        aria-label={`${field.label} từ ngày`}
                                        value={draftRule.value}
                                        onChange={(e) =>
                                          updateFieldRule(field.key, { value: e.target.value })
                                        }
                                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                      />
                                    </div>
                                    <div>
                                      <span className="mb-0.5 block text-[11px] text-brand-muted">
                                        Đến ngày
                                      </span>
                                      <input
                                        type="date"
                                        aria-label={`${field.label} đến ngày`}
                                        value={draftRule.valueTo}
                                        onChange={(e) =>
                                          updateFieldRule(field.key, { valueTo: e.target.value })
                                        }
                                        className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <input
                                    type="date"
                                    aria-label={`Giá trị lọc ${field.label}`}
                                    value={draftRule.value}
                                    onChange={(e) =>
                                      updateFieldRule(field.key, { value: e.target.value })
                                    }
                                    className="w-full rounded border border-brand-line bg-white px-2 py-1 text-xs tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                  />
                                ))}

                              {!selectedOp?.hideValue && field.type === 'select' && (
                                <select
                                  aria-label={`Giá trị lọc ${field.label}`}
                                  value={draftRule.value}
                                  onChange={(e) =>
                                    updateFieldRule(field.key, { value: e.target.value })
                                  }
                                  className="w-full rounded border border-brand-line bg-white px-2.5 py-1.5 text-xs text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                                >
                                  <option value="">-- Chọn giá trị --</option>
                                  {(field.options ?? []).map((opt) => {
                                    const o =
                                      typeof opt === 'string' ? { value: opt, label: opt } : opt;
                                    return (
                                      <option key={o.value} value={o.value}>
                                        {o.label}
                                      </option>
                                    );
                                  })}
                                </select>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* MISA Divider: ── Xem thêm ── */}
                  {hasExtendedFields && !fieldQuery.trim() && (
                    <div className="flex items-center gap-2 pt-2">
                      <span className="h-px flex-1 bg-brand-line" aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => setShowExtended((v) => !v)}
                        className="text-xs font-semibold text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      >
                        {showExtended ? 'Thu gọn' : 'Xem thêm'}
                      </button>
                      <span className="h-px flex-1 bg-brand-line" aria-hidden="true" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Save Custom Filter Bar */}
          {storageKey && checkedKeys.length > 0 && (
            <div className="border-t border-brand-line bg-brand-surface/50 px-3 py-2">
              {!savingFilterOpen ? (
                <button
                  type="button"
                  onClick={() => setSavingFilterOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <BookmarkPlus size={13} aria-hidden="true" />
                  <span>Lưu bộ lọc này</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  <input
                    type="text"
                    aria-label="Tên bộ lọc tùy chỉnh"
                    placeholder="Nhập tên bộ lọc (VD: HĐ SHTT tháng này)..."
                    value={customFilterName}
                    onChange={(e) => setCustomFilterName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveCustomFilter();
                      }
                    }}
                    className="w-full rounded border border-brand-line bg-white px-2.5 py-1 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                  />
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSavingFilterOpen(false);
                        setCustomFilterName('');
                      }}
                      className="rounded border border-brand-line bg-white px-2.5 py-1 text-[11px] font-medium text-brand-ink hover:bg-brand-surface"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveCustomFilter}
                      disabled={!customFilterName.trim()}
                      className="rounded bg-brand-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-50"
                    >
                      Lưu vào Đã lưu
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

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
              onClick={handleApply}
              className="flex-1 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Áp dụng
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
