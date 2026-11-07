import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DocumentPaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export default function DocumentPagination({
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: DocumentPaginationProps) {
  if (totalElements === 0) return null;
  const firstItem = (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalElements);
  return (
    <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-gray-600" aria-live="polite">
        Hiển thị <strong>{firstItem}</strong>–<strong>{lastItem}</strong> trong{' '}
        <strong>{totalElements}</strong> kết quả
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="document-page-size" className="text-gray-600">
          Mỗi trang
        </label>
        <select
          id="document-page-size"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
        >
          {[6, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} aria-hidden="true" />
        </button>
        <span className="min-w-[5.5rem] text-center text-gray-700">
          Trang {page}/{Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
