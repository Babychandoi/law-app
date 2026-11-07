import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FlaskConical,
  History,
  RotateCcw,
  Save,
  Send,
} from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import {
  DocumentDataClassification,
  DocumentFieldInputType,
  DocumentFolder,
  DocumentTemplate,
  DocumentTemplateField,
  DocumentTemplateVersion,
  TemplatePreview,
} from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import Modal from '../../component/common/Modal';
import Button from '../../component/common/ui/Button';
import { validateTemplateFields } from './documentUi';
import useUnsavedChangesWarning from './useUnsavedChangesWarning';

const INPUT_TYPES: Array<{ value: DocumentFieldInputType; label: string }> = [
  { value: 'TEXT', label: 'Văn bản ngắn' },
  { value: 'TEXTAREA', label: 'Văn bản dài' },
  { value: 'DATE', label: 'Ngày' },
  { value: 'NUMBER', label: 'Số' },
  { value: 'CURRENCY', label: 'Số tiền (VND)' },
];
const CLASSIFICATIONS: Array<{ value: DocumentDataClassification; label: string }> = [
  { value: 'PUBLIC', label: 'Công khai' },
  { value: 'INTERNAL', label: 'Nội bộ' },
  { value: 'CONFIDENTIAL', label: 'Bảo mật' },
  { value: 'RESTRICTED', label: 'Hạn chế nghiêm ngặt' },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';
interface EditorMetadata {
  name: string;
  description: string;
  serviceId: string;
  serviceName: string;
  tagsText: string;
}

const EMPTY_METADATA: EditorMetadata = {
  name: '',
  description: '',
  serviceId: '',
  serviceName: '',
  tagsText: '',
};

export default function TemplateFieldEditor() {
  const { id = '' } = useParams();
  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [fields, setFields] = useState<DocumentTemplateField[]>([]);
  const [savedSnapshot, setSavedSnapshot] = useState('');
  const [metadata, setMetadata] = useState<EditorMetadata>(EMPTY_METADATA);
  const [savedMetadataSnapshot, setSavedMetadataSnapshot] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [action, setAction] = useState<'save' | 'publish' | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [preview, setPreview] = useState<TemplatePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentTemplateVersion[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [dryRunning, setDryRunning] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement>(null);

  const highlightInPreview = (fieldKey: string) => {
    previewFrameRef.current?.contentWindow?.postMessage({ type: 'hl', key: fieldKey }, '*');
  };
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');
  const [restoreVersion, setRestoreVersion] = useState<DocumentTemplateVersion | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [restoring, setRestoring] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();

  const currentSnapshot = useMemo(() => serializeFields(fields), [fields]);
  const currentMetadataSnapshot = useMemo(() => JSON.stringify(metadata), [metadata]);
  const fieldsDirty = !!savedSnapshot && currentSnapshot !== savedSnapshot;
  const metadataDirty =
    !!savedMetadataSnapshot && currentMetadataSnapshot !== savedMetadataSnapshot;
  const isDirty = fieldsDirty || metadataDirty;
  const issues = useMemo(() => validateTemplateFields(fields), [fields]);
  const allowNextNavigation = useUnsavedChangesWarning(isDirty);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await documentTemplateService.getTemplate(id);
      const loadedFields = data.fields.map((field, index) => ({
        ...field,
        sortOrder: field.sortOrder || index + 1,
      }));
      setTemplate(data);
      setFields(loadedFields);
      setSavedSnapshot(serializeFields(loadedFields));
      const loadedMetadata = metadataFromTemplate(data);
      setMetadata(loadedMetadata);
      setSavedMetadataSnapshot(JSON.stringify(loadedMetadata));
      setSaveState('saved');
    } catch (error: any) {
      setLoadError(error?.response?.data?.message || 'Không tải được biểu mẫu.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    documentTemplateService
      .listFolders()
      .then(setFolders)
      .catch(() => setFolders([]));
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'docFieldClick') return;
      const idx = fields.findIndex((f) => f.fieldKey === event.data.key);
      if (idx < 0) return;
      document
        .getElementById(`document-field-${idx}`)
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      document.getElementById(fieldInputId(idx, 'label'))?.focus();
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [fields]);

  const changeFolder = async (value: string) => {
    if (!template) return;
    try {
      const updated = await documentTemplateService.setTemplateFolder(id, value || null);
      setTemplate((current) => (current ? { ...current, folderId: updated.folderId } : current));
      toast.success('Đã cập nhật thư mục');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không cập nhật được thư mục.');
    }
  };

  const updateField = (index: number, patch: Partial<DocumentTemplateField>) => {
    setFields((previous) =>
      previous.map((field, fieldIndex) => (fieldIndex === index ? { ...field, ...patch } : field))
    );
    setSaveState('idle');
  };

  const focusFirstIssue = () => {
    const first = issues[0];
    if (!first) return;
    const target =
      document.getElementById(fieldInputId(first.index, first.property)) ??
      document.getElementById(`document-field-${first.index}`);
    target?.focus();
  };

  const dryRun = async () => {
    setDryRunning(true);
    try {
      const result = await documentTemplateService.dryRunTemplate(id);
      toast.success(`Tạo thử thành công · file ${(result.outputSize / 1024).toFixed(1)} KB`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'Tạo thử thất bại — kiểm tra placeholder/cấu hình mẫu.'
      );
    } finally {
      setDryRunning(false);
    }
  };

  const saveDraft = async (): Promise<DocumentTemplate | null> => {
    setAction('save');
    setSaveState('saving');
    try {
      const saved = await documentTemplateService.updateFields(id, fields, {
        changeReason: changeReason.trim() || undefined,
        expectedRevision: template?.revision,
      });
      const savedFields = saved.fields?.length ? saved.fields : fields;
      setTemplate(saved);
      setFields(savedFields);
      setSavedSnapshot(serializeFields(savedFields));
      setSaveState('saved');
      toast.success('Đã lưu bản nháp');
      return saved;
    } catch (error: any) {
      setSaveState('error');
      toast.error(error?.response?.data?.message || 'Không lưu được cấu hình.');
      return null;
    } finally {
      setAction(null);
    }
  };

  const saveAndPublish = async () => {
    if (!template) return;
    if (typeof template.revision === 'number' && !metadata.name.trim()) {
      document.getElementById('template-editor-name')?.focus();
      toast.error('Tên biểu mẫu không được để trống.');
      return;
    }
    if (issues.length) {
      focusFirstIssue();
      toast.error('Biểu mẫu chưa hợp lệ. Hãy sửa các lỗi được đánh dấu trước khi xuất bản.');
      return;
    }
    setAction('publish');
    setSaveState('saving');
    let draftSaved = false;
    try {
      let published: DocumentTemplate;
      if (typeof template.revision === 'number') {
        // New document-service: fields and optimistic revision are committed atomically.
        published = await documentTemplateService.publish(id, {
          fields,
          name: metadata.name.trim(),
          description: metadata.description.trim(),
          serviceId: metadata.serviceId.trim(),
          serviceName: metadata.serviceName.trim(),
          tags: parseTags(metadata.tagsText),
          changeReason: changeReason.trim() || undefined,
          expectedRevision: template.revision,
        });
      } else {
        // Compatibility with the original endpoint that accepted no request body.
        const saved = await documentTemplateService.updateFields(id, fields);
        const savedFields = saved.fields?.length ? saved.fields : fields;
        setTemplate(saved);
        setFields(savedFields);
        setSavedSnapshot(serializeFields(savedFields));
        draftSaved = true;
        published = await documentTemplateService.publish(id);
      }
      const publishedFields = published.fields?.length ? published.fields : fields;
      setTemplate(published);
      setFields(publishedFields);
      setSavedSnapshot(serializeFields(publishedFields));
      const publishedMetadata = metadataFromTemplate({
        ...published,
        name: published.name || metadata.name,
        description: published.description ?? metadata.description,
        serviceId: published.serviceId ?? metadata.serviceId,
        serviceName: published.serviceName ?? metadata.serviceName,
        tags: published.tags ?? parseTags(metadata.tagsText),
      });
      setMetadata(publishedMetadata);
      setSavedMetadataSnapshot(JSON.stringify(publishedMetadata));
      setSaveState('saved');
      allowNextNavigation();
      toast.success('Đã lưu và xuất bản biểu mẫu');
      navigate('/2025/luatpoip/tai-lieu');
    } catch (error: any) {
      setSaveState(draftSaved ? 'saved' : 'error');
      const apiMessage = error?.response?.data?.message;
      if (error?.response?.status === 409) {
        toast.error(
          apiMessage ||
            'Biểu mẫu đã được người khác cập nhật. Hãy tải lại trang để tránh ghi đè thay đổi.'
        );
      } else if (draftSaved) {
        toast.error(apiMessage || 'Bản nháp đã lưu nhưng chưa thể xuất bản.');
      } else {
        toast.error(apiMessage || 'Không thể lưu và xuất bản biểu mẫu.');
      }
    } finally {
      setAction(null);
    }
  };

  const togglePreview = async () => {
    if (preview) {
      setPreview(null);
      return;
    }
    setPreviewLoading(true);
    setPreviewError('');
    try {
      setPreview(await documentTemplateService.preview(id));
    } catch (error: any) {
      setPreviewError(error?.response?.data?.message || 'Không tải được bản xem trước.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleHistory = async () => {
    const opening = !historyOpen;
    setHistoryOpen(opening);
    if (!opening || versions.length || historyUnavailable) return;
    setHistoryLoading(true);
    try {
      const page = await documentTemplateService.listTemplateVersions(id, 0, 20);
      setVersions(page.content);
      // Mặc định so sánh phiên bản trước với mới nhất.
      if (page.content.length >= 2) {
        setCompareB(page.content[0].id);
        setCompareA(page.content[1].id);
      }
    } catch (error: any) {
      if ([404, 405].includes(error?.response?.status)) {
        setHistoryUnavailable(true);
      } else {
        toast.error(error?.response?.data?.message || 'Không tải được lịch sử phiên bản.');
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const confirmRestoreVersion = async () => {
    if (!restoreVersion || !template) return;
    if (!restoreReason.trim()) {
      setRestoreError('Hãy ghi lý do khôi phục phiên bản.');
      return;
    }
    setRestoring(true);
    setRestoreError('');
    try {
      await documentTemplateService.restoreTemplateVersion(id, restoreVersion.id, {
        changeReason: restoreReason.trim(),
        expectedRevision: template.revision,
      });
      toast.success(`Đã tạo bản nháp mới từ phiên bản ${restoreVersion.versionNumber}`);
      setRestoreVersion(null);
      setRestoreReason('');
      setVersions([]);
      setHistoryOpen(false);
      await load();
    } catch (error: any) {
      setRestoreError(
        error?.response?.status === 409
          ? 'Biểu mẫu đã được cập nhật ở nơi khác. Hãy tải lại trước khi khôi phục.'
          : error?.response?.data?.message || 'Không khôi phục được phiên bản.'
      );
    } finally {
      setRestoring(false);
    }
  };

  if (!isAdmin) return <Navigate to="/2025/luatpoip/tai-lieu" replace />;
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải cấu hình biểu mẫu" />
      </div>
    );
  }
  if (loadError || !template) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{loadError || 'Không tìm thấy biểu mẫu.'}</p>
        <button type="button" onClick={load} className="mt-3 font-medium underline">
          Thử tải lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="sticky top-0 z-10 -mx-4 border-b border-gray-200 bg-gray-100/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold">
                Cấu hình: {metadata.name || template.name}
              </h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs text-gray-600 shadow-sm">
                phiên bản {template.version}
              </span>
            </div>
            <SaveIndicator state={saveState} dirty={isDirty} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={togglePreview}
              disabled={previewLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-50"
              aria-expanded={!!preview}
            >
              {previewLoading ? (
                <Spinner size={16} label="Đang tải bản xem trước" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
              {preview ? 'Đóng xem trước' : 'Xem trước'}
            </button>
            <button
              type="button"
              onClick={dryRun}
              disabled={dryRunning}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-50"
            >
              {dryRunning ? (
                <Spinner size={16} label="Đang tạo thử" />
              ) : (
                <FlaskConical size={16} aria-hidden="true" />
              )}
              Tạo thử
            </button>
            <button
              type="button"
              onClick={saveDraft}
              disabled={!fieldsDirty || action !== null}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === 'save' ? (
                <Spinner size={16} label="Đang lưu bản nháp" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              Lưu bản nháp
            </button>
            <button
              type="button"
              onClick={saveAndPublish}
              disabled={action !== null || issues.length > 0}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-3 py-2 text-sm font-medium text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              title={issues.length ? 'Sửa lỗi cấu hình trước khi xuất bản' : undefined}
            >
              {action === 'publish' ? (
                <Spinner size={16} className="text-white" label="Đang lưu và xuất bản" />
              ) : (
                <Send size={16} aria-hidden="true" />
              )}
              Lưu & xuất bản
            </button>
          </div>
        </div>
      </header>

      {issues.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-semibold">Còn {issues.length} lỗi cần sửa trước khi xuất bản.</p>
              <button type="button" onClick={focusFirstIssue} className="mt-1 underline">
                Đi đến lỗi đầu tiên
              </button>
            </div>
          </div>
        </div>
      )}

      {previewError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          {previewError}
        </p>
      )}
      {preview && (
        <section
          aria-labelledby="template-preview-heading"
          className="rounded-2xl bg-white p-4 shadow-sm"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 id="template-preview-heading" className="font-semibold">
              Bản xem trước đã lưu
            </h3>
            {isDirty && (
              <span className="text-xs text-amber-700">
                Bản xem trước chưa gồm các thay đổi đang chỉnh sửa.
              </span>
            )}
          </div>
          <p className="mb-2 text-xs text-brand-muted">
            Mẹo: bấm vào ô vàng trong bản xem trước để nhảy tới trường tương ứng, và ngược lại.
          </p>
          <iframe
            ref={previewFrameRef}
            title={`Xem trước biểu mẫu ${metadata.name || template.name}`}
            sandbox="allow-scripts"
            srcDoc={previewDocument(preview.html)}
            className="h-[55vh] min-h-[360px] w-full rounded-xl border border-gray-200 bg-gray-100"
          />
        </section>
      )}

      <section aria-labelledby="field-editor-heading">
        <div className="mb-3">
          <h3 id="field-editor-heading" className="font-semibold">
            Trường dữ liệu ({fields.length})
          </h3>
          <p className="text-sm text-gray-600">
            Nhãn và quy tắc ở đây quyết định dữ liệu nhân viên phải nhập khi tạo hồ sơ.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {fields.map((field, index) => {
            const fieldIssues = issues.filter((issue) => issue.index === index);
            return (
              <div
                key={`${field.fieldKey}-${index}`}
                onFocusCapture={() => highlightInPreview(field.fieldKey)}
                onMouseEnter={() => highlightInPreview(field.fieldKey)}
              >
                <FieldCard
                  field={field}
                  index={index}
                  issues={fieldIssues}
                  onChange={(patch) => updateField(index, patch)}
                />
              </div>
            );
          })}
        </div>
        {fields.length === 0 && (
          <div
            id="document-field--1"
            tabIndex={-1}
            className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-6 text-center text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Biểu mẫu chưa có trường dữ liệu. Hãy quay lại bước gán key.
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Thông tin xuất bản</h3>
        {typeof template.revision === 'number' ? (
          <>
            <p className="mt-1 text-sm text-gray-600">
              Dịch vụ và thẻ giúp nhân viên tìm đúng mẫu trong kho tài liệu. Các mục này được lưu
              cùng phiên bản khi xuất bản.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label
                htmlFor="template-editor-name"
                className="block text-sm font-medium text-gray-700"
              >
                Tên biểu mẫu
                <input
                  id="template-editor-name"
                  value={metadata.name}
                  required
                  maxLength={200}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                />
              </label>
              <label
                htmlFor="template-editor-folder"
                className="block text-sm font-medium text-gray-700"
              >
                Thư mục
                <select
                  id="template-editor-folder"
                  value={template.folderId || ''}
                  onChange={(event) => changeFolder(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                >
                  <option value="">— Không thuộc thư mục —</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
              <label
                htmlFor="template-editor-service-name"
                className="block text-sm font-medium text-gray-700"
              >
                Tên dịch vụ
                <input
                  id="template-editor-service-name"
                  value={metadata.serviceName}
                  maxLength={200}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      serviceName: event.target.value,
                    }))
                  }
                  placeholder="Ví dụ: Đăng ký nhãn hiệu"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                />
              </label>
              <label
                htmlFor="template-editor-service-id"
                className="block text-sm font-medium text-gray-700"
              >
                Mã dịch vụ
                <input
                  id="template-editor-service-id"
                  value={metadata.serviceId}
                  maxLength={100}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, serviceId: event.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                />
              </label>
              <label
                htmlFor="template-editor-tags"
                className="block text-sm font-medium text-gray-700"
              >
                Thẻ (phân cách bằng dấu phẩy)
                <input
                  id="template-editor-tags"
                  value={metadata.tagsText}
                  onChange={(event) =>
                    setMetadata((current) => ({ ...current, tagsText: event.target.value }))
                  }
                  placeholder="hợp đồng, doanh nghiệp"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                />
              </label>
              <label
                htmlFor="template-editor-description"
                className="block text-sm font-medium text-gray-700 sm:col-span-2"
              >
                Mô tả
                <textarea
                  id="template-editor-description"
                  value={metadata.description}
                  maxLength={2000}
                  rows={2}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
                />
              </label>
            </div>
          </>
        ) : (
          <p className="mt-1 text-sm text-gray-600">
            Máy chủ hiện tại chưa hỗ trợ phân loại mẫu theo dịch vụ và thẻ.
          </p>
        )}
        <label
          htmlFor="template-change-reason"
          className="mt-4 block text-sm font-medium text-gray-900"
        >
          Lý do thay đổi
          <textarea
            id="template-change-reason"
            value={changeReason}
            onChange={(event) => setChangeReason(event.target.value)}
            rows={2}
            maxLength={500}
            placeholder="Ví dụ: Cập nhật điều khoản theo quy định mới (khuyến nghị khi xuất bản phiên bản mới)"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          />
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={toggleHistory}
          aria-expanded={historyOpen}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-semibold hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-goldDark"
        >
          <span className="inline-flex items-center gap-2">
            <History size={18} aria-hidden="true" /> Lịch sử phiên bản
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`transition-transform ${historyOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {historyOpen && (
          <div className="border-t border-gray-200 p-4">
            {historyLoading ? (
              <Spinner center label="Đang tải lịch sử phiên bản" />
            ) : historyUnavailable ? (
              <p className="text-sm text-gray-600">
                Máy chủ hiện tại chưa hỗ trợ lịch sử phiên bản. Cấu hình vẫn có thể được lưu bình
                thường.
              </p>
            ) : versions.length === 0 ? (
              <p className="text-sm text-gray-600">Chưa có phiên bản nào được ghi nhận.</p>
            ) : (
              <>
                {versions.length >= 2 && (
                  <VersionCompare
                    versions={versions}
                    aId={compareA}
                    bId={compareB}
                    onChangeA={setCompareA}
                    onChangeB={setCompareB}
                  />
                )}
                <ol className="grid gap-3 md:grid-cols-2">
                  {versions.map((version) => (
                    <li key={version.id} className="rounded-xl border border-gray-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold">Phiên bản {version.versionNumber}</span>
                        <div className="flex gap-1.5">
                          {version.active && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                              Đang dùng
                            </span>
                          )}
                          {version.latest && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                              Mới nhất
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        {version.changeReason || 'Không ghi lý do thay đổi'}
                      </p>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 size={14} aria-hidden="true" />
                        {version.createdAt
                          ? new Date(version.createdAt).toLocaleString('vi-VN')
                          : 'Không rõ thời gian'}
                      </p>
                      {!version.latest && (
                        <button
                          type="button"
                          onClick={() => {
                            setRestoreVersion(version);
                            setRestoreError('');
                            setRestoreReason('');
                          }}
                          disabled={isDirty}
                          title={
                            isDirty
                              ? 'Hãy lưu hoặc bỏ các thay đổi hiện tại trước khi khôi phục.'
                              : undefined
                          }
                          className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <RotateCcw size={14} aria-hidden="true" /> Tạo bản nháp từ phiên bản này
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}
      </section>

      <Link
        to="/2025/luatpoip/tai-lieu"
        className="inline-flex text-sm font-medium text-brand-goldDark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
      >
        ← Quay lại danh sách
      </Link>

      {restoreVersion && (
        <Modal
          title={`Khôi phục phiên bản ${restoreVersion.versionNumber}`}
          size="md"
          onClose={() => setRestoreVersion(null)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRestoreVersion(null)}
                disabled={restoring}
              >
                Hủy
              </Button>
              <Button onClick={confirmRestoreVersion} loading={restoring}>
                Tạo bản nháp mới
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-700">
            Hệ thống sẽ tạo một phiên bản mới từ snapshot này; phiên bản cũ vẫn được giữ nguyên để
            truy xuất.
          </p>
          <label
            htmlFor="restore-version-reason"
            className="mt-4 block text-sm font-medium text-gray-700"
          >
            Lý do khôi phục <span className="text-red-600">*</span>
            <textarea
              id="restore-version-reason"
              value={restoreReason}
              onChange={(event) => {
                setRestoreReason(event.target.value);
                setRestoreError('');
              }}
              rows={3}
              maxLength={500}
              required
              aria-invalid={!!restoreError}
              aria-describedby={restoreError ? 'restore-version-error' : undefined}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
            />
          </label>
          {restoreError && (
            <p id="restore-version-error" role="alert" className="mt-2 text-sm text-red-700">
              {restoreError}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}

function FieldCard({
  field,
  index,
  issues,
  onChange,
}: {
  field: DocumentTemplateField;
  index: number;
  issues: ReturnType<typeof validateTemplateFields>;
  onChange: (patch: Partial<DocumentTemplateField>) => void;
}) {
  const issueFor = (property: keyof DocumentTemplateField) =>
    issues.find((issue) => issue.property === property)?.message;
  const describedBy = (property: keyof DocumentTemplateField) =>
    issueFor(property) ? `${fieldInputId(index, property)}-error` : undefined;
  const controlClass =
    'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20';

  return (
    <article
      id={`document-field-${index}`}
      tabIndex={-1}
      className={`rounded-2xl border bg-white p-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-goldDark ${
        issues.length ? 'border-amber-300' : 'border-gray-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Trường {index + 1}</p>
          <code className="break-all text-sm font-semibold text-brand-goldDark">
            {'${'}
            {field.fieldKey}
            {'}'}
          </code>
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium">
          <input
            id={fieldInputId(index, 'required')}
            type="checkbox"
            checked={field.required}
            onChange={(event) => onChange({ required: event.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-brand-goldDark focus:ring-brand-goldDark"
          />
          Bắt buộc
        </label>
      </div>

      {issueFor('fieldKey') && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {issueFor('fieldKey')}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FieldLabel
          label="Nhãn hiển thị"
          inputId={fieldInputId(index, 'label')}
          error={issueFor('label')}
        >
          <input
            id={fieldInputId(index, 'label')}
            value={field.label || ''}
            maxLength={200}
            onChange={(event) => onChange({ label: event.target.value })}
            aria-invalid={!!issueFor('label')}
            aria-describedby={describedBy('label')}
            className={controlClass}
          />
        </FieldLabel>
        <FieldLabel label="Kiểu dữ liệu" inputId={fieldInputId(index, 'inputType')}>
          <select
            id={fieldInputId(index, 'inputType')}
            value={field.inputType}
            onChange={(event) =>
              onChange({ inputType: event.target.value as DocumentFieldInputType })
            }
            className={controlClass}
          >
            {INPUT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FieldLabel>
        {(field.inputType === 'NUMBER' || field.inputType === 'CURRENCY') && field.fieldKey && (
          <p className="mt-1 text-xs text-brand-muted">
            Mẹo: trong file Word có thể dùng{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_bangchu}`}</code>{' '}
            để tự điền số tiền bằng chữ.
          </p>
        )}
        {field.inputType === 'CURRENCY' && field.fieldKey && (
          <p className="mt-1 text-xs text-brand-muted">
            Tự tính:{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_vat}`}</code>{' '}
            (VAT),{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_total}`}</code>{' '}
            (tổng),{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_total_bangchu}`}</code>{' '}
            (tổng bằng chữ). VAT mặc định 10% — đổi bằng cách nhập{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_vatrate}`}</code>
            .
          </p>
        )}
        {field.inputType === 'DATE' && field.fieldKey && (
          <p className="mt-1 text-xs text-brand-muted">
            Mẹo: trong file Word có thể dùng{' '}
            <code className="rounded bg-brand-surface px-1">{`\${${field.fieldKey}_vi}`}</code> để
            tự điền ngày dạng "ngày DD tháng MM năm YYYY".
          </p>
        )}
        {field.fieldKey && (
          <p className="mt-1 text-xs text-brand-muted">
            Điều kiện: đặt{' '}
            <code className="rounded bg-brand-surface px-1">{`\${if_${field.fieldKey}}`}</code> và{' '}
            <code className="rounded bg-brand-surface px-1">{`\${endif_${field.fieldKey}}`}</code>{' '}
            trên hai dòng riêng để chỉ giữ đoạn ở giữa khi trường này có giá trị (khác
            rỗng/0/không).
          </p>
        )}
        <FieldLabel label="Gợi ý cho người nhập" inputId={fieldInputId(index, 'helpText')}>
          <input
            id={fieldInputId(index, 'helpText')}
            value={field.helpText || ''}
            maxLength={1000}
            onChange={(event) => onChange({ helpText: event.target.value || undefined })}
            className={controlClass}
          />
        </FieldLabel>
        <FieldLabel label="Giá trị mặc định" inputId={fieldInputId(index, 'defaultValue')}>
          <input
            id={fieldInputId(index, 'defaultValue')}
            value={field.defaultValue || ''}
            maxLength={20000}
            onChange={(event) => onChange({ defaultValue: event.target.value || undefined })}
            className={controlClass}
          />
        </FieldLabel>
        <FieldLabel
          label="Thứ tự hiển thị"
          inputId={fieldInputId(index, 'sortOrder')}
          error={issueFor('sortOrder')}
        >
          <input
            id={fieldInputId(index, 'sortOrder')}
            type="number"
            min={1}
            step={1}
            value={field.sortOrder}
            onChange={(event) => onChange({ sortOrder: Number(event.target.value) })}
            aria-invalid={!!issueFor('sortOrder')}
            aria-describedby={describedBy('sortOrder')}
            className={controlClass}
          />
        </FieldLabel>
        <FieldLabel label="Phân loại dữ liệu" inputId={fieldInputId(index, 'dataClassification')}>
          <select
            id={fieldInputId(index, 'dataClassification')}
            value={field.dataClassification || 'INTERNAL'}
            onChange={(event) =>
              onChange({
                dataClassification: event.target.value as DocumentDataClassification,
              })
            }
            className={controlClass}
          >
            {CLASSIFICATIONS.map((classification) => (
              <option key={classification.value} value={classification.value}>
                {classification.label}
              </option>
            ))}
          </select>
        </FieldLabel>
        {field.inputType !== 'NUMBER' && (
          <FieldLabel
            label="Độ dài tối đa"
            inputId={fieldInputId(index, 'maxLength')}
            error={issueFor('maxLength')}
          >
            <input
              id={fieldInputId(index, 'maxLength')}
              type="number"
              min={1}
              value={field.maxLength ?? ''}
              onChange={(event) =>
                onChange({
                  maxLength: event.target.value ? Number(event.target.value) : undefined,
                })
              }
              aria-invalid={!!issueFor('maxLength')}
              aria-describedby={describedBy('maxLength')}
              className={controlClass}
            />
          </FieldLabel>
        )}
        {field.inputType === 'NUMBER' && (
          <>
            <FieldLabel
              label="Giá trị nhỏ nhất"
              inputId={fieldInputId(index, 'minimum')}
              error={issueFor('minimum')}
            >
              <input
                id={fieldInputId(index, 'minimum')}
                type="number"
                value={field.minimum ?? ''}
                onChange={(event) =>
                  onChange({
                    minimum: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
                aria-invalid={!!issueFor('minimum')}
                aria-describedby={describedBy('minimum')}
                className={controlClass}
              />
            </FieldLabel>
            <FieldLabel
              label="Giá trị lớn nhất"
              inputId={fieldInputId(index, 'maximum')}
              error={issueFor('maximum')}
            >
              <input
                id={fieldInputId(index, 'maximum')}
                type="number"
                value={field.maximum ?? ''}
                onChange={(event) =>
                  onChange({
                    maximum: event.target.value ? Number(event.target.value) : undefined,
                  })
                }
                aria-invalid={!!issueFor('maximum')}
                aria-describedby={describedBy('maximum')}
                className={controlClass}
              />
            </FieldLabel>
          </>
        )}
        <FieldLabel
          label="Biểu thức kiểm tra (RegExp)"
          inputId={fieldInputId(index, 'validationPattern')}
          error={issueFor('validationPattern')}
          className="sm:col-span-2"
        >
          <input
            id={fieldInputId(index, 'validationPattern')}
            value={field.validationPattern || ''}
            maxLength={500}
            onChange={(event) => onChange({ validationPattern: event.target.value || undefined })}
            placeholder="Ví dụ: ^[0-9]{10}$"
            aria-invalid={!!issueFor('validationPattern')}
            aria-describedby={describedBy('validationPattern')}
            className={`${controlClass} font-mono`}
          />
        </FieldLabel>
        <FieldLabel
          label="Danh sách giá trị cho phép (phân cách bằng dấu phẩy)"
          inputId={fieldInputId(index, 'options')}
          error={issueFor('options')}
          className="sm:col-span-2"
        >
          <OptionsInput
            id={fieldInputId(index, 'options')}
            options={field.options ?? []}
            error={issueFor('options')}
            onChange={(options) => onChange({ options })}
            placeholder="Ví dụ: Cá nhân, Doanh nghiệp"
            className={controlClass}
          />
        </FieldLabel>
      </div>
    </article>
  );
}

function FieldLabel({
  label,
  inputId,
  error,
  className = '',
  children,
}: {
  label: string;
  inputId: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function OptionsInput({
  id,
  options,
  className,
  placeholder,
  error,
  onChange,
}: {
  id: string;
  options: string[];
  className: string;
  placeholder: string;
  error?: string;
  onChange: (options: string[]) => void;
}) {
  const joined = options.join(', ');
  const [draft, setDraft] = useState(joined);
  const focusedRef = useRef(false);
  useEffect(() => {
    if (!focusedRef.current) setDraft(joined);
  }, [joined]);
  return (
    <input
      id={id}
      value={draft}
      maxLength={5000}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onChange={(event) => {
        setDraft(event.target.value);
        onChange(parseOptions(event.target.value));
      }}
      onBlur={() => {
        focusedRef.current = false;
        const normalized = parseOptions(draft);
        setDraft(normalized.join(', '));
        onChange(normalized);
      }}
      placeholder={placeholder}
      className={className}
    />
  );
}

function parseOptions(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)
    )
  ).slice(0, 500);
}

function SaveIndicator({ state, dirty }: { state: SaveState; dirty: boolean }) {
  let icon = <CheckCircle2 size={15} aria-hidden="true" />;
  let text = 'Đã lưu';
  let className = 'text-green-700';
  if (state === 'saving') {
    icon = <Spinner size={14} label="Đang lưu thay đổi" />;
    text = 'Đang lưu...';
    className = 'text-blue-700';
  } else if (dirty) {
    icon = <AlertTriangle size={15} aria-hidden="true" />;
    text = 'Có thay đổi chưa lưu';
    className = 'text-amber-700';
  } else if (state === 'error') {
    icon = <AlertTriangle size={15} aria-hidden="true" />;
    text = 'Lưu chưa thành công';
    className = 'text-red-700';
  }
  return (
    <p aria-live="polite" className={`mt-1 flex items-center gap-1.5 text-xs ${className}`}>
      {icon}
      {text}
    </p>
  );
}

function fieldInputId(index: number, property: keyof DocumentTemplateField): string {
  return `document-field-${index}-${String(property)}`;
}

function serializeFields(fields: DocumentTemplateField[]): string {
  return JSON.stringify(fields);
}

function previewDocument(html: string): string {
  // Bọc mỗi placeholder ${key} thành <mark> để highlight hai chiều với panel field.
  const marked = html.replace(
    /\$\{([A-Za-z][A-Za-z0-9_]{0,63})\}/g,
    (_match, key) =>
      '<mark class="phk" data-key="' + key + '">' + String.fromCharCode(36) + '{' + key + '}</mark>'
  );
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
    <style>
    html,body{margin:0;background:#f3f4f6}body{padding:24px;display:flex;justify-content:center}
    .page{box-sizing:border-box;background:#fff;max-width:820px;width:100%;padding:48px 56px;
      box-shadow:0 1px 6px rgba(0,0,0,.12);font-family:"Times New Roman",serif;
      font-size:15px;line-height:1.55;color:#111}.page img{max-width:100%;height:auto}
    .page table{border-collapse:collapse;max-width:100%}.page td,.page th{padding:2px 6px}
    mark.phk{background:#fef08a;color:#111;border-radius:2px;padding:0 1px;cursor:pointer}
    mark.phk.on{background:#f59e0b;color:#fff;box-shadow:0 0 0 2px #f59e0b}
    @media(max-width:640px){body{padding:8px}.page{padding:24px 18px}}
  </style></head><body><div class="page">${marked}</div>
  <script>(function(){
    var marks=[].slice.call(document.querySelectorAll('mark.phk'));
    marks.forEach(function(m){m.addEventListener('click',function(){
      parent.postMessage({type:'docFieldClick',key:m.getAttribute('data-key')},'*');});});
    window.addEventListener('message',function(e){
      if(!e.data||e.data.type!=='hl')return;var first=null;
      marks.forEach(function(m){var on=m.getAttribute('data-key')===e.data.key;
        m.classList.toggle('on',on);if(on&&!first)first=m;});
      if(first)first.scrollIntoView({block:'center',behavior:'smooth'});});
  })();</script>
  </body></html>`;
}

function metadataFromTemplate(template: DocumentTemplate): EditorMetadata {
  return {
    name: template.name ?? '',
    description: template.description ?? '',
    serviceId: template.serviceId ?? '',
    serviceName: template.serviceName ?? '',
    tagsText: (template.tags ?? []).join(', '),
  };
}

function parseTags(value: string): string[] {
  const tags = Array.from(
    new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    )
  ).slice(0, 100);
  return tags;
}

const FIELD_TYPE_LABEL: Record<string, string> = {
  TEXT: 'Văn bản ngắn',
  TEXTAREA: 'Văn bản dài',
  DATE: 'Ngày',
  NUMBER: 'Số',
  CURRENCY: 'Số tiền',
};

function fieldSummary(field: DocumentTemplateField): string {
  const parts = [FIELD_TYPE_LABEL[field.inputType] || field.inputType];
  if (field.required) parts.push('bắt buộc');
  if (field.label) parts.push(`nhãn "${field.label}"`);
  return parts.join(' · ');
}

function VersionCompare({
  versions,
  aId,
  bId,
  onChangeA,
  onChangeB,
}: {
  versions: DocumentTemplateVersion[];
  aId: string;
  bId: string;
  onChangeA: (id: string) => void;
  onChangeB: (id: string) => void;
}) {
  const a = versions.find((v) => v.id === aId);
  const b = versions.find((v) => v.id === bId);

  const diff = useMemo(() => {
    if (!a || !b) return null;
    const aFields = new Map((a.fields || []).map((f) => [f.fieldKey, f]));
    const bFields = new Map((b.fields || []).map((f) => [f.fieldKey, f]));
    const keys = Array.from(
      new Set(Array.from(aFields.keys()).concat(Array.from(bFields.keys())))
    ).sort();
    const added: string[] = [];
    const removed: string[] = [];
    const changed: Array<{ key: string; from: string; to: string }> = [];
    keys.forEach((key) => {
      const fa = aFields.get(key);
      const fb = bFields.get(key);
      if (fa && !fb) removed.push(key);
      else if (!fa && fb) added.push(key);
      else if (fa && fb) {
        const sa = fieldSummary(fa);
        const sb = fieldSummary(fb);
        if (sa !== sb) changed.push({ key, from: sa, to: sb });
      }
    });
    const meta: Array<{ label: string; from: string; to: string }> = [];
    const pushMeta = (label: string, x?: string, y?: string) => {
      if ((x || '') !== (y || '')) meta.push({ label, from: x || '—', to: y || '—' });
    };
    pushMeta('Tên', a.name, b.name);
    pushMeta('Mô tả', a.description, b.description);
    return { added, removed, changed, meta };
  }, [a, b]);

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="compare-a" className="text-xs font-medium text-gray-600">
            Phiên bản gốc
          </label>
          <select
            id="compare-a"
            value={aId}
            onChange={(e) => onChangeA(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Phiên bản {v.versionNumber}
              </option>
            ))}
          </select>
        </div>
        <span className="pb-2 text-gray-400">→</span>
        <div>
          <label htmlFor="compare-b" className="text-xs font-medium text-gray-600">
            So với
          </label>
          <select
            id="compare-b"
            value={bId}
            onChange={(e) => onChangeB(e.target.value)}
            className="mt-1 block rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            {versions.map((v) => (
              <option key={v.id} value={v.id}>
                Phiên bản {v.versionNumber}
              </option>
            ))}
          </select>
        </div>
      </div>

      {diff && (
        <div className="mt-4 space-y-2 text-sm">
          {diff.meta.length === 0 &&
          diff.added.length === 0 &&
          diff.removed.length === 0 &&
          diff.changed.length === 0 ? (
            <p className="italic text-gray-500">Hai phiên bản giống nhau về trường và metadata.</p>
          ) : (
            <>
              {diff.meta.map((m) => (
                <p key={m.label} className="text-amber-800">
                  <strong>{m.label}:</strong> "{m.from}" → "{m.to}"
                </p>
              ))}
              {diff.added.map((k) => (
                <p key={`a-${k}`} className="text-green-700">
                  + Thêm trường <code className="rounded bg-white px-1">{k}</code>
                </p>
              ))}
              {diff.removed.map((k) => (
                <p key={`r-${k}`} className="text-red-700">
                  − Bỏ trường <code className="rounded bg-white px-1">{k}</code>
                </p>
              ))}
              {diff.changed.map((c) => (
                <p key={`c-${c.key}`} className="text-amber-800">
                  ~ <code className="rounded bg-white px-1">{c.key}</code>: {c.from} → {c.to}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
