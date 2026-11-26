import React from 'react';
import { Pencil, RotateCcw, Save } from 'lucide-react';
import type { CrmQuickStatGroup, CrmQuickStatRow } from './CrmFilterPanel';

export interface CrmQuickEditBarProps {
  dirtyCount: number;
  saving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export default function CrmQuickEditBar({
  dirtyCount,
  saving,
  onCancel,
  onSave,
}: CrmQuickEditBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-line bg-brand-accentSoft/50 px-3 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-line bg-white px-2.5 py-0.5 font-semibold text-brand-primary">
          <Pencil size={12} aria-hidden="true" />
          <span>Chế độ Sửa nhanh</span>
        </span>
        <span className="font-semibold tabular-nums text-brand-ink">Đã sửa {dirtyCount} dòng</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="inline-flex h-7 items-center gap-1 rounded-md border border-brand-line bg-white px-3 text-xs font-semibold text-brand-ink hover:bg-brand-surface disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <RotateCcw size={12} aria-hidden="true" />
          <span>Hủy bỏ</span>
        </button>

        <button
          type="button"
          disabled={dirtyCount === 0 || saving}
          onClick={onSave}
          className="inline-flex h-7 items-center gap-1.5 rounded-md bg-brand-primary px-3.5 text-xs font-semibold tabular-nums text-white hover:bg-brand-primaryDark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <Save size={12} aria-hidden="true" />
          <span>{saving ? 'Đang lưu...' : `Lưu thay đổi (${dirtyCount})`}</span>
        </button>
      </div>
    </div>
  );
}

export function buildQuickStatsGroups<T>(
  rows: T[],
  accessors: {
    statusLabel: string;
    getStatus: (row: T) => string | null | undefined;
    getAssignee: (row: T) => string | null | undefined;
    getSource?: (row: T) => string | null | undefined;
    getAmount?: (row: T) => number;
  }
): CrmQuickStatGroup[] {
  const aggregate = (
    getter: (row: T) => string | null | undefined,
    fallback: string
  ): CrmQuickStatRow[] => {
    const map = new Map<string, { count: number; amount: number }>();
    rows.forEach((row) => {
      const key = (getter(row) || '').trim() || fallback;
      const cur = map.get(key) ?? { count: 0, amount: 0 };
      cur.count += 1;
      if (accessors.getAmount) {
        cur.amount += Number(accessors.getAmount(row) || 0);
      }
      map.set(key, cur);
    });
    return Array.from(map.entries())
      .map(([label, val]) => ({
        label,
        count: val.count,
        amount: accessors.getAmount ? val.amount : undefined,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const groups: CrmQuickStatGroup[] = [
    {
      title: accessors.statusLabel,
      items: aggregate(accessors.getStatus, 'Chưa phân loại'),
    },
    {
      title: 'Theo Người phụ trách',
      items: aggregate(accessors.getAssignee, 'Chưa phân công'),
    },
  ];

  if (accessors.getSource) {
    groups.push({
      title: 'Theo Nguồn gốc KH',
      items: aggregate(accessors.getSource, 'Chưa rõ nguồn'),
    });
  }

  return groups;
}
