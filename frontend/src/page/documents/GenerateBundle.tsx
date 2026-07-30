import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Download, RefreshCw, Wand2, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import {
  DocumentBundle,
  DocumentTemplate,
  DocumentTemplateField,
  GenerateBundleResponse,
} from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import { createIdempotencyKey } from './documentUi';

const DOCUMENT_BASE = '/2025/luatpoip/tai-lieu';

export default function GenerateBundle() {
  const { id = '' } = useParams();
  const [bundle, setBundle] = useState<DocumentBundle | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<GenerateBundleResponse | null>(null);
  const idempotencyRef = useRef('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const loaded = await documentTemplateService.getBundle(id);
      const details = await Promise.all(
        loaded.items
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => documentTemplateService.getTemplate(item.templateId).catch(() => null))
      );
      setBundle(loaded);
      setTemplates(details.filter((t): t is DocumentTemplate => !!t));
      setValues({});
    } catch (e: any) {
      setLoadError(e?.response?.data?.message || 'Không tải được bộ mẫu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Dữ liệu dùng chung = hợp các field theo fieldKey (giữ định nghĩa đầu tiên gặp).
  const sharedFields = useMemo(() => {
    const map = new Map<string, DocumentTemplateField>();
    templates.forEach((t) =>
      [...t.fields]
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .forEach((f) => {
          if (!map.has(f.fieldKey)) map.set(f.fieldKey, f);
        })
    );
    return Array.from(map.values());
  }, [templates]);

  const templateName = useMemo(() => {
    const map: Record<string, string> = {};
    templates.forEach((t) => (map[t.id] = t.name));
    return map;
  }, [templates]);

  const submit = async () => {
    if (!idempotencyRef.current) idempotencyRef.current = createIdempotencyKey();
    setSubmitting(true);
    try {
      const response = await documentTemplateService.generateBundle(
        id,
        values,
        {},
        idempotencyRef.current
      );
      setResult(response);
      if (response.failed === 0) toast.success(`Đã tạo ${response.succeeded} tài liệu`);
      else
        toast.warn(`Tạo ${response.succeeded}/${response.total} tài liệu; ${response.failed} lỗi`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không tạo được bộ tài liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const download = async (documentId: string, fileName: string) => {
    try {
      await documentTemplateService.download(documentId, fileName);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không tải được file.');
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải bộ mẫu" />
      </div>
    );
  }
  if (loadError || !bundle) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{loadError || 'Không tìm thấy bộ mẫu.'}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 inline-flex items-center gap-2 font-medium underline"
        >
          <RefreshCw size={16} aria-hidden="true" /> Thử lại
        </button>
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
      <div>
        <h2 className="text-2xl font-semibold">Tạo hồ sơ: {bundle.name}</h2>
        <p className="mt-1 text-sm text-brand-muted">
          {templates.length} biểu mẫu · điền dữ liệu dùng chung rồi tạo cả bộ.
        </p>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900">Dữ liệu dùng chung</h3>
        <p className="mt-1 text-sm text-gray-600">
          Áp cho mọi biểu mẫu có trường tương ứng. Trường thiếu ở một mẫu sẽ khiến mẫu đó báo lỗi
          riêng.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sharedFields.map((field) => (
            <div
              key={field.fieldKey}
              className={field.inputType === 'TEXTAREA' ? 'md:col-span-2' : ''}
            >
              <label
                htmlFor={`bundle-field-${field.fieldKey}`}
                className="text-sm font-medium text-gray-800"
              >
                {field.label || field.fieldKey}
              </label>
              {field.inputType === 'TEXTAREA' ? (
                <textarea
                  id={`bundle-field-${field.fieldKey}`}
                  value={values[field.fieldKey] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.fieldKey]: e.target.value }))}
                  rows={3}
                  className={inputClass}
                />
              ) : (
                <input
                  id={`bundle-field-${field.fieldKey}`}
                  type={
                    field.inputType === 'DATE'
                      ? 'date'
                      : field.inputType === 'NUMBER'
                        ? 'number'
                        : 'text'
                  }
                  value={values[field.fieldKey] || ''}
                  onChange={(e) => setValues((v) => ({ ...v, [field.fieldKey]: e.target.value }))}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>
        {sharedFields.length === 0 && (
          <p className="mt-4 text-sm italic text-gray-400">
            Các biểu mẫu trong bộ chưa có trường dữ liệu.
          </p>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={submitting || templates.length === 0}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-4 py-3 font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-60"
        >
          {submitting ? (
            <Spinner size={18} className="text-white" label="Đang tạo bộ tài liệu" />
          ) : (
            <Wand2 size={18} aria-hidden="true" />
          )}
          {submitting ? 'Đang tạo...' : 'Tạo cả bộ'}
        </button>
      </section>

      {result && (
        <section
          aria-label="Kết quả tạo bộ tài liệu"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <h3 className="font-semibold text-gray-900">
            Kết quả: {result.succeeded}/{result.total} thành công
            {result.failed > 0 && ` · ${result.failed} lỗi`}
          </h3>
          <ul className="mt-4 space-y-2">
            {result.results.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
              >
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  {item.document ? (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-green-600"
                      aria-hidden="true"
                    />
                  ) : (
                    <XCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
                  )}
                  <span className="truncate">
                    {templateName[item.templateId] || item.templateId}
                    {item.error && <span className="text-red-700"> — {item.error}</span>}
                  </span>
                </span>
                {item.document && (
                  <button
                    type="button"
                    onClick={() => download(item.document!.id, item.document!.fileName)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                  >
                    <Download size={14} aria-hidden="true" /> Tải
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20';
