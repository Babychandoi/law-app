import React, { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { parseTabularPaste } from './formatters';

export interface CrmImportFieldMapping {
  field: string;
  label: string;
  aliases: string[];
  required?: boolean;
}

export interface CrmImportModalProps {
  open: boolean;
  title: string;
  sampleCsvHeader: string;
  sampleCsvRow: string;
  mappings: CrmImportFieldMapping[];
  onClose: () => void;
  onImport: (items: Record<string, unknown>[]) => Promise<{ imported: number }>;
  onSuccess?: () => void;
}

function normalizeHeaderKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export default function CrmImportModal({
  open,
  title,
  sampleCsvHeader,
  sampleCsvRow,
  mappings,
  onClose,
  onImport,
  onSuccess,
}: CrmImportModalProps) {
  const [rawText, setRawText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const parsed = useMemo(() => parseTabularPaste(rawText), [rawText]);

  const mappedItems = useMemo(() => {
    if (parsed.rows.length === 0) return [];
    return parsed.rows.map((row) => {
      const out: Record<string, unknown> = {};
      const normalizedRowEntries = Object.entries(row).map(([h, v]) => ({
        norm: normalizeHeaderKey(h),
        val: v,
      }));

      mappings.forEach((m) => {
        const candidateNorms = [m.field, m.label, ...m.aliases].map(normalizeHeaderKey);
        const matched = normalizedRowEntries.find((entry) => candidateNorms.includes(entry.norm));
        if (matched && matched.val !== '') {
          out[m.field] = matched.val;
        }
      });

      return out;
    });
  }, [parsed.rows, mappings]);

  if (!open) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawText(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleFillSample = () => {
    setRawText(`${sampleCsvHeader}\n${sampleCsvRow}`);
  };

  const handleConfirmImport = async () => {
    if (mappedItems.length === 0) {
      toast.error('Chưa có dữ liệu hợp lệ để nhập');
      return;
    }
    setImporting(true);
    try {
      const result = await onImport(mappedItems);
      toast.success(`Đã nhập thành công ${result.imported ?? mappedItems.length} bản ghi`);
      setRawText('');
      onClose();
      onSuccess?.();
    } catch {
      toast.error('Nhập dữ liệu thất bại. Vui lòng kiểm tra định dạng cột.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/50 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-brand-line bg-white shadow-soft"
      >
        <div className="flex items-center justify-between border-b border-brand-line px-5 py-3.5">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-brand-primary" aria-hidden="true" />
            <h2 className="text-base font-semibold text-brand-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại nhập từ Excel"
            className="rounded-md p-1 text-brand-muted hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-line bg-brand-surface p-3 text-xs text-brand-ink">
            <div>
              <p className="font-semibold">
                Tải tệp .CSV / .TSV hoặc sao chép trực tiếp vùng bảng từ Excel / Google Sheets:
              </p>
              <p className="mt-0.5 text-brand-muted">
                Dòng đầu tiên là tên cột ({mappings.map((m) => m.label).join(', ')}).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleFillSample}
                className="rounded-md border border-brand-line bg-white px-2.5 py-1.5 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                Chèn dữ liệu mẫu
              </button>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark">
                <Upload size={14} aria-hidden="true" />
                <span>Chọn tệp CSV/TSV</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.txt"
                  aria-label="Chọn tệp CSV hoặc TSV để nhập"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor="crm-excel-paste-area"
              className="mb-1.5 block text-xs font-semibold text-brand-ink"
            >
              Vùng dán dữ liệu từ Excel / Google Sheets
            </label>
            <textarea
              id="crm-excel-paste-area"
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`${sampleCsvHeader}\n${sampleCsvRow}`}
              className="w-full rounded-lg border border-brand-line bg-white p-3 font-mono text-xs text-brand-ink placeholder:text-brand-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            />
          </div>

          {mappedItems.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-ink">
                  Xem trước dữ liệu nhận diện ({mappedItems.length} dòng)
                </span>
                <span className="tabular-nums text-brand-muted">Hiển thị tối đa 5 dòng đầu</span>
              </div>
              <div className="overflow-x-auto rounded-lg border border-brand-line">
                <table className="min-w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-brand-line bg-brand-surface text-brand-ink">
                      <th className="px-2.5 py-2 font-semibold">#</th>
                      {mappings.map((m) => (
                        <th key={m.field} className="px-2.5 py-2 font-semibold">
                          {m.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line">
                    {mappedItems.slice(0, 5).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-2.5 py-1.5 tabular-nums text-brand-muted">{idx + 1}</td>
                        {mappings.map((m) => (
                          <td key={m.field} className="px-2.5 py-1.5 text-brand-ink">
                            {String(item[m.field] ?? '—')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-line bg-brand-surface/50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-brand-line bg-white px-4 py-1.5 text-xs font-semibold text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={importing || mappedItems.length === 0}
            onClick={handleConfirmImport}
            className="rounded-md bg-brand-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            {importing ? 'Đang nhập dữ liệu...' : `Nhập ${mappedItems.length} bản ghi`}
          </button>
        </div>
      </div>
    </div>
  );
}
