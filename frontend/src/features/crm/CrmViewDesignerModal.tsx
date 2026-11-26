import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Copy, Search, Star, Trash2, X } from 'lucide-react';
import type { CrmColumnOption } from './CrmColumnPicker';
import type { CrmSavedView, CrmSortFieldOption, CrmSummaryFieldOption } from './viewConfigs';

export interface CrmViewDesignerModalProps {
  open: boolean;
  mode: 'edit' | 'create';
  view: CrmSavedView;
  allColumns: CrmColumnOption[];
  defaultColumnKeys: string[];
  allSummaryFields?: CrmSummaryFieldOption[];
  defaultSummaryKeys?: string[];
  sortFields: CrmSortFieldOption[];
  defaultSortField: string;
  onClose: () => void;
  onSave: (savedView: CrmSavedView) => void;
  onDelete?: (viewId: string) => void;
}

const EMPTY_SUMMARY_FIELDS: CrmSummaryFieldOption[] = [];
const EMPTY_SUMMARY_KEYS: string[] = [];

export default function CrmViewDesignerModal({
  open,
  mode,
  view,
  allColumns,
  defaultColumnKeys,
  allSummaryFields = EMPTY_SUMMARY_FIELDS,
  defaultSummaryKeys = EMPTY_SUMMARY_KEYS,
  sortFields,
  defaultSortField,
  onClose,
  onSave,
  onDelete,
}: CrmViewDesignerModalProps) {
  const [name, setName] = useState(view.name);
  const [shared, setShared] = useState(view.shared);
  const [favorite, setFavorite] = useState(view.favorite);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(view.columns);
  const [selectedSummaries, setSelectedSummaries] = useState<string[]>(view.summaryKeys);
  const [sortField, setSortField] = useState(view.sortField || defaultSortField);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(view.sortDir || 'desc');

  const [colQuery, setColQuery] = useState('');
  const [sumQuery, setSumQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'create') {
      setName('Giao diện mới');
      setShared(false);
      setFavorite(false);
      setSelectedColumns(defaultColumnKeys);
      setSelectedSummaries(defaultSummaryKeys);
      setSortField(defaultSortField);
      setSortDir('desc');
    } else {
      setName(view.name);
      setShared(view.shared);
      setFavorite(view.favorite);
      setSelectedColumns(view.columns);
      setSelectedSummaries(view.summaryKeys);
      setSortField(view.sortField || defaultSortField);
      setSortDir(view.sortDir || 'desc');
    }
    setColQuery('');
    setSumQuery('');
  }, [open, mode, view, defaultColumnKeys, defaultSummaryKeys, defaultSortField]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const availableColumns = useMemo(() => {
    const q = colQuery.trim().toLowerCase();
    return allColumns.filter(
      (col) => !selectedColumns.includes(col.key) && (!q || col.label.toLowerCase().includes(q))
    );
  }, [allColumns, selectedColumns, colQuery]);

  const chosenColumns = useMemo(
    () =>
      selectedColumns
        .map((key) => allColumns.find((c) => c.key === key))
        .filter((c): c is CrmColumnOption => Boolean(c)),
    [selectedColumns, allColumns]
  );

  const availableSummaries = useMemo(() => {
    const q = sumQuery.trim().toLowerCase();
    return allSummaryFields.filter(
      (f) => !selectedSummaries.includes(f.key) && (!q || f.label.toLowerCase().includes(q))
    );
  }, [allSummaryFields, selectedSummaries, sumQuery]);

  const chosenSummaries = useMemo(
    () =>
      selectedSummaries
        .map((key) => allSummaryFields.find((f) => f.key === key))
        .filter((f): f is CrmSummaryFieldOption => Boolean(f)),
    [selectedSummaries, allSummaryFields]
  );

  if (!open) return null;

  const moveItem = (arr: string[], index: number, direction: -1 | 1): string[] => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= arr.length) return arr;
    const copy = [...arr];
    const [picked] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, picked);
    return copy;
  };

  const handleSave = () => {
    const cleanName = name.trim() || view.name || 'Giao diện tùy chỉnh';
    if (mode === 'create') {
      onSave({
        id: `view-${Date.now()}`,
        name: cleanName,
        section: shared ? 'SHARED' : 'MINE',
        favorite,
        shared,
        isSystem: false,
        columns: selectedColumns,
        summaryKeys: selectedSummaries,
        sortField,
        sortDir,
      });
    } else {
      onSave({
        ...view,
        name: cleanName,
        favorite,
        shared,
        columns: selectedColumns,
        summaryKeys: selectedSummaries,
        sortField,
        sortDir,
      });
    }
    onClose();
  };

  const handleClone = () => {
    const cleanName = `${(name.trim() || view.name).trim()} (Bản sao)`;
    onSave({
      ...view,
      id: `view-${Date.now()}`,
      name: cleanName,
      section: 'MINE',
      favorite: false,
      shared: false,
      isSystem: false,
      columns: selectedColumns,
      summaryKeys: selectedSummaries,
      sortField,
      sortDir,
    });
    onClose();
  };

  const handleResetDefaults = () => {
    setSelectedColumns(defaultColumnKeys);
    setSelectedSummaries(defaultSummaryKeys);
    setSortField(defaultSortField);
    setSortDir('desc');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={mode === 'create' ? 'Thêm giao diện' : 'Sửa giao diện'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 p-3 sm:p-5"
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-line px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              aria-label="Quay lại danh sách"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <ArrowLeft size={15} aria-hidden="true" />
            </button>
            <h2 className="text-base font-bold text-brand-ink">
              {mode === 'create' ? 'Thêm giao diện' : 'Sửa giao diện'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              aria-label="Tên giao diện"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tên giao diện..."
              className="h-8 w-52 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />

            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-brand-ink">
              <input
                type="checkbox"
                checked={shared}
                onChange={(e) => setShared(e.target.checked)}
                aria-label="Chia sẻ cho mọi người"
                className="h-3.5 w-3.5 rounded border-brand-line text-brand-primary focus:ring-brand-primary"
              />
              <span>Chia sẻ cho mọi người</span>
            </label>

            <button
              type="button"
              onClick={() => setFavorite((v) => !v)}
              aria-pressed={favorite}
              aria-label="Đánh dấu giao diện yêu thích"
              className={`inline-flex h-8 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ${
                favorite
                  ? 'border-[#f5b32d] bg-brand-accentSoft text-brand-ink'
                  : 'border-brand-line bg-white text-brand-muted hover:text-brand-ink'
              }`}
            >
              <Star
                size={13}
                className={favorite ? 'fill-[#f5b32d] text-[#f5b32d]' : 'text-brand-muted'}
                aria-hidden="true"
              />
              <span>Yêu thích</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-5">
          <div
            className={`grid grid-cols-1 gap-6 ${
              allSummaryFields.length > 0 ? 'lg:grid-cols-2' : ''
            }`}
          >
            {/* Left Dual-List: Table Columns */}
            <div>
              <p className="mb-2.5 text-xs text-brand-muted">
                Những cột mà bạn chọn chỉ được hiển thị trên giao diện dạng bảng
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Có sẵn */}
                <div className="flex flex-col rounded-lg border border-brand-line bg-white">
                  <div className="border-b border-brand-line px-3 py-2 text-xs font-bold text-brand-ink">
                    Có sẵn
                  </div>
                  <div className="border-b border-brand-line p-2">
                    <div className="relative">
                      <Search
                        size={13}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        aria-label="Tìm cột có sẵn"
                        placeholder="Tìm kiếm"
                        value={colQuery}
                        onChange={(e) => setColQuery(e.target.value)}
                        className="w-full rounded border border-brand-line bg-brand-surface py-1 pl-7 pr-2 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                      />
                    </div>
                  </div>
                  <div className="h-64 space-y-0.5 overflow-y-auto p-1.5">
                    {availableColumns.length === 0 ? (
                      <div className="py-6 text-center text-xs text-brand-muted">
                        Đã chọn hết cột phù hợp
                      </div>
                    ) : (
                      availableColumns.map((col) => (
                        <button
                          key={col.key}
                          type="button"
                          onClick={() => setSelectedColumns((prev) => [...prev, col.key])}
                          className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        >
                          <span className="truncate">{col.label}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Được chọn */}
                <div className="flex flex-col rounded-lg border border-brand-line bg-white">
                  <div className="flex items-center justify-between border-b border-brand-line px-3 py-2 text-xs">
                    <span className="font-bold text-brand-ink">
                      Được chọn (<span className="tabular-nums">{chosenColumns.length}</span>)
                    </span>
                  </div>
                  <div className="h-[297px] space-y-0.5 overflow-y-auto p-1.5">
                    {chosenColumns.map((col, idx) => (
                      <div
                        key={col.key}
                        className="group flex items-center justify-between gap-1 rounded px-2.5 py-1.5 text-xs text-brand-ink hover:bg-brand-surface"
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {col.label}
                          {col.locked && <span className="ml-1 font-bold text-[#9f1239]">*</span>}
                        </span>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => setSelectedColumns((prev) => moveItem(prev, idx, -1))}
                            aria-label={`Di chuyển cột ${col.label} lên`}
                            className="rounded p-0.5 text-brand-muted hover:bg-white hover:text-brand-ink disabled:opacity-30"
                          >
                            <ChevronUp size={13} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === chosenColumns.length - 1}
                            onClick={() => setSelectedColumns((prev) => moveItem(prev, idx, 1))}
                            aria-label={`Di chuyển cột ${col.label} xuống`}
                            className="rounded p-0.5 text-brand-muted hover:bg-white hover:text-brand-ink disabled:opacity-30"
                          >
                            <ChevronDown size={13} aria-hidden="true" />
                          </button>
                          {!col.locked && (
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedColumns((prev) => prev.filter((k) => k !== col.key))
                              }
                              aria-label={`Bỏ cột ${col.label}`}
                              className="rounded p-0.5 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239]"
                            >
                              <X size={13} aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Dual-List: Summary KPI Fields */}
            {allSummaryFields.length > 0 && (
              <div>
                <p className="mb-2.5 text-xs text-brand-muted">
                  Những trường hiển thị tổng trên giao diện dạng bảng
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Có sẵn */}
                  <div className="flex flex-col rounded-lg border border-brand-line bg-white">
                    <div className="border-b border-brand-line px-3 py-2 text-xs font-bold text-brand-ink">
                      Có sẵn
                    </div>
                    <div className="border-b border-brand-line p-2">
                      <div className="relative">
                        <Search
                          size={13}
                          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-muted"
                          aria-hidden="true"
                        />
                        <input
                          type="search"
                          aria-label="Tìm trường hiển thị tổng có sẵn"
                          placeholder="Tìm kiếm"
                          value={sumQuery}
                          onChange={(e) => setSumQuery(e.target.value)}
                          className="w-full rounded border border-brand-line bg-brand-surface py-1 pl-7 pr-2 text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                        />
                      </div>
                    </div>
                    <div className="h-64 space-y-0.5 overflow-y-auto p-1.5">
                      {availableSummaries.length === 0 ? (
                        <div className="py-6 text-center text-xs text-brand-muted">
                          Đã chọn hết trường tổng
                        </div>
                      ) : (
                        availableSummaries.map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSelectedSummaries((prev) => [...prev, item.key])}
                            className="flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left text-xs text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                          >
                            <span className="truncate">{item.label}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Được chọn */}
                  <div className="flex flex-col rounded-lg border border-brand-line bg-white">
                    <div className="flex items-center justify-between border-b border-brand-line px-3 py-2 text-xs">
                      <span className="font-bold text-brand-ink">Được chọn</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSummaries(defaultSummaryKeys)}
                        className="font-semibold text-brand-primary hover:underline focus-visible:outline-none"
                      >
                        Mặc định
                      </button>
                    </div>
                    <div className="h-[297px] space-y-0.5 overflow-y-auto p-1.5">
                      <div className="rounded px-2.5 py-1.5 text-xs text-brand-muted">Tổng số</div>
                      {chosenSummaries.map((item, idx) => (
                        <div
                          key={item.key}
                          className="flex items-center justify-between gap-1 rounded px-2.5 py-1.5 text-xs text-brand-ink hover:bg-brand-surface"
                        >
                          <span className="min-w-0 flex-1 truncate">{item.label}</span>
                          <div className="flex shrink-0 items-center gap-0.5">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                setSelectedSummaries((prev) => moveItem(prev, idx, -1))
                              }
                              aria-label={`Di chuyển trường tổng ${item.label} lên`}
                              className="rounded p-0.5 text-brand-muted hover:bg-white hover:text-brand-ink disabled:opacity-30"
                            >
                              <ChevronUp size={13} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === chosenSummaries.length - 1}
                              onClick={() => setSelectedSummaries((prev) => moveItem(prev, idx, 1))}
                              aria-label={`Di chuyển trường tổng ${item.label} xuống`}
                              className="rounded p-0.5 text-brand-muted hover:bg-white hover:text-brand-ink disabled:opacity-30"
                            >
                              <ChevronDown size={13} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSummaries((prev) => prev.filter((k) => k !== item.key))
                              }
                              aria-label={`Bỏ trường tổng ${item.label}`}
                              className="rounded p-0.5 text-brand-muted hover:bg-[#ffe4e6] hover:text-[#9f1239]"
                            >
                              <X size={13} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sort Configuration */}
          <div className="border-t border-brand-line pt-4">
            <div className="mb-2.5 text-sm font-semibold text-brand-ink">Sắp xếp dữ liệu theo</div>
            <div className="flex flex-wrap items-center gap-5">
              <select
                aria-label="Trường sắp xếp dữ liệu"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="h-9 min-w-[220px] rounded-md border border-brand-line bg-white px-3 text-xs font-medium text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                {sortFields.map((sf) => (
                  <option key={sf.field} value={sf.field}>
                    {sf.label}
                  </option>
                ))}
              </select>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-brand-ink">
                <input
                  type="radio"
                  name="crm-view-sort-dir"
                  checked={sortDir === 'asc'}
                  onChange={() => setSortDir('asc')}
                  aria-label="Sắp xếp tăng dần"
                  className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                />
                <span>Tăng dần</span>
              </label>

              <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-brand-ink">
                <input
                  type="radio"
                  name="crm-view-sort-dir"
                  checked={sortDir === 'desc'}
                  onChange={() => setSortDir('desc')}
                  aria-label="Sắp xếp giảm dần"
                  className="h-4 w-4 border-brand-line text-brand-primary focus:ring-brand-primary"
                />
                <span>Giảm dần</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-brand-line bg-brand-surface/50 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-md border border-brand-line bg-white px-4 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Hủy
            </button>

            {mode === 'edit' && (
              <button
                type="button"
                onClick={handleClone}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-brand-primary bg-white px-3.5 text-xs font-semibold text-brand-primary hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <Copy size={13} aria-hidden="true" />
                <span>Nhân bản</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-8 items-center rounded-md bg-brand-primary px-5 text-xs font-semibold text-white hover:bg-brand-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              Lưu
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2 text-xs font-semibold text-brand-primary hover:underline focus-visible:outline-none"
            >
              Khôi phục mặc định
            </button>
          </div>

          {mode === 'edit' && !view.isSystem && onDelete && (
            <button
              type="button"
              onClick={() => {
                onDelete(view.id);
                onClose();
              }}
              className="inline-flex h-8 items-center gap-1 rounded-md px-2.5 text-xs font-semibold text-[#9f1239] hover:bg-[#ffe4e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Trash2 size={13} aria-hidden="true" />
              <span>Xóa giao diện</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
