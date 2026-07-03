import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Wand2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentTemplate, GeneratedDocument } from '../../types/documentTemplate';

export default function GenerateDocument() {
  const { templateId = '' } = useParams();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<GeneratedDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    documentTemplateService
      .getTemplate(templateId)
      .then((data) => {
        setTemplate(data);
        setValues(Object.fromEntries(data.fields.map((f) => [f.fieldKey, f.defaultValue || ''])));
      })
      .catch(() => toast.error('Không tải được mẫu'))
      .finally(() => setLoading(false));
  }, [templateId]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const doc = await documentTemplateService.generate(templateId, values);
      setGenerated(doc);
      toast.success('Đã tạo tài liệu');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Không tạo được tài liệu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-brand-muted">Đang tải...</div>;
  if (!template) return <div className="text-brand-muted">Không tìm thấy mẫu.</div>;

  return (
    <div className="mx-auto max-w-3xl rounded-2xl border border-brand-line bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold">Tạo hồ sơ: {template.name}</h2>
      <p className="mt-1 text-sm text-brand-muted">Nhập thông tin vào các trường đã cấu hình.</p>

      <div className="mt-6 space-y-4">
        {template.fields.map((field) => (
          <label key={field.fieldKey} className="block">
            <span className="text-sm font-medium">
              {field.label || field.fieldKey}{' '}
              {field.required && <span className="text-red-500">*</span>}
            </span>
            {field.helpText && (
              <span className="ml-2 text-xs text-brand-muted">{field.helpText}</span>
            )}
            {field.inputType === 'TEXTAREA' ? (
              <textarea
                value={values[field.fieldKey] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.fieldKey]: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-lg border border-brand-line px-3 py-2 outline-none focus:border-brand-primary"
              />
            ) : (
              <input
                type={
                  field.inputType === 'DATE'
                    ? 'date'
                    : field.inputType === 'NUMBER'
                      ? 'number'
                      : 'text'
                }
                value={values[field.fieldKey] || ''}
                onChange={(e) => setValues((v) => ({ ...v, [field.fieldKey]: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-brand-line px-3 py-2 outline-none focus:border-brand-primary"
              />
            )}
          </label>
        ))}
        <button
          onClick={submit}
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 font-semibold text-white hover:bg-brand-primaryDark disabled:opacity-60"
        >
          <Wand2 size={18} /> {submitting ? 'Đang tạo...' : 'Tạo file Word'}
        </button>
      </div>

      {generated && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-green-800">
          <div className="font-semibold">Đã tạo: {generated.fileName}</div>
          <button
            onClick={() => documentTemplateService.download(generated.id, generated.fileName)}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          >
            <Download size={16} /> Tải về
          </button>
        </div>
      )}

      <Link
        to="/2025/luatpoip/tai-lieu"
        className="mt-5 inline-block text-sm text-brand-primaryDark hover:underline"
      >
        ← Quay lại danh sách
      </Link>
    </div>
  );
}
