import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentBundle, DocumentTemplate } from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';

const DOCUMENT_BASE = '/2025/luatpoip/tai-lieu';

interface EditorItem {
  templateId: string;
  required: boolean;
}

export default function BundleEditor() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [items, setItems] = useState<EditorItem[]>([]);
  const [picker, setPicker] = useState('');
  const [revision, setRevision] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const activeTemplates = await documentTemplateService.listTemplates('ACTIVE');
        if (!active) return;
        setTemplates(activeTemplates);
        if (!isNew) {
          const bundle: DocumentBundle = await documentTemplateService.getBundle(id!);
          if (!active) return;
          setName(bundle.name);
          setDescription(bundle.description || '');
          setServiceName(bundle.serviceName || '');
          setRevision(bundle.revision);
          setItems(
            [...bundle.items]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => ({ templateId: item.templateId, required: item.required }))
          );
        }
      } catch (e: any) {
        if (active) setLoadError(e?.response?.data?.message || 'Không tải được dữ liệu.');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id, isNew]);

  const templateName = useMemo(() => {
    const map: Record<string, string> = {};
    templates.forEach((t) => (map[t.id] = t.name));
    return map;
  }, [templates]);

  const available = templates.filter((t) => !items.some((item) => item.templateId === t.id));

  const addItem = () => {
    if (!picker) return;
    setItems((current) => [...current, { templateId: picker, required: true }]);
    setPicker('');
  };

  const move = (index: number, delta: number) => {
    setItems((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const save = async () => {
    if (!name.trim()) {
      toast.error('Tên bộ mẫu là bắt buộc.');
      return;
    }
    if (items.length === 0) {
      toast.error('Bộ mẫu cần ít nhất một biểu mẫu.');
      return;
    }
    setSaving(true);
    try {
      const request = {
        name: name.trim(),
        description: description.trim(),
        serviceName: serviceName.trim(),
        items: items.map((item, index) => ({
          templateId: item.templateId,
          sortOrder: index + 1,
          required: item.required,
        })),
        expectedRevision: revision,
      };
      if (isNew) {
        await documentTemplateService.createBundle(request);
        toast.success('Đã tạo bộ mẫu');
      } else {
        await documentTemplateService.updateBundle(id!, request);
        toast.success('Đã cập nhật bộ mẫu');
      }
      navigate(`${DOCUMENT_BASE}/bundles`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không lưu được bộ mẫu.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải" />
      </div>
    );
  }
  if (loadError) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        {loadError}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link
        to={`${DOCUMENT_BASE}/bundles`}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-goldDark hover:underline"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Bộ mẫu
      </Link>
      <h2 className="text-2xl font-semibold">{isNew ? 'Tạo bộ mẫu' : 'Sửa bộ mẫu'}</h2>

      <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <Field label="Tên bộ mẫu" htmlFor="bundle-name" required>
          <input
            id="bundle-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            maxLength={200}
          />
        </Field>
        <Field label="Mô tả" htmlFor="bundle-desc">
          <textarea
            id="bundle-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className={inputClass}
            maxLength={2000}
          />
        </Field>
        <Field label="Dịch vụ" htmlFor="bundle-service">
          <input
            id="bundle-service"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className={inputClass}
            maxLength={200}
          />
        </Field>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900">Biểu mẫu trong bộ</h3>
        <p className="mt-1 text-sm text-gray-600">Thứ tự bên dưới là thứ tự sinh tài liệu.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <label htmlFor="bundle-picker" className="sr-only">
            Chọn biểu mẫu để thêm
          </label>
          <select
            id="bundle-picker"
            value={picker}
            onChange={(e) => setPicker(e.target.value)}
            className={`${inputClass} max-w-md`}
          >
            <option value="">— Chọn biểu mẫu —</option>
            {available.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addItem}
            disabled={!picker}
            className="inline-flex items-center gap-1 rounded-lg border border-brand-goldDark px-3 py-2 text-sm font-medium text-brand-goldDark hover:bg-brand-goldDark/5 disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" /> Thêm
          </button>
        </div>

        {items.length === 0 ? (
          <p className="mt-4 text-sm italic text-gray-400">Chưa có biểu mẫu nào trong bộ.</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {items.map((item, index) => (
              <li
                key={item.templateId}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <span className="text-sm font-medium text-gray-500">{index + 1}.</span>
                <span className="flex-1 text-sm text-gray-900">
                  {templateName[item.templateId] || item.templateId}
                </span>
                <label className="flex items-center gap-1 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={item.required}
                    onChange={(e) =>
                      setItems((current) =>
                        current.map((it, i) =>
                          i === index ? { ...it, required: e.target.checked } : it
                        )
                      )
                    }
                  />
                  Bắt buộc
                </label>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label="Lên"
                  className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Xuống"
                  className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                  aria-label="Xóa khỏi bộ"
                  className="rounded p-1 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>

      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2.5 font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-60"
      >
        {saving ? (
          <Spinner size={18} className="text-white" label="Đang lưu" />
        ) : (
          <Save size={18} aria-hidden="true" />
        )}
        {isNew ? 'Tạo bộ mẫu' : 'Lưu thay đổi'}
      </button>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20';

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-gray-800">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
