import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export interface Column<T> {
  key: string;
  header: string;
  /** Nội dung ô (mặc định lấy theo key). */
  render?: (row: T) => React.ReactNode;
  /** Cho phép sắp xếp theo cột này. */
  sortable?: boolean;
  /** Giá trị dùng để so sánh khi sắp xếp (mặc định (row as any)[key]). */
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  className?: string;
  headerClassName?: string;
  /** Ẩn cột này trong thẻ mobile mặc định. */
  hideOnCard?: boolean;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Chuỗi để đối chiếu khi tìm kiếm (mặc định ghép tất cả giá trị cột). */
  searchText?: (row: T) => string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Thẻ hiển thị trên mobile (mặc định tự dựng từ columns). */
  mobileCard?: (row: T) => React.ReactNode;
  toolbar?: React.ReactNode;
  /** Nếu đặt, lưu trạng thái tìm kiếm/sắp xếp/trang lên URL (dùng làm namespace param). */
  urlKey?: string;
  /** Cho phép chọn nhiều dòng (hiện cột checkbox + thanh hành động hàng loạt). */
  selectable?: boolean;
  /** Render các nút hành động hàng loạt; nhận danh sách dòng đang chọn + hàm xoá chọn. */
  bulkActions?: (selected: T[], clearSelection: () => void) => React.ReactNode;
  /**
   * Phân trang phía SERVER: `data` là dữ liệu của trang hiện tại; DataTable không tự cắt trang.
   * page 1-based. Khi đặt, DataTable hiển thị điều khiển trang theo tổng số trang từ server.
   */
  serverPagination?: {
    page: number;
    totalPages: number;
    totalElements?: number;
    onPageChange: (page: number) => void;
  };
}

const ALIGN: Record<'left' | 'right' | 'center', string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

const cellValue = <T,>(row: T, col: Column<T>): React.ReactNode =>
  col.render ? col.render(row) : ((row as Record<string, unknown>)[col.key] as React.ReactNode);

const sortVal = <T,>(row: T, col: Column<T>): string | number => {
  if (col.sortValue) return col.sortValue(row);
  const v = (row as Record<string, unknown>)[col.key];
  return typeof v === 'number' ? v : String(v ?? '');
};

/**
 * Bảng dữ liệu dùng chung: sắp xếp theo cột, tìm kiếm, phân trang phía client,
 * và tự chuyển sang danh sách thẻ trên mobile. Dành cho các bảng admin cỡ vừa.
 */
