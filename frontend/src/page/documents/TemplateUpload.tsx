import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Trash2, Upload, Wand2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { ApplyMappingItem, DocumentFieldInputType, TemplatePreview } from '../../types/documentTemplate';

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

  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [rows, setRows] = useState<MappingRow[]>([emptyRow()]);
  const [applying, setApplying] = useState(false);

  const previewSrcDoc = useMemo(() => {
    if (!preview) return '';
    // Wrap docx HTML with readable A4-like styling inside the sandboxed iframe.
    const wrapper = `<!doctype html><html><head><meta charset="utf-8"><style>
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

  if (!isAdmin) return <Navigate to="/2025/luatpoip/tai-lieu" replace />;

  const doUpload = async () => {
    if (!name.trim()) return toast.warning('Nhập tên mẫu');
    if (!file) return toast.warning('Chọn file .docx');
    if (!file.name.toLowerCase().endsWith('.docx')) return toast.warning('Chỉ hỗ trợ file .docx');
    setUploading(true);
    try {
      const p = await documentTemplateService.uploadRaw(file, name, description);
      setPreview(p);
      toast.success('Đã tải file. Hãy chỉ ra đoạn text cần thay và đặt key.');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Tải file thất bại');
    } finally {
      setUploading(false);
    }
  };

  const updateRow = (i: number, patch: Partial<MappingRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const apply = async () => {
    if (!preview) return;
    const valid = rows.filter((r) => r.sampleText.trim() && r.fieldKey.trim() && r.label.trim());
    if (valid.length === 0) return toast.warning('Thêm ít nhất 1 dòng: đoạn text + key + label');
    for (const r of valid) {
      if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(r.fieldKey)) {
        return toast.warning(`Key không hợp lệ: ${r.fieldKey} (chữ cái, số, _ ; bắt đầu bằng chữ)`);
      }
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
    }));
    setApplying(true);
    try {
      const tpl = await documentTemplateService.applyMappings(preview.id, mappings);
      toast.success('Đã gán key vào file mẫu');
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
      <div className="mx-auto max-w-2xl rounded-2xl border border-brand-line bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Tải mẫu Word mới</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Tải file .docx bình thường (không cần gõ ${'{key}'}). Bước sau bạn sẽ chỉ ra đoạn text cần
          thay.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Tên mẫu</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-brand-line px-3 py-2 outline-none focus:border-brand-gold"
              placeholder="Ví dụ: Hợp đồng dịch vụ"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Mô tả</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-brand-line px-3 py-2 outline-none focus:border-brand-gold"
              rows={3}
            />
          </label>
          <label className="block cursor-pointer rounded-xl border border-dashed border-brand-line p-6 text-center hover:bg-brand-surface">
            <Upload className="mx-auto mb-2 text-brand-gold" />
            <span className="text-sm font-medium">{file ? file.name : 'Chọn file .docx'}</span>
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <button
            onClick={doUpload}
            disabled={uploading}
            className="w-full rounded-lg bg-brand-gold px-4 py-3 font-semibold text-white hover:bg-brand-goldDark disabled:opacity-60"
          >
            {uploading ? 'Đang tải...' : 'Tải lên và xem trước'}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: preview (wide, tall) on top + mapping table below
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-brand-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-muted">Xem trước nội dung file</h3>
          <span className="text-xs text-brand-muted">
            Bôi đen đoạn cần thay trong bản xem trước rồi sao chép vào ô “Đoạn text”.
          </span>
        </div>
        <iframe
          title="preview"
          sandbox="allow-same-origin"
          srcDoc={previewSrcDoc}
          className="h-[78vh] w-full rounded-lg border border-brand-line bg-gray-100"
        />
      </div>

      <div className="rounded-2xl border border-brand-line bg-white p-4 shadow-soft">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-brand-muted">Gán key cho đoạn text cần thay</h3>
          <button
            onClick={addRow}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-line px-3 py-1.5 text-sm hover:bg-brand-surface"
          >
            <Plus size={15} /> Thêm dòng
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid items-end gap-2 rounded-xl border border-brand-line p-3 md:grid-cols-[1fr_180px_1fr_120px_auto_auto]"
            >
              <label className="block">
                <span className="text-xs">Đoạn text trong file</span>
                <input
                  value={row.sampleText}
                  onChange={(e) => updateRow(i, { sampleText: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                  className="mt-1 w-full rounded border border-brand-line px-2 py-1.5 outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs">Key</span>
                <input
                  value={row.fieldKey}
                  onChange={(e) => updateRow(i, { fieldKey: e.target.value })}
                  placeholder="customerName"
                  className="mt-1 w-full rounded border border-brand-line px-2 py-1.5 font-mono text-sm outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs">Label hiển thị</span>
                <input
                  value={row.label}
                  onChange={(e) => updateRow(i, { label: e.target.value })}
                  placeholder="Tên khách hàng"
                  className="mt-1 w-full rounded border border-brand-line px-2 py-1.5 outline-none focus:border-brand-gold"
                />
              </label>
              <label className="block">
                <span className="text-xs">Kiểu nhập</span>
                <select
                  value={row.inputType}
                  onChange={(e) =>
                    updateRow(i, { inputType: e.target.value as DocumentFieldInputType })
                  }
                  className="mt-1 w-full rounded border border-brand-line px-2 py-1.5"
                >
                  {INPUT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={row.required}
                  onChange={(e) => updateRow(i, { required: e.target.checked })}
                />
                Bắt buộc
              </label>
              <button
                onClick={() => removeRow(i)}
                disabled={rows.length === 1}
                className="pb-2 text-red-500 hover:text-red-700 disabled:opacity-30"
                title="Xóa dòng"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={apply}
          disabled={applying}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-gold px-6 py-3 font-semibold text-white hover:bg-brand-goldDark disabled:opacity-60"
        >
          <Wand2 size={18} /> {applying ? 'Đang xử lý...' : 'Gán key và tiếp tục'}
        </button>
      </div>
    </div>
  );
}
