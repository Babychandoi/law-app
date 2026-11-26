import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CRM_PAGE_SIZES } from './constants';

export interface CrmFooterKpiItem {
  label: string;
  value: string;
  tone?: 'default' | 'emerald' | 'rose' | 'teal';
}

export interface CrmPaginationFooterProps {
  totalElements: number;
  page: number; // 0-based
  pageSize: number;
  totalPages?: number;
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextSize: number) => void;
  kpis?: CrmFooterKpiItem[];
  onConfigureSummary?: () => void;
}

export default function CrmPaginationFooter({
  totalElements,
  page,
  pageSize,
  totalPages: propTotalPages,
  onPageChange,
  onPageSizeChange,
  kpis = [],
  onConfigureSummary,
}: CrmPaginationFooterProps) {
  const computedTotalPages = Math.max(
    1,
    propTotalPages ?? Math.ceil(totalElements / Math.max(1, pageSize))
  );
  const safePage = Math.min(Math.max(0, page), computedTotalPages - 1);
  const startRecord = totalElements === 0 ? 0 : safePage * pageSize + 1;
  const endRecord = Math.min(totalElements, (safePage + 1) * pageSize);

  return (
    <div className="flex min-h-[48px] shrink-0 flex-wrap items-center justify-between gap-3 border-t border-brand-line bg-white px-3.5 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {onConfigureSummary && (
          <button
            type="button"
            onClick={onConfigureSummary}
            aria-label="Tùy chỉnh trường hiển thị tổng"
            title="Tùy chỉnh trường hiển thị tổng"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-line bg-white text-brand-muted hover:bg-brand-surface hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <SlidersHorizontal size={13} aria-hidden="true" />
          </button>
        )}

        <span className="text-brand-ink">
          Tổng số <strong className="font-bold tabular-nums">{totalElements}</strong>
        </span>

        {kpis.map((kpi) => {
          const valColor =
            kpi.tone === 'emerald'
              ? 'text-[#065f46]'
              : kpi.tone === 'rose'
                ? 'text-[#9f1239]'
                : kpi.tone === 'teal'
                  ? 'text-brand-primary'
                  : 'text-brand-ink';
          return (
            <div
              key={kpi.label}
              className="flex items-center gap-1.5 border-l border-brand-line pl-3.5"
            >
              <span className="text-brand-muted">{kpi.label}:</span>
              <strong className={`font-bold tabular-nums ${valColor}`}>{kpi.value}</strong>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2.5">
        <select
          aria-label="Số dòng mỗi trang"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-7 rounded border border-brand-line bg-white px-2 text-xs font-medium tabular-nums text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          {CRM_PAGE_SIZES.map((sz) => (
            <option key={sz} value={sz}>
              {sz} bản ghi / trang
            </option>
          ))}
        </select>

        <span className="hidden tabular-nums text-brand-muted sm:inline">
          {startRecord} – {endRecord}
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => onPageChange(0)}
            aria-label="Trang đầu"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-line bg-white text-brand-ink hover:bg-brand-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ChevronsLeft size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={safePage <= 0}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Trang trước"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-line bg-white text-brand-ink hover:bg-brand-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          <span className="px-2 font-semibold tabular-nums text-brand-ink">
            {safePage + 1} / {computedTotalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= computedTotalPages - 1}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Trang sau"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-line bg-white text-brand-ink hover:bg-brand-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={safePage >= computedTotalPages - 1}
            onClick={() => onPageChange(computedTotalPages - 1)}
            aria-label="Trang cuối"
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-brand-line bg-white text-brand-ink hover:bg-brand-surface disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <ChevronsRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