function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  searchText,
  pageSize = 10,
  onRowClick,
  emptyIcon,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  mobileCard,
  toolbar,
  urlKey,
  selectable = false,
  bulkActions,
  serverPagination,
}: DataTableProps<T>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const pk = (k: string) => (urlKey ? `${urlKey}_${k}` : k);

  const [query, setQuery] = useState(() => (urlKey ? (searchParams.get(pk('q')) ?? '') : ''));
  const [sortKey, setSortKey] = useState<string | null>(() =>
    urlKey ? searchParams.get(pk('sort')) : null
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(() =>
    urlKey && searchParams.get(pk('dir')) === 'desc' ? 'desc' : 'asc'
  );
  const [page, setPage] = useState(() => {
    const p = urlKey ? Number(searchParams.get(pk('page'))) : 0;
    return p && p > 0 ? p : 1;
  });

  // Đồng bộ trạng thái -> URL (chỉ khi bật urlKey). Dùng functional update để không phụ thuộc
  // searchParams (tránh vòng lặp), ghi replace để không tạo history rác.
  useEffect(() => {
    if (!urlKey) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        query ? next.set(pk('q'), query) : next.delete(pk('q'));
        sortKey ? next.set(pk('sort'), sortKey) : next.delete(pk('sort'));
        sortKey && sortDir === 'desc' ? next.set(pk('dir'), 'desc') : next.delete(pk('dir'));
        page > 1 ? next.set(pk('page'), String(page)) : next.delete(pk('page'));
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sortKey, sortDir, page, urlKey]);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return data;
    const q = query.toLowerCase();
    const toText =
      searchText ?? ((row: T) => columns.map((c) => String(cellValue(row, c) ?? '')).join(' '));
    return data.filter((row) => toText(row).toLowerCase().includes(q));
  }, [data, query, searchable, searchText, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = sortVal(a, col);
      const vb = sortVal(b, col);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'vi') * dir;
    });
  }, [filtered, sortKey, sortDir, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  // Server mode: server đã trả đúng trang -> không cắt phía client.
  const pageRows = serverPagination
    ? sorted
    : sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  // ----- Chọn nhiều dòng -----
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const clearSelection = () => setSelected(new Set());
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const pageKeys = pageRows.map(rowKey);
  const allOnPage = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const toggleAllOnPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) pageKeys.forEach((k) => next.delete(k));
      else pageKeys.forEach((k) => next.add(k));
      return next;
    });
  const selectedRows = sorted.filter((r) => selected.has(rowKey(r)));

  if (loading) return <Spinner center />;

  return (
    <div>
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {searchable && (
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-hidden="true"
              />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-goldDark"
              />
            </div>
          )}
          {toolbar}
        </div>
      )}

      {selectable && selectedRows.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3 rounded-lg bg-brand-surface px-4 py-2.5 text-sm">
          <span className="font-medium text-brand-goldDark">Đã chọn {selectedRows.length}</span>
          <button
            type="button"
            onClick={clearSelection}
            className="text-gray-500 hover:text-gray-700 underline"
          >
            Bỏ chọn
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {bulkActions?.(selectedRows, clearSelection)}
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Bảng — desktop/tablet */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {selectable && (
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả dòng trên trang"
                        checked={allOnPage}
                        onChange={toggleAllOnPage}
                        className="h-4 w-4 accent-brand-goldDark cursor-pointer"
                      />
                    </th>
                  )}
                  {columns.map((col) => {
                    const active = sortKey === col.key;
                    return (
                      <th
                        key={col.key}
                        className={`px-4 py-3 text-sm font-semibold text-gray-700 ${
                          ALIGN[col.align ?? 'left']
                        } ${col.headerClassName ?? ''}`}
                      >
                        {col.sortable ? (
                          <button
                            type="button"
                            onClick={() => toggleSort(col.key)}
                            className="inline-flex items-center gap-1 hover:text-brand-goldDark"
                          >
                            {col.header}
                            {active ? (
                              sortDir === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            ) : (
                              <ArrowUpDown size={14} className="text-gray-400" />
                            )}
                          </button>
                        ) : (
                          col.header
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`border-b border-gray-100 ${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50'
                    } ${selected.has(rowKey(row)) ? 'bg-brand-surface/50' : ''}`}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label="Chọn dòng"
                          checked={selected.has(rowKey(row))}
                          onChange={() => toggleOne(rowKey(row))}
                          className="h-4 w-4 accent-brand-goldDark cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-sm text-gray-800 ${ALIGN[col.align ?? 'left']} ${
                          col.className ?? ''
                        }`}
                      >
                        {cellValue(row, col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Thẻ — mobile */}
          <div className="md:hidden space-y-3">
            {pageRows.map((row) => (
              <div
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`rounded-xl border p-4 bg-white ${
                  selected.has(rowKey(row))
                    ? 'border-brand-gold bg-brand-surface/40'
                    : 'border-gray-200'
                } ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
              >
                {selectable && (
                  <label
                    className="mb-2 flex items-center gap-2 text-sm text-gray-600"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      aria-label="Chọn dòng"
                      checked={selected.has(rowKey(row))}
                      onChange={() => toggleOne(rowKey(row))}
                      className="h-4 w-4 accent-brand-goldDark cursor-pointer"
                    />
                    Chọn
                  </label>
                )}
                {mobileCard
                  ? mobileCard(row)
                  : columns
                      .filter((c) => !c.hideOnCard)
                      .map((col) => (
                        <div key={col.key} className="flex justify-between gap-3 py-1 text-sm">
                          <span className="text-gray-500 shrink-0">{col.header}</span>
                          <span className="text-gray-900 text-right min-w-0 break-words">
                            {cellValue(row, col)}
                          </span>
                        </div>
                      ))}
              </div>
            ))}
          </div>

          {/* Phân trang phía SERVER */}
          {serverPagination && serverPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {serverPagination.totalElements != null
                  ? `${serverPagination.totalElements} mục`
                  : ''}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => serverPagination.onPageChange(serverPagination.page - 1)}
                  disabled={serverPagination.page <= 1}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2">
                  {serverPagination.page}/{serverPagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => serverPagination.onPageChange(serverPagination.page + 1)}
                  disabled={serverPagination.page >= serverPagination.totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Phân trang phía CLIENT */}
          {!serverPagination && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} /{' '}
                {sorted.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-2">
                  {safePage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DataTable;
