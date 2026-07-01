import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { Save, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import {
  DocumentFieldInputType,
  DocumentTemplate,
  DocumentTemplateField,
} from '../../types/documentTemplate';

const INPUT_TYPES: DocumentFieldInputType[] = ['TEXT', 'TEXTAREA', 'DATE', 'NUMBER'];

export default function TemplateFieldEditor() {
  const { id = '' } = useParams();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [fields, setFields] = useState<DocumentTemplateField[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  const load = async () => {
    setLoading(true);
    try {
      const data = await documentTemplateService.getTemplate(id);
      setTemplate(data);
      setFields(
        data.fields.map((field, index) => ({ ...field, sortOrder: field.sortOrder || index + 1 }))
      );
    } catch {
      toast.error('Không tải được mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const updateField = (index: number, patch: Partial<DocumentTemplateField>) => {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const save = async () => {
    try {
      const saved = await documentTemplateService.updateFields(id, fields);
      setTemplate(saved);
      setFields(saved.fields);
      toast.success('Đã lưu cấu hình key');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không lưu được cấu hình');
    }
  };

  const publish = async () => {
    try {
      const saved = await documentTemplateService.publish(id);
      setTemplate(saved);
      toast.success('Đã publish mẫu');
      navigate('/2025/luatpoip/tai-lieu');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không publish được mẫu');
    }
  };

  if (!isAdmin) return <Navigate to="/2025/luatpoip/tai-lieu" replace />;
  if (loading) return <div className="text-brand-muted">Đang tải...</div>;
  if (!template) return <div className="text-brand-muted">Không tìm thấy mẫu.</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Cấu hình key: {template.name}</h2>
          <p className="text-sm text-brand-muted">
            Đặt label để nhân viên nhập thông tin khi tạo hồ sơ.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="inline-flex items-center gap-2 rounded-lg border border-brand-line bg-white px-4 py-2 hover:bg-brand-surface"
          >
            <Save size={16} /> Lưu
          </button>
          <button
            onClick={publish}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primaryDark"
          >
            <Send size={16} /> Publish
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-line bg-white shadow-soft">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-brand-surface text-left text-brand-muted">
            <tr>
              <th className="px-4 py-3">Key</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Kiểu input</th>
              <th className="px-4 py-3">Bắt buộc</th>
              <th className="px-4 py-3">Gợi ý</th>
              <th className="px-4 py-3">Thứ tự</th>
              <th className="px-4 py-3">Mặc định</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field.fieldKey} className="border-t border-brand-line">
                <td className="px-4 py-3 font-mono text-xs">
                  ${'{'}
                  {field.fieldKey}
                  {'}'}
                </td>
                <td className="px-4 py-3">
                  <input
                    value={field.label || ''}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    className="w-full rounded border border-brand-line px-2 py-1.5 outline-none focus:border-brand-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={field.inputType}
                    onChange={(e) =>
                      updateField(index, { inputType: e.target.value as DocumentFieldInputType })
                    }
                    className="rounded border border-brand-line px-2 py-1.5"
                  >
                    {INPUT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(index, { required: e.target.checked })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    value={field.helpText || ''}
                    onChange={(e) => updateField(index, { helpText: e.target.value })}
                    className="w-full rounded border border-brand-line px-2 py-1.5 outline-none focus:border-brand-primary"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={field.sortOrder}
                    onChange={(e) => updateField(index, { sortOrder: Number(e.target.value) })}
                    className="w-20 rounded border border-brand-line px-2 py-1.5"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    value={field.defaultValue || ''}
                    onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                    className="w-full rounded border border-brand-line px-2 py-1.5 outline-none focus:border-brand-primary"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link to="/2025/luatpoip/tai-lieu" className="text-sm text-brand-primaryDark hover:underline">
        ← Quay lại danh sách
      </Link>
    </div>
  );
}
