import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { ClipboardPaste, Eye, List, Plus, Trash2, Upload, Wand2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import {
  ApplyMappingItem,
  DocumentFieldInputType,
  TemplatePreview,
} from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import useUnsavedChangesWarning from './useUnsavedChangesWarning';

const INPUT_TYPES: DocumentFieldInputType[] = ['TEXT', 'TEXTAREA', 'DATE', 'NUMBER'];

interface MappingRow {
  sampleText: string;
  fieldKey: string;
  label: string;
  helpText: string;
  inputType: DocumentFieldInputType;
  required: boolean;
  defaultValue: string;
}

interface MappingRowErrors {
  sampleText?: string;
  fieldKey?: string;
  label?: string;
}

function emptyRow(): MappingRow {
  return {
    sampleText: '',
    fieldKey: '',
    label: '',
    helpText: '',
    inputType: 'TEXT',
    required: true,
    defaultValue: '',
  };
}

export default function TemplateUpload() {
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [rows, setRows] = useState<MappingRow[]>([emptyRow()]);
  const [applying, setApplying] = useState(false);
  const [rowErrors, setRowErrors] = useState<Record<number, MappingRowErrors>>({});
  const [activeRow, setActiveRow] = useState(0);
  const [mobilePanel, setMobilePanel] = useState<'preview' | 'fields'>('fields');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasUnsavedWork = !!(name.trim() || description.trim() || file || preview);
  const allowNextNavigation = useUnsavedChangesWarning(hasUnsavedWork);

  const previewSrcDoc = useMemo(() => {
    if (!preview) return '';
    // Wrap docx HTML with readable A4-like styling inside the sandboxed iframe.
    const wrapper = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'">
      <style>
      html,body{margin:0;background:#f3f4f6}
      body{padding:24px;display:flex;justify-content:center}
      .page{background:#fff;max-width:820px;width:100%;padding:48px 56px;
        box-shadow:0 1px 6px rgba(0,0,0,.12);font-family:'Times New Roman',serif;
        font-size:15px;line-height:1.55;color:#111}
      .page img{max-width:100%}
      .page table{border-collapse:collapse;max-width:100%}
      .page td,.page th{padding:2px 6px}
    </style></head><body><div class="page">${preview.html}</div></body></html>`;
    return wrapper;
  }, [preview]);
  const previewPlainText = useMemo(() => {
    if (!preview || typeof DOMParser === 'undefined') return '';
    const document = new DOMParser().parseFromString(preview.html, 'text/html');
    return normalizeDocumentText(document.body.textContent ?? '');
  }, [preview]);

  if (!isAdmin) return <Navigate to="/2025/luatpoip/tai-lieu" replace />;

  const doUpload = async () => {
    setUploadError('');
    if (!name.trim()) {
      setUploadError('Tên biểu mẫu là bắt buộc.');
      return;
    }
    if (!file) {
      setUploadError('Hãy chọn một file DOCX.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setUploadError('File phải có định dạng .docx.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setUploadError('File vượt quá giới hạn 25 MB.');
      return;
    }
    setUploading(true);
    try {
      const p = await documentTemplateService.uploadRaw(file, name, description);
      setPreview(p);
      toast.success('Đã tải file. Hãy chỉ ra đoạn text cần thay và đặt key.');
    } catch (e: any) {
      const message = e.response?.data?.message || 'Tải file thất bại';
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (i: number, patch: Partial<MappingRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () => {
    setRows((prev) => {
      setActiveRow(prev.length);
      return [...prev, emptyRow()];
    });
  };
  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== i));
    setRowErrors((previous) =>
      Object.fromEntries(
        Object.entries(previous)
          .filter(([index]) => Number(index) !== i)
          .map(([index, value]) => [Number(index) > i ? Number(index) - 1 : Number(index), value])
      )
    );
    setActiveRow((current) => Math.max(0, current >= i ? current - 1 : current));
  };

  const captureSelection = () => {
    const selection = iframeRef.current?.contentWindow?.getSelection()?.toString().trim() ?? '';
    if (!selection) {
      toast.info('Hãy bôi đen một đoạn trong bản xem trước trước.');
      return;
    }
    updateRow(activeRow, { sampleText: selection });
    setRowErrors((previous) => ({
      ...previous,
      [activeRow]: { ...previous[activeRow], sampleText: undefined },
    }));
    setMobilePanel('fields');
  };

  const apply = async () => {
    if (!preview) return;
    const nextErrors: Record<number, MappingRowErrors> = {};
    const normalizedKeys = rows.map((row) => row.fieldKey.trim().toLocaleLowerCase());
    rows.forEach((row, index) => {
      const hasAnyValue = !!(row.sampleText.trim() || row.fieldKey.trim() || row.label.trim());
      if (!hasAnyValue && rows.length > 1) return;
      if (!row.sampleText.trim())
        nextErrors[index] = { ...nextErrors[index], sampleText: 'Bắt buộc.' };
      else {
        const occurrenceCount = countOccurrences(
          previewPlainText,
          normalizeDocumentText(row.sampleText)
        );
        if (occurrenceCount === 0) {
          nextErrors[index] = {
            ...nextErrors[index],
            sampleText: 'Không tìm thấy đoạn này trong bản xem trước.',
          };
        } else if (occurrenceCount > 1) {
          nextErrors[index] = {
            ...nextErrors[index],
            sampleText: `Đoạn này xuất hiện ${occurrenceCount} lần. Hãy chọn đoạn dài và duy nhất để tránh thay nhầm.`,
          };
        }
      }
      if (!row.fieldKey.trim()) {
        nextErrors[index] = { ...nextErrors[index], fieldKey: 'Bắt buộc.' };
      } else if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(row.fieldKey.trim())) {
        nextErrors[index] = {
          ...nextErrors[index],
          fieldKey: 'Bắt đầu bằng chữ; chỉ dùng chữ, số và dấu gạch dưới.',
        };
      } else if (
        normalizedKeys.filter((key) => key && key === row.fieldKey.trim().toLocaleLowerCase())
          .length > 1
      ) {
        nextErrors[index] = { ...nextErrors[index], fieldKey: 'Key đang bị trùng.' };
      }
      if (!row.label.trim()) nextErrors[index] = { ...nextErrors[index], label: 'Bắt buộc.' };
    });
    setRowErrors(nextErrors);
    const valid = rows.filter(
      (row) => row.sampleText.trim() && row.fieldKey.trim() && row.label.trim()
    );
    if (valid.length === 0 || Object.keys(nextErrors).length > 0) {
      setMobilePanel('fields');
      window.setTimeout(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      toast.warning('Hãy hoàn thiện các trường được đánh dấu.');
      return;
    }
    const mappings: ApplyMappingItem[] = valid.map((r, i) => ({
      sampleText: r.sampleText,
      fieldKey: r.fieldKey.trim(),
      label: r.label.trim(),
      helpText: r.helpText.trim() || undefined,
      inputType: r.inputType,
      required: r.required,
      sortOrder: i + 1,
      defaultValue: r.defaultValue.trim() || undefined,
      expectedOccurrences: 1,
    }));
    setApplying(true);
    try {
      const tpl = await documentTemplateService.applyMappings(preview.id, mappings);
      toast.success('Đã gán key vào file mẫu');
      allowNextNavigation();
      navigate(`/2025/luatpoip/tai-lieu/templates/${tpl.id}/edit`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không gán được key');
    } finally {
      setApplying(false);
    }
  };

  // Step 1: choose file + name
  if (!preview) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold">Tải mẫu Word mới</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Tải file DOCX nguồn. Ở bước kế tiếp, bạn sẽ chọn các đoạn cần thay và đặt key dữ liệu.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="template-name" className="text-sm font-medium">
              Tên biểu mẫu <span className="text-red-600">*</span>
            </label>
            <input
              id="template-name"
              value={name}
              maxLength={200}
              onChange={(e) => {
                setName(e.target.value);
                setUploadError('');
              }}
              aria-invalid={!!uploadError && !name.trim()}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20"
              placeholder="Ví dụ: Hợp đồng dịch vụ"
            />
          </div>
          <div>
            <label htmlFor="template-description" className="text-sm font-medium">
              Mô tả
            </label>
            <textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20"
              rows={3}
              maxLength={2000}
            />
          </div>
          <label
            htmlFor="template-file"
            className="block cursor-pointer rounded-xl border border-dashed border-gray-300 p-6 text-center hover:bg-gray-50 focus-within:ring-2 focus-within:ring-brand-goldDark"
          >
            <Upload className="mx-auto mb-2 text-brand-goldDark" aria-hidden="true" />
            <span className="block break-all text-sm font-medium">
              {file ? file.name : 'Chọn file .docx'}
            </span>
            <span className="mt-1 block text-xs text-gray-500">Tối đa 25 MB</span>
            <input
              id="template-file"
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setUploadError('');
              }}
            />
          </label>
          {uploadError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {uploadError}
            </p>
          )}
          <button
            type="button"
            onClick={doUpload}
            disabled={uploading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-4 py-3 font-semibold text-white hover:bg-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading && <Spinner size={18} className="text-white" label="Đang tải file mẫu" />}
            {uploading ? 'Đang tải...' : 'Tải lên & xem trước'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: fixed preview + mapping panel on desktop, tabs on smaller screens.
  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-gray-200 bg-white p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setMobilePanel('preview')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            mobilePanel === 'preview' ? 'bg-brand-goldDark text-white' : 'text-gray-700'
          }`}
          aria-pressed={mobilePanel === 'preview'}
        >
          <Eye size={16} aria-hidden="true" /> Bản xem trước
        </button>
        <button
          type="button"
          onClick={() => setMobilePanel('fields')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
            mobilePanel === 'fields' ? 'bg-brand-goldDark text-white' : 'text-gray-700'
          }`}
          aria-pressed={mobilePanel === 'fields'}
        >
          <List size={16} aria-hidden="true" /> Trường ({rows.length})
        </button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,460px)]">
        <section
          aria-labelledby="raw-preview-heading"
          className={`${mobilePanel === 'preview' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:block`}
        >
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="raw-preview-heading" className="font-semibold">
                Bản xem trước
              </h3>
              <p className="text-xs text-gray-500">
                Bôi đen đúng đoạn cần thay, sau đó đưa đoạn chọn vào trường đang mở.
              </p>
            </div>
            <button
              type="button"
              onClick={captureSelection}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
            >
              <ClipboardPaste size={16} aria-hidden="true" /> Dùng đoạn đã chọn
            </button>
          </div>
          <iframe
            ref={iframeRef}
            title={`Xem trước file ${name}`}
            sandbox="allow-same-origin"
            srcDoc={previewSrcDoc}
            className="h-[60vh] min-h-[420px] w-full rounded-lg border border-gray-200 bg-gray-100 lg:h-[calc(100vh-18rem)]"
          />
        </section>

        <section
          aria-labelledby="mapping-heading"
          className={`${mobilePanel === 'fields' ? 'block' : 'hidden'} rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:block`}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 id="mapping-heading" className="font-semibold">
                Gán trường dữ liệu
              </h3>
              <p className="text-xs text-gray-500">Trường đang nhận đoạn chọn: #{activeRow + 1}</p>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
            >
              <Plus size={15} aria-hidden="true" /> Thêm
            </button>
          </div>

          <div className="space-y-3 lg:max-h-[calc(100vh-25rem)] lg:overflow-y-auto lg:pr-1">
            {rows.map((row, i) => (
              <MappingCard
                key={i}
                row={row}
                index={i}
                active={activeRow === i}
                errors={rowErrors[i] ?? {}}
                canRemove={rows.length > 1}
                onActivate={() => setActiveRow(i)}
                onChange={(patch) => {
                  updateRow(i, patch);
                  setRowErrors((previous) => ({ ...previous, [i]: {} }));
                }}
                onRemove={() => removeRow(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={apply}
            disabled={applying}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-6 py-3 font-semibold text-white hover:bg-brand-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applying ? (
              <Spinner size={18} className="text-white" label="Đang gán key vào biểu mẫu" />
            ) : (
              <Wand2 size={18} aria-hidden="true" />
            )}
            {applying ? 'Đang xử lý...' : 'Gán key & tiếp tục'}
          </button>
        </section>
      </div>
    </div>
  );
}

function MappingCard({
  row,
  index,
  active,
  errors,
  canRemove,
  onActivate,
  onChange,
  onRemove,
}: {
  row: MappingRow;
  index: number;
  active: boolean;
  errors: MappingRowErrors;
  canRemove: boolean;
  onActivate: () => void;
  onChange: (patch: Partial<MappingRow>) => void;
  onRemove: () => void;
}) {
  const inputClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20';
  return (
    <fieldset
      onFocus={onActivate}
      className={`rounded-xl border p-3 ${active ? 'border-brand-goldDark ring-1 ring-brand-goldDark/20' : 'border-gray-200'}`}
    >
      <legend className="px-1 text-xs font-semibold text-gray-600">Trường {index + 1}</legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <MappingInput
          id={`mapping-${index}-sample`}
          label="Đoạn text trong file"
          value={row.sampleText}
          error={errors.sampleText}
          placeholder="Ví dụ: Nguyễn Văn A"
          maxLength={20000}
          className="sm:col-span-2 lg:col-span-1 xl:col-span-2"
          onChange={(value) => onChange({ sampleText: value })}
        />
        <MappingInput
          id={`mapping-${index}-key`}
          label="Key"
          value={row.fieldKey}
          error={errors.fieldKey}
          placeholder="customerName"
          maxLength={64}
          inputClassName="font-mono"
          onChange={(value) => onChange({ fieldKey: value })}
        />
        <MappingInput
          id={`mapping-${index}-label`}
          label="Nhãn hiển thị"
          value={row.label}
          error={errors.label}
          placeholder="Tên khách hàng"
          maxLength={200}
          onChange={(value) => onChange({ label: value })}
        />
        <label htmlFor={`mapping-${index}-type`} className="block">
          <span className="text-xs font-medium text-gray-700">Kiểu nhập</span>
          <select
            id={`mapping-${index}-type`}
            value={row.inputType}
            onChange={(event) =>
              onChange({ inputType: event.target.value as DocumentFieldInputType })
            }
            className={inputClass}
          >
            {INPUT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={`mapping-${index}-help`} className="block">
          <span className="text-xs font-medium text-gray-700">Gợi ý</span>
          <input
            id={`mapping-${index}-help`}
            value={row.helpText}
            maxLength={1000}
            onChange={(event) => onChange({ helpText: event.target.value })}
            className={inputClass}
          />
        </label>
        <label htmlFor={`mapping-${index}-default`} className="block">
          <span className="text-xs font-medium text-gray-700">Mặc định</span>
          <input
            id={`mapping-${index}-default`}
            value={row.defaultValue}
            maxLength={20000}
            onChange={(event) => onChange({ defaultValue: event.target.value })}
            className={inputClass}
          />
        </label>
        <div className="flex items-end justify-between gap-3 pb-1">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={row.required}
              onChange={(event) => onChange({ required: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-brand-goldDark focus:ring-brand-goldDark"
            />
            Bắt buộc
          </label>
          <button
            type="button"
            onClick={onRemove}
            disabled={!canRemove}
            className="rounded-lg p-2 text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:opacity-30"
            aria-label={`Xóa trường ${index + 1}`}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </fieldset>
  );
}

function MappingInput({
  id,
  label,
  value,
  error,
  placeholder,
  maxLength,
  className = '',
  inputClassName = '',
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-xs font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-lg border px-2.5 py-2 text-sm outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
            : 'border-gray-300 focus:border-brand-goldDark focus:ring-brand-goldDark/20'
        } ${inputClassName}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function normalizeDocumentText(value: string): string {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countOccurrences(content: string, sample: string): number {
  if (!content || !sample) return 0;
  let count = 0;
  let offset = 0;
  while (offset <= content.length - sample.length) {
    const found = content.indexOf(sample, offset);
    if (found === -1) break;
    count += 1;
    offset = found + sample.length;
  }
  return count;
}
