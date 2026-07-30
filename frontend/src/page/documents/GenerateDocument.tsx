import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Edit3,
  FileCheck2,
  Share2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import crmService from '../../service/crm';
import {
  DocumentTemplate,
  DocumentTemplateField,
  GenerateDocumentContext,
  GeneratedDocument,
} from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import { buildCrmPrefill, createIdempotencyKey, validateGeneratedValue } from './documentUi';
import useUnsavedChangesWarning from './useUnsavedChangesWarning';

export default function GenerateDocument() {
  const { templateId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [initialValues, setInitialValues] = useState<Record<string, string>>({});
  type ListRows = Record<string, Array<Record<string, string>>>;
  const [lists, setLists] = useState<ListRows>({});
  const [initialLists, setInitialLists] = useState<ListRows>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generated, setGenerated] = useState<GeneratedDocument | null>(null);
  const [mode, setMode] = useState<'form' | 'review'>('form');
  const [showFilled, setShowFilled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [resolvedContext, setResolvedContext] = useState<GenerateDocumentContext>({});
  const [prefilledCount, setPrefilledCount] = useState(0);
  const [sourceWarning, setSourceWarning] = useState('');
  const idempotencyKeyRef = useRef('');
  const successRef = useRef<HTMLDivElement>(null);

  const contextQuery = searchParams.toString();
  const context = useMemo<GenerateDocumentContext>(() => {
    const params = new URLSearchParams(contextQuery);
    return {
      crmCaseId: params.get('crmCaseId') || undefined,
      customerId: params.get('customerId') || undefined,
      serviceId: params.get('serviceId') || undefined,
      serviceName: params.get('serviceName') || undefined,
      dossierId: params.get('dossierId') || undefined,
      matterReference: params.get('matterReference') || undefined,
      sourceReferences: Object.fromEntries(
        params
          .getAll('sourceReference')
          .map((reference) => reference.split('=', 2))
          .filter((entry) => entry.length === 2 && entry[0] && entry[1])
      ),
    };
  }, [contextQuery]);

  const isDirty =
    !generated &&
    !!template &&
    (JSON.stringify(values) !== JSON.stringify(initialValues) ||
      JSON.stringify(lists) !== JSON.stringify(initialLists));
  useUnsavedChangesWarning(isDirty);

  const load = async () => {
    setLoading(true);
    setLoadError('');
    setSourceWarning('');
    setPrefilledCount(0);
    try {
      const data = await documentTemplateService.getTemplate(templateId);
      const loadedTemplate = {
        ...data,
        fields: [...data.fields].sort((a, b) => a.sortOrder - b.sortOrder),
      };
      const defaults = Object.fromEntries(
        [...data.fields]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((field) => [field.fieldKey, field.defaultValue || ''])
      );
      let nextContext = context;
      if (context.crmCaseId) {
        const [caseResult, partiesResult] = await Promise.allSettled([
          crmService.caseDetail(context.crmCaseId),
          crmService.matterParties(context.crmCaseId),
        ]);
        const caseDetail = caseResult.status === 'fulfilled' ? caseResult.value : undefined;
        const parties = partiesResult.status === 'fulfilled' ? partiesResult.value : [];
        const prefill = buildCrmPrefill(caseDetail, parties);
        let count = 0;
        loadedTemplate.fields.forEach((field) => {
          const suggested = prefill[field.fieldKey.toLocaleLowerCase()];
          if (suggested !== undefined && !defaults[field.fieldKey]) {
            defaults[field.fieldKey] = suggested;
            count += 1;
          }
        });
        setPrefilledCount(count);
        nextContext = {
          ...context,
          customerId: context.customerId || caseDetail?.customerId || undefined,
          serviceId: context.serviceId || caseDetail?.serviceId || undefined,
          serviceName: context.serviceName || caseDetail?.serviceName || undefined,
          matterReference: context.matterReference || caseDetail?.id || undefined,
        };
        if (caseResult.status === 'rejected' && partiesResult.status === 'rejected') {
          setSourceWarning(
            'Không thể nạp dữ liệu CRM. Bạn vẫn có thể nhập thủ công và tạo tài liệu.'
          );
        } else if (partiesResult.status === 'rejected') {
          setSourceWarning('Đã nạp thông tin hồ sơ nhưng chưa nạp được dữ liệu các bên liên quan.');
        }
      }
      const listDefaults: ListRows = {};
      Object.entries(data.lists ?? {}).forEach(([listKey, children]) => {
        listDefaults[listKey] = [emptyRow(children)];
      });
      setTemplate(loadedTemplate);
      setResolvedContext(nextContext);
      setValues(defaults);
      setInitialValues(defaults);
      setLists(listDefaults);
      setInitialLists(listDefaults);
    } catch (error: any) {
      setLoadError(error?.response?.data?.message || 'Không tải được biểu mẫu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, contextQuery]);

  useEffect(() => {
    if (generated) successRef.current?.focus();
  }, [generated]);

  const validate = () => {
    if (!template) return false;
    const nextErrors = Object.fromEntries(
      template.fields
        .map((field) => [
          field.fieldKey,
          validateGeneratedValue(field, values[field.fieldKey] || ''),
        ])
        .filter((entry): entry is [string, string] => !!entry[1])
    );
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setMode('form');
      // Nếu trường lỗi nằm trong nhóm "đã tự điền" đang thu gọn thì mở ra để người dùng thấy.
      if (Object.keys(nextErrors).some((key) => initialValues[key]?.trim())) {
        setShowFilled(true);
      }
      window.setTimeout(() => {
        document.getElementById(`generate-${Object.keys(nextErrors)[0]}`)?.focus();
      });
      return false;
    }
    return true;
  };

  const review = () => {
    if (!validate()) return;
    idempotencyKeyRef.current = createIdempotencyKey();
    setMode('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async () => {
    if (!validate()) return;
    if (!idempotencyKeyRef.current) idempotencyKeyRef.current = createIdempotencyKey();
    setSubmitting(true);
    try {
      const payloadLists = buildListsPayload(lists);
      const document = await documentTemplateService.generate(
        templateId,
        values,
        resolvedContext,
        idempotencyKeyRef.current,
        payloadLists
      );
      setGenerated(document);
      setShareUrl('');
      setInitialValues(values);
      setInitialLists(lists);
      toast.success('Đã tạo tài liệu');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không tạo được tài liệu.');
    } finally {
      setSubmitting(false);
    }
  };

  const download = async () => {
    if (!generated) return;
    setDownloading(true);
    setDownloadError('');
    try {
      await documentTemplateService.download(generated.id, generated.fileName);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Không tải được file.';
      setDownloadError(message);
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const createShare = async () => {
    if (!generated) return;
    setSharing(true);
    try {
      const link = await documentTemplateService.createShareLink(generated.id, {
        expiresInHours: 72,
      });
      setShareUrl(documentTemplateService.shareLinkUrl(link.path));
      toast.success('Đã tạo link chia sẻ (hết hạn sau 72 giờ)');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không tạo được link chia sẻ.');
    } finally {
      setSharing(false);
    }
  };

  const copyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Đã sao chép link');
    } catch {
      toast.info('Hãy sao chép link thủ công.');
    }
  };

  const downloadPdf = async () => {
    if (!generated) return;
    setDownloading(true);
    setDownloadError('');
    try {
      await documentTemplateService.downloadPdf(generated.id, generated.fileName);
    } catch (error: any) {
      const message =
        (await readBlobMessage(error?.response?.data)) ||
        error?.response?.data?.message ||
        'Không tải được PDF.';
      setDownloadError(message);
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const setFieldValue = (fieldKey: string, value: string) => {
    setValues((current) => ({ ...current, [fieldKey]: value }));
    setErrors((current) => {
      if (!current[fieldKey]) return current;
      const next = { ...current };
      delete next[fieldKey];
      return next;
    });
    setGenerated(null);
    idempotencyKeyRef.current = '';
  };

  const markListChanged = () => {
    setGenerated(null);
    idempotencyKeyRef.current = '';
  };

  const setListCell = (listKey: string, index: number, childKey: string, value: string) => {
    setLists((current) => {
      const rows = current[listKey] ? [...current[listKey]] : [];
      rows[index] = { ...rows[index], [childKey]: value };
      return { ...current, [listKey]: rows };
    });
    markListChanged();
  };

  const addListRow = (listKey: string) => {
    const children = template?.lists?.[listKey] ?? [];
    setLists((current) => ({
      ...current,
      [listKey]: [...(current[listKey] ?? []), emptyRow(children)],
    }));
    markListChanged();
  };

  const removeListRow = (listKey: string, index: number) => {
    setLists((current) => ({
      ...current,
      [listKey]: (current[listKey] ?? []).filter((_, i) => i !== index),
    }));
    markListChanged();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải biểu mẫu tạo tài liệu" />
      </div>
    );
  }
  if (loadError || !template) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{loadError || 'Không tìm thấy biểu mẫu.'}</p>
        <button
          type="button"
          onClick={load}
          className="mt-3 inline-flex items-center gap-2 font-medium underline"
        >
          <RefreshCw size={16} aria-hidden="true" /> Thử tải lại
        </button>
      </div>
    );
  }

  const completedRequired = template.fields.filter(
    (field) => field.required && values[field.fieldKey]?.trim()
  ).length;
  const requiredCount = template.fields.filter((field) => field.required).length;
  const listKeys = Object.keys(template.lists ?? {});
  const isPrefilled = (key: string) => !!initialValues[key]?.trim();
  const pendingFields = template.fields.filter((field) => !isPrefilled(field.fieldKey));
  const filledFields = template.fields.filter((field) => isPrefilled(field.fieldKey));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <header>
        <Link
          to="/2025/luatpoip/tai-lieu"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-goldDark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Biểu mẫu
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-goldDark">
              {mode === 'form' ? 'Bước 1/2 · Nhập dữ liệu' : 'Bước 2/2 · Kiểm tra'}
            </p>
            <h2 className="text-2xl font-semibold">Tạo tài liệu: {template.name}</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Phiên bản {template.version}
              {template.serviceName && ` · ${template.serviceName}`}
            </p>
          </div>
          {requiredCount > 0 && mode === 'form' && (
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
              <strong>
                {completedRequired}/{requiredCount}
              </strong>{' '}
              trường bắt buộc đã nhập
            </div>
          )}
        </div>
      </header>

      {hasContext(resolvedContext) && (
        <section
          aria-labelledby="document-context-heading"
          className="rounded-xl border border-blue-200 bg-blue-50 p-4"
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 shrink-0 text-blue-700" size={20} aria-hidden="true" />
            <div>
              <h3 id="document-context-heading" className="font-semibold text-blue-900">
                Đã liên kết nguồn dữ liệu
              </h3>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm text-blue-900 sm:grid-cols-2">
                {resolvedContext.matterReference && (
                  <ContextItem label="Mã hồ sơ" value={resolvedContext.matterReference} />
                )}
                {resolvedContext.dossierId && (
                  <ContextItem label="Dossier" value={resolvedContext.dossierId} />
                )}
                {resolvedContext.crmCaseId && (
                  <ContextItem label="CRM case" value={resolvedContext.crmCaseId} />
                )}
                {resolvedContext.customerId && (
                  <ContextItem label="Khách hàng" value={resolvedContext.customerId} />
                )}
              </dl>
              {prefilledCount > 0 && (
                <p className="mt-2 text-sm font-medium text-blue-900">
                  Đã tự điền {prefilledCount} trường từ nguồn dữ liệu đã xác thực.
                </p>
              )}
              {sourceWarning && (
                <p role="status" className="mt-2 text-sm text-amber-800">
                  {sourceWarning}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {mode === 'form' ? (
        <section
          aria-labelledby="document-data-heading"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <h3 id="document-data-heading" className="font-semibold">
            Dữ liệu tài liệu
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {pendingFields.length > 0
              ? 'Chỉ cần điền các trường còn thiếu bên dưới. Dấu * là trường bắt buộc.'
              : 'Mọi trường đã được tự điền — kiểm tra rồi tạo tài liệu.'}
          </p>
          {pendingFields.length > 0 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {pendingFields.map((field) => (
                <DocumentValueField
                  key={field.fieldKey}
                  field={field}
                  value={values[field.fieldKey] || ''}
                  error={errors[field.fieldKey]}
                  onChange={(value) => setFieldValue(field.fieldKey, value)}
                />
              ))}
            </div>
          )}
          {filledFields.length > 0 && (
            <div className="mt-6 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setShowFilled((v) => !v)}
                aria-expanded={showFilled}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Đã tự điền {filledFields.length} trường — bấm để xem/sửa</span>
                <ChevronDown
                  size={18}
                  aria-hidden="true"
                  className={`transition-transform ${showFilled ? 'rotate-180' : ''}`}
                />
              </button>
              {showFilled && (
                <div className="grid gap-5 border-t border-gray-100 p-4 md:grid-cols-2">
                  {filledFields.map((field) => (
                    <DocumentValueField
                      key={field.fieldKey}
                      field={field}
                      value={values[field.fieldKey] || ''}
                      error={errors[field.fieldKey]}
                      onChange={(value) => setFieldValue(field.fieldKey, value)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {listKeys.map((listKey) => (
            <ListRepeater
              key={listKey}
              listKey={listKey}
              childKeys={template.lists?.[listKey] ?? []}
              rows={lists[listKey] ?? []}
              onAdd={() => addListRow(listKey)}
              onRemove={(index) => removeListRow(listKey, index)}
              onChange={(index, childKey, value) => setListCell(listKey, index, childKey, value)}
            />
          ))}
          {template.fields.length === 0 && listKeys.length === 0 && (
            <p role="alert" className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-900">
              Biểu mẫu chưa có trường dữ liệu và không thể tạo tài liệu.
            </p>
          )}
          <button
            type="button"
            onClick={review}
            disabled={template.fields.length === 0 && listKeys.length === 0}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-4 py-3 font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileCheck2 size={18} aria-hidden="true" /> Kiểm tra dữ liệu
          </button>
        </section>
      ) : (
        <section
          aria-labelledby="document-review-heading"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 id="document-review-heading" className="text-lg font-semibold">
                Xác nhận dữ liệu trước khi tạo
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                File DOCX sẽ được lưu vào lịch sử và gắn với đúng phiên bản biểu mẫu này.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMode('form')}
              disabled={submitting}
              className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
            >
              <Edit3 size={16} aria-hidden="true" /> Chỉnh sửa
            </button>
          </div>
          <dl className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-200">
            {template.fields.map((field) => (
              <div key={field.fieldKey} className="grid gap-1 px-4 py-3 sm:grid-cols-[220px_1fr]">
                <dt className="text-sm font-medium text-gray-600">{field.label}</dt>
                <dd className="whitespace-pre-wrap break-words text-sm text-gray-900">
                  {formatReviewValue(field, values[field.fieldKey]) || (
                    <span className="italic text-gray-400">Không có dữ liệu</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {listKeys.map((listKey) => {
            const rows = buildListsPayload(lists)[listKey] ?? [];
            return (
              <div key={listKey} className="mt-4">
                <p className="text-sm font-medium text-gray-600">
                  {listKey} · {rows.length} dòng
                </p>
                {rows.length === 0 ? (
                  <p className="mt-1 text-sm italic text-gray-400">Không có dòng nào</p>
                ) : (
                  <ol className="mt-1 space-y-1">
                    {rows.map((row, index) => (
                      <li
                        key={index}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
                      >
                        {Object.entries(row)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' · ')}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-4 py-3 font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Spinner size={18} className="text-white" label="Đang tạo tài liệu" />
            ) : (
              <Wand2 size={18} aria-hidden="true" />
            )}
            {submitting ? 'Đang tạo...' : 'Tạo file Word'}
          </button>
        </section>
      )}

      {generated && (
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900 focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-green-700" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold">Tài liệu đã được tạo an toàn</h3>
              <p className="mt-1 break-all text-sm">{generated.fileName}</p>
              {generated.status && <p className="mt-1 text-xs">Trạng thái: {generated.status}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={download}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
                >
                  {downloading ? (
                    <Spinner size={16} className="text-white" label="Đang tải tài liệu" />
                  ) : (
                    <Download size={16} aria-hidden="true" />
                  )}
                  Tải file
                </button>
                <button
                  type="button"
                  onClick={downloadPdf}
                  disabled={downloading}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
                >
                  <Download size={16} aria-hidden="true" /> Tải PDF
                </button>
                <button
                  type="button"
                  onClick={createShare}
                  disabled={sharing}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100 disabled:opacity-60"
                >
                  <Share2 size={16} aria-hidden="true" /> Tạo link chia sẻ
                </button>
                <Link
                  to="/2025/luatpoip/tai-lieu/generated"
                  className="inline-flex items-center rounded-lg border border-green-300 px-4 py-2 text-sm font-medium hover:bg-green-100"
                >
                  Xem lịch sử
                </Link>
              </div>
              {shareUrl && (
                <div className="mt-3 rounded-lg border border-green-300 bg-white p-3">
                  <p className="text-xs font-medium text-gray-600">
                    Link chia sẻ (hết hạn sau 72 giờ) — gửi cho khách:
                  </p>
                  <div className="mt-1 flex gap-2">
                    <input
                      readOnly
                      value={shareUrl}
                      aria-label="Link chia sẻ"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      type="button"
                      onClick={copyShare}
                      className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white hover:bg-green-800"
                    >
                      <Copy size={14} aria-hidden="true" /> Sao chép
                    </button>
                  </div>
                </div>
              )}
              {downloadError && (
                <p role="alert" className="mt-2 text-sm text-red-700">
                  {downloadError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentValueField({
  field,
  value,
  error,
  onChange,
}: {
  field: DocumentTemplateField;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = `generate-${field.fieldKey}`;
  const describedBy = [field.helpText ? `${id}-help` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ');
  const className = `mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 ${
    error
      ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
      : 'border-gray-300 focus:border-brand-goldDark focus:ring-brand-goldDark/20'
  }`;

  return (
    <div className={field.inputType === 'TEXTAREA' ? 'md:col-span-2' : undefined}>
      <label htmlFor={id} className="text-sm font-medium text-gray-800">
        {field.label || field.fieldKey}
        {field.required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
        {field.required && <span className="sr-only"> (bắt buộc)</span>}
      </label>
      {field.options?.length ? (
        <select
          id={id}
          value={value}
          required={field.required}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={className}
        >
          <option value="">Chọn một giá trị</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.inputType === 'TEXTAREA' ? (
        <textarea
          id={id}
          value={value}
          required={field.required}
          maxLength={field.maxLength}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          autoComplete={isSensitive(field) ? 'off' : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={className}
        />
      ) : (
        <input
          id={id}
          type={
            field.inputType === 'DATE' ? 'date' : field.inputType === 'NUMBER' ? 'number' : 'text'
          }
          value={value}
          required={field.required}
          maxLength={field.inputType === 'TEXT' ? field.maxLength : undefined}
          min={field.inputType === 'NUMBER' ? field.minimum : undefined}
          max={field.inputType === 'NUMBER' ? field.maximum : undefined}
          autoComplete={isSensitive(field) ? 'off' : undefined}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy || undefined}
          className={className}
        />
      )}
      {field.helpText && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">
          {field.helpText}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// Với responseType 'blob', body lỗi là Blob JSON — đọc để lấy message hiển thị.
async function readBlobMessage(data: unknown): Promise<string | undefined> {
  if (!(data instanceof Blob)) return undefined;
  try {
    const parsed = JSON.parse(await data.text());
    return parsed?.message;
  } catch {
    return undefined;
  }
}

function emptyRow(childKeys: string[]): Record<string, string> {
  return Object.fromEntries(childKeys.map((key) => [key, '']));
}

/** Bỏ các dòng trống hoàn toàn; chỉ giữ list còn dòng để gửi backend. */
function buildListsPayload(
  lists: Record<string, Array<Record<string, string>>>
): Record<string, Array<Record<string, string>>> {
  const out: Record<string, Array<Record<string, string>>> = {};
  Object.entries(lists).forEach(([listKey, rows]) => {
    const kept = rows.filter((row) => Object.values(row).some((value) => value.trim()));
    if (kept.length) out[listKey] = kept;
  });
  return out;
}

function ListRepeater({
  listKey,
  childKeys,
  rows,
  onAdd,
  onRemove,
  onChange,
}: {
  listKey: string;
  childKeys: string[];
  rows: Array<Record<string, string>>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, childKey: string, value: string) => void;
}) {
  return (
    <fieldset className="mt-6 rounded-xl border border-gray-200 p-4">
      <legend className="px-1 text-sm font-semibold text-gray-800">Danh sách lặp: {listKey}</legend>
      <p className="text-xs text-gray-500">
        Mỗi dòng sẽ nhân thành một hàng trong bảng của tài liệu. Bỏ trống dòng để không thêm.
      </p>
      <div className="mt-3 space-y-3">
        {rows.length === 0 && (
          <p className="text-sm italic text-gray-400">Chưa có dòng nào. Bấm “Thêm dòng”.</p>
        )}
        {rows.map((row, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex sm:items-end sm:gap-3"
          >
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              {childKeys.map((childKey) => {
                const id = `list-${listKey}-${index}-${childKey}`;
                return (
                  <div key={childKey}>
                    <label htmlFor={id} className="text-xs font-medium text-gray-700">
                      {childKey}
                    </label>
                    <input
                      id={id}
                      type="text"
                      value={row[childKey] || ''}
                      onChange={(event) => onChange(index, childKey, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20"
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 sm:mt-0"
            >
              <Trash2 size={16} aria-hidden="true" /> Xóa
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand-goldDark px-3 py-2 text-sm font-medium text-brand-goldDark hover:bg-brand-goldDark/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
      >
        <Plus size={16} aria-hidden="true" /> Thêm dòng
      </button>
    </fieldset>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 gap-2">
      <dt className="shrink-0 font-medium">{label}:</dt>
      <dd className="truncate" title={value}>
        {value}
      </dd>
    </div>
  );
}

function hasContext(context: GenerateDocumentContext): boolean {
  return !!(
    context.crmCaseId ||
    context.customerId ||
    context.dossierId ||
    context.matterReference ||
    context.serviceId
  );
}

function isSensitive(field: DocumentTemplateField): boolean {
  return field.dataClassification === 'CONFIDENTIAL' || field.dataClassification === 'RESTRICTED';
}

function formatReviewValue(field: DocumentTemplateField, value?: string): string {
  if (!value || field.inputType !== 'DATE') return value || '';
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('vi-VN');
}
