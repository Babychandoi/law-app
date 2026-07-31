import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldX,
  XCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import crmService from '../../service/crm';
import {
  DocumentAuditEntry,
  GeneratedDocument,
  GeneratedDocumentStatus,
} from '../../types/documentTemplate';
import { MeResponse } from '../../service/auth';
import { StaffUser } from '../../types/crm';
import { useOutletContext } from 'react-router-dom';
import Spinner from '../../component/common/ui/Spinner';
import EmptyState from '../../component/common/ui/EmptyState';
import Modal from '../../component/common/Modal';
import Button from '../../component/common/ui/Button';
import DocumentPagination from './DocumentPagination';
import { searchText } from './documentUi';

type StatusFilter = GeneratedDocumentStatus | 'ALL';
type SortValue = 'createdAt,desc' | 'createdAt,asc' | 'fileName,asc' | 'fileName,desc';

interface WorkflowModalState {
  document: GeneratedDocument;
  targetStatus: GeneratedDocumentStatus;
}

export default function GeneratedDocumentList() {
  const { me, isAdmin } = useOutletContext<{ me: MeResponse | null; isAdmin: boolean }>();
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortValue>('createdAt,desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [workflowModal, setWorkflowModal] = useState<WorkflowModalState | null>(null);
  const [auditDocument, setAuditDocument] = useState<GeneratedDocument | null>(null);
  const [includeExpired, setIncludeExpired] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, pageSize, sort, status, includeExpired]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [sortField, direction] = sort.split(',') as [string, 'asc' | 'desc'];
    try {
      const result = await documentTemplateService.listGeneratedPage({
        q: debouncedQuery || undefined,
        status,
        includeExpired: includeExpired || undefined,
        page: page - 1,
        size: pageSize,
        sort: sortField === 'fileName' ? 'generatedFileName' : sortField,
        direction,
      });
      setDocuments(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (pageError: any) {
      if (![404, 405].includes(pageError?.response?.status)) {
        setError(
          pageError?.response?.data?.message ||
            'Không tải được danh sách tài liệu. Vui lòng thử lại.'
        );
        setDocuments([]);
        setTotalElements(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      try {
        const all = await documentTemplateService.listGenerated();
        const needle = searchText(debouncedQuery);
        const filtered = all
          .filter((document) => status === 'ALL' || document.status === status)
          .filter((document) =>
            needle
              ? searchText(
                  [
                    document.fileName,
                    document.templateName,
                    document.serviceName ?? document.context?.serviceName,
                    document.matterReference ?? document.context?.matterReference,
                    document.dossierId ?? document.context?.dossierId,
                  ]
                    .filter(Boolean)
                    .join(' ')
                ).includes(needle)
              : true
          )
          .sort((a, b) => {
            if (sort === 'fileName,asc') return a.fileName.localeCompare(b.fileName, 'vi');
            if (sort === 'fileName,desc') return b.fileName.localeCompare(a.fileName, 'vi');
            const difference = dateValue(a.createdAt) - dateValue(b.createdAt);
            return sort === 'createdAt,asc' ? difference : -difference;
          });
        const start = (page - 1) * pageSize;
        setDocuments(filtered.slice(start, start + pageSize));
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } catch (legacyError: any) {
        setError(
          legacyError?.response?.data?.message ||
            'Không tải được danh sách tài liệu. Vui lòng thử lại.'
        );
        setDocuments([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, includeExpired, page, pageSize, sort, status]);

  useEffect(() => {
    load();
  }, [load]);

  const restore = async (document: GeneratedDocument) => {
    setRestoringId(document.id);
    try {
      await documentTemplateService.restoreRetention(document.id);
      toast.success('Đã khôi phục tài liệu');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không khôi phục được.');
    } finally {
      setRestoringId(null);
    }
  };

  useEffect(() => {
    if (!loading && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const download = async (document: GeneratedDocument) => {
    setDownloadingId(document.id);
    try {
      await documentTemplateService.download(document.id, document.fileName);
    } catch (downloadError: any) {
      toast.error(downloadError?.response?.data?.message || 'Không tải được file.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold">Tài liệu đã tạo</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Theo dõi phiên bản biểu mẫu, trạng thái phê duyệt và nguồn dữ liệu của từng file.
        </p>
      </header>

      <section
        aria-label="Tìm kiếm và lọc tài liệu"
        className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,1fr)_190px_210px]"
      >
        <label className="relative block">
          <span className="sr-only">Tìm tài liệu</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tên file, hồ sơ, dịch vụ..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          />
        </label>
        <label>
          <span className="sr-only">Lọc trạng thái quy trình</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          >
            <option value="ALL">Mọi trạng thái</option>
            {WORKFLOW_STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Sắp xếp tài liệu</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortValue)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          >
            <option value="createdAt,desc">Mới tạo gần đây</option>
            <option value="createdAt,asc">Cũ nhất trước</option>
            <option value="fileName,asc">Tên A–Z</option>
            <option value="fileName,desc">Tên Z–A</option>
          </select>
        </label>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={includeExpired}
              onChange={(event) => setIncludeExpired(event.target.checked)}
            />
            Hiện cả tài liệu đã ẩn do quá hạn
          </label>
        )}
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100 sm:self-auto"
          >
            <RefreshCw size={16} aria-hidden="true" /> Thử lại
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <Spinner center label="Đang tải lịch sử tài liệu" />
        </div>
      ) : documents.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white">
          <EmptyState
            icon={FileText}
            title={
              debouncedQuery || status !== 'ALL' ? 'Không có kết quả phù hợp' : 'Chưa có tài liệu'
            }
            description={
              debouncedQuery || status !== 'ALL'
                ? 'Hãy đổi từ khóa hoặc trạng thái để xem thêm.'
                : 'Tài liệu được tạo từ biểu mẫu sẽ xuất hiện tại đây.'
            }
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm lg:block">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-gray-50 text-left text-gray-600">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    File
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Hồ sơ / dịch vụ
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Biểu mẫu
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Ngày tạo
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents.map((document) => (
                  <tr
                    key={document.id}
                    className="border-t border-gray-100 align-top hover:bg-gray-50"
                  >
                    <td className="max-w-[260px] px-4 py-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-gold/15 text-brand-goldDark">
                          <FileText size={18} aria-hidden="true" />
                        </span>
                        <span className="break-words font-medium text-gray-900">
                          {document.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[210px] px-4 py-3 text-gray-600">
                      <DocumentContextSummary document={document} />
                    </td>
                    <td className="max-w-[210px] px-4 py-3 text-gray-600">
                      <span className="break-words">{document.templateName}</span>
                      <span className="block text-xs">phiên bản {document.templateVersion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <WorkflowBadge status={document.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {formatDateTime(document.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <DocumentActions
                        document={document}
                        me={me}
                        isAdmin={isAdmin}
                        downloading={downloadingId === document.id}
                        restoring={restoringId === document.id}
                        onDownload={() => download(document)}
                        onAudit={() => setAuditDocument(document)}
                        onWorkflow={(targetStatus) => setWorkflowModal({ document, targetStatus })}
                        onRestore={() => restore(document)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {documents.map((document) => (
              <article
                key={document.id}
                className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-gold/15 text-brand-goldDark">
                    <FileText size={19} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="break-all font-semibold text-gray-900">{document.fileName}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatDateTime(document.createdAt)}
                    </p>
                  </div>
                  <WorkflowBadge status={document.status} />
                </div>
                <dl className="mt-4 grid gap-3 border-y border-gray-100 py-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-gray-500">Biểu mẫu</dt>
                    <dd className="mt-0.5 text-gray-800">
                      {document.templateName} · v{document.templateVersion}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500">Hồ sơ / dịch vụ</dt>
                    <dd className="mt-0.5 text-gray-800">
                      <DocumentContextSummary document={document} />
                    </dd>
                  </div>
                </dl>
                <div className="mt-3">
                  <DocumentActions
                    document={document}
                    me={me}
                    isAdmin={isAdmin}
                    downloading={downloadingId === document.id}
                    restoring={restoringId === document.id}
                    onDownload={() => download(document)}
                    onAudit={() => setAuditDocument(document)}
                    onWorkflow={(targetStatus) => setWorkflowModal({ document, targetStatus })}
                    onRestore={() => restore(document)}
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200">
        <DocumentPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>

      {workflowModal && (
        <WorkflowDialog
          state={workflowModal}
          onClose={() => setWorkflowModal(null)}
          onCompleted={async () => {
            setWorkflowModal(null);
            await load();
          }}
        />
      )}
      {auditDocument && (
        <DocumentAuditDialog document={auditDocument} onClose={() => setAuditDocument(null)} />
      )}
    </div>
  );
}

function DocumentActions({
  document,
  me,
  isAdmin,
  downloading,
  restoring,
  onDownload,
  onAudit,
  onWorkflow,
  onRestore,
}: {
  document: GeneratedDocument;
  me: MeResponse | null;
  isAdmin: boolean;
  downloading: boolean;
  restoring: boolean;
  onDownload: () => void;
  onAudit: () => void;
  onWorkflow: (targetStatus: GeneratedDocumentStatus) => void;
  onRestore: () => void;
}) {
  const transitions = availableTransitions(document, me, isAdmin);
  return (
    <div className="flex flex-wrap justify-end gap-2">
      {document.hiddenByRetention && (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
          Đã ẩn (quá hạn)
        </span>
      )}
      {document.hiddenByRetention && isAdmin && (
        <button
          type="button"
          onClick={onRestore}
          disabled={restoring}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 disabled:opacity-50"
        >
          <RotateCcw size={14} aria-hidden="true" /> Khôi phục
        </button>
      )}
      <button
        type="button"
        onClick={onDownload}
        disabled={downloading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand-goldDark px-3 py-2 text-xs font-medium text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-50"
      >
        {downloading ? (
          <Spinner size={14} className="text-white" label={`Đang tải ${document.fileName}`} />
        ) : (
          <Download size={14} aria-hidden="true" />
        )}
        Tải
      </button>
      <button
        type="button"
        onClick={onAudit}
        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
      >
        <Eye size={14} aria-hidden="true" /> Chi tiết
      </button>
      {transitions.map((transition) => (
        <button
          key={transition.target}
          type="button"
          onClick={() => onWorkflow(transition.target)}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium focus:outline-none focus-visible:ring-2 ${
            transition.danger
              ? 'border-red-300 text-red-700 hover:bg-red-50 focus-visible:ring-red-600'
              : 'border-blue-300 text-blue-700 hover:bg-blue-50 focus-visible:ring-blue-600'
          }`}
        >
          {transition.target === 'IN_REVIEW' ? (
            <Send size={14} aria-hidden="true" />
          ) : transition.target === 'APPROVED' || transition.target === 'FINAL' ? (
            <CheckCircle2 size={14} aria-hidden="true" />
          ) : transition.target === 'VOID' ? (
            <ShieldX size={14} aria-hidden="true" />
          ) : (
            <XCircle size={14} aria-hidden="true" />
          )}
          {transition.label}
        </button>
      ))}
    </div>
  );
}

function WorkflowDialog({
  state,
  onClose,
  onCompleted,
}: {
  state: WorkflowModalState;
  onClose: () => void;
  onCompleted: () => void;
}) {
  const [reviewerUserId, setReviewerUserId] = useState(state.document.reviewerUserId ?? '');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewers, setReviewers] = useState<StaffUser[]>([]);
  const [reviewersLoading, setReviewersLoading] = useState(state.targetStatus === 'IN_REVIEW');
  const requiresReason = state.targetStatus === 'REJECTED' || state.targetStatus === 'VOID';
  const requiresReviewer = state.targetStatus === 'IN_REVIEW' && !state.document.reviewerUserId;
  const transitionLabel = workflowLabel(state.targetStatus);
  const eligibleReviewers = reviewers.filter(
    (reviewer) => reviewer.id !== state.document.createdByUserId
  );

  useEffect(() => {
    if (state.targetStatus !== 'IN_REVIEW') return;
    crmService
      .staff()
      .then(setReviewers)
      .catch(() => setReviewers([]))
      .finally(() => setReviewersLoading(false));
  }, [state.targetStatus]);

  const submit = async () => {
    if (requiresReason && !reason.trim()) {
      setError('Hãy ghi rõ lý do cho quyết định này.');
      return;
    }
    if (requiresReviewer && !reviewerUserId.trim()) {
      setError('Hãy chỉ định người chịu trách nhiệm duyệt tài liệu.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await documentTemplateService.transitionWorkflow(state.document.id, {
        targetStatus: state.targetStatus,
        reviewerUserId:
          state.targetStatus === 'IN_REVIEW' ? reviewerUserId.trim() || undefined : undefined,
        reason: reason.trim() || undefined,
        expectedRevision: state.document.revision,
      });
      toast.success(`Đã chuyển tài liệu sang trạng thái “${transitionLabel}”`);
      await onCompleted();
    } catch (transitionError: any) {
      setError(
        transitionError?.response?.status === 409
          ? 'Tài liệu đã được cập nhật ở nơi khác. Đóng hộp thoại và tải lại danh sách.'
          : transitionError?.response?.data?.message || 'Không cập nhật được quy trình.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`Chuyển sang “${transitionLabel}”`}
      size="md"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button
            variant={
              state.targetStatus === 'REJECTED' || state.targetStatus === 'VOID'
                ? 'danger'
                : 'primary'
            }
            onClick={submit}
            loading={submitting}
            disabled={reviewersLoading}
          >
            Xác nhận
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-700">
        Tài liệu: <strong className="break-all">{state.document.fileName}</strong>
      </p>
      {state.targetStatus === 'IN_REVIEW' && (
        <div className="mt-4">
          <label htmlFor="workflow-reviewer" className="text-sm font-medium text-gray-700">
            Người duyệt {requiresReviewer && <span className="text-red-600">*</span>}
          </label>
          {reviewersLoading ? (
            <div className="mt-2">
              <Spinner size={18} label="Đang tải danh sách người duyệt" />
            </div>
          ) : eligibleReviewers.length ? (
            <select
              id="workflow-reviewer"
              value={reviewerUserId}
              onChange={(event) => {
                setReviewerUserId(event.target.value);
                setError('');
              }}
              required={requiresReviewer}
              aria-invalid={requiresReviewer && !!error && !reviewerUserId.trim()}
              aria-describedby={
                requiresReviewer && !!error && !reviewerUserId.trim() ? 'workflow-error' : undefined
              }
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
            >
              <option value="">Chọn người duyệt</option>
              {eligibleReviewers.map((reviewer) => (
                <option key={reviewer.id} value={reviewer.id}>
                  {reviewer.fullName || reviewer.username}
                  {reviewer.position ? ` · ${reviewer.position}` : ''}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="workflow-reviewer"
              value={reviewerUserId}
              onChange={(event) => {
                setReviewerUserId(event.target.value);
                setError('');
              }}
              required={requiresReviewer}
              aria-invalid={requiresReviewer && !!error && !reviewerUserId.trim()}
              aria-describedby={
                requiresReviewer && !!error && !reviewerUserId.trim() ? 'workflow-error' : undefined
              }
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
            />
          )}
        </div>
      )}
      <div className="mt-4">
        <label htmlFor="workflow-reason" className="text-sm font-medium text-gray-700">
          Lý do / ghi chú {requiresReason && <span className="text-red-600">*</span>}
        </label>
        <textarea
          id="workflow-reason"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          rows={3}
          maxLength={1000}
          aria-invalid={!!error}
          aria-describedby={error ? 'workflow-error' : undefined}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
        />
      </div>
      {error && (
        <p id="workflow-error" role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </Modal>
  );
}

function DocumentAuditDialog({
  document,
  onClose,
}: {
  document: GeneratedDocument;
  onClose: () => void;
}) {
  const [audit, setAudit] = useState<DocumentAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    documentTemplateService
      .listGeneratedAudit(document.id, 0, 50)
      .then((page) => setAudit(page.content))
      .catch((auditError: any) => {
        if ([404, 405].includes(auditError?.response?.status)) setUnavailable(true);
        else setError(auditError?.response?.data?.message || 'Không tải được nhật ký tài liệu.');
      })
      .finally(() => setLoading(false));
  }, [document.id]);

  return (
    <Modal title="Chi tiết & nhật ký tài liệu" size="lg" onClose={onClose}>
      <dl className="grid gap-4 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <DetailItem label="Tên file" value={document.fileName} />
        <DetailItem label="Trạng thái" value={workflowLabel(document.status)} />
        <DetailItem
          label="Biểu mẫu"
          value={`${document.templateName} · phiên bản ${document.templateVersion}`}
        />
        <DetailItem label="Ngày tạo" value={formatDateTime(document.createdAt)} />
        <DetailItem
          label="Mã hồ sơ"
          value={document.matterReference ?? document.context?.matterReference ?? '—'}
        />
        <DetailItem
          label="Dịch vụ"
          value={document.serviceName ?? document.context?.serviceName ?? '—'}
        />
      </dl>
      <h3 className="mt-6 font-semibold">Nhật ký kiểm toán</h3>
      {loading ? (
        <Spinner center label="Đang tải nhật ký tài liệu" />
      ) : unavailable ? (
        <p className="mt-3 text-sm text-gray-600">Máy chủ hiện tại chưa hỗ trợ nhật ký chi tiết.</p>
      ) : error ? (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      ) : audit.length === 0 ? (
        <p className="mt-3 text-sm text-gray-600">Chưa có hoạt động nào được ghi nhận.</p>
      ) : (
        <ol className="mt-3 space-y-3">
          {audit.map((entry) => (
            <li key={entry.id} className="relative border-l-2 border-brand-gold/40 pl-4">
              <p className="text-sm font-medium text-gray-900">{auditLabel(entry.action)}</p>
              {(entry.fromStatus || entry.toStatus) && (
                <p className="text-xs text-gray-600">
                  {entry.fromStatus
                    ? workflowLabel(entry.fromStatus as GeneratedDocumentStatus)
                    : '—'}
                  {' → '}
                  {entry.toStatus ? workflowLabel(entry.toStatus as GeneratedDocumentStatus) : '—'}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formatDateTime(entry.createdAt)}
                {entry.actorUserId && ` · Người thực hiện: ${entry.actorUserId}`}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

function DocumentContextSummary({ document }: { document: GeneratedDocument }) {
  const matterReference = document.matterReference ?? document.context?.matterReference;
  const dossierId = document.dossierId ?? document.context?.dossierId;
  const serviceName = document.serviceName ?? document.context?.serviceName;
  if (!matterReference && !dossierId && !serviceName) return <span>Chưa liên kết</span>;
  return (
    <>
      {matterReference && <span className="block break-words font-medium">{matterReference}</span>}
      {!matterReference && dossierId && <span className="block break-words">{dossierId}</span>}
      {serviceName && <span className="block break-words text-xs">{serviceName}</span>}
    </>
  );
}

function WorkflowBadge({ status }: { status?: GeneratedDocumentStatus }) {
  const actual = status ?? 'DRAFT';
  const classes: Record<GeneratedDocumentStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-700',
    IN_REVIEW: 'bg-blue-100 text-blue-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    FINAL: 'bg-purple-100 text-purple-700',
    VOID: 'bg-gray-800 text-white',
  };
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${classes[actual]}`}
    >
      {workflowLabel(actual)}
    </span>
  );
}

function availableTransitions(
  document: GeneratedDocument,
  me: MeResponse | null,
  isAdmin: boolean
): Array<{ target: GeneratedDocumentStatus; label: string; danger?: boolean }> {
  const status = document.status ?? 'DRAFT';
  const isAuthor = !!me?.id && document.createdByUserId === me.id;
  const isReviewer = !!me?.id && document.reviewerUserId === me.id;
  const transitions: Array<{ target: GeneratedDocumentStatus; label: string; danger?: boolean }> =
    [];
  if ((status === 'DRAFT' || status === 'REJECTED') && (isAdmin || isAuthor)) {
    transitions.push({
      target: 'IN_REVIEW',
      label: status === 'REJECTED' ? 'Gửi lại' : 'Gửi duyệt',
    });
  }
  if (status === 'IN_REVIEW' && (isAdmin || isReviewer)) {
    transitions.push({ target: 'APPROVED', label: 'Duyệt' });
    transitions.push({ target: 'REJECTED', label: 'Từ chối', danger: true });
  }
  if (status === 'APPROVED' && isAdmin) {
    transitions.push({ target: 'FINAL', label: 'Phát hành' });
    transitions.push({ target: 'IN_REVIEW', label: 'Duyệt lại' });
  }
  if (isAdmin && status !== 'FINAL' && status !== 'VOID') {
    transitions.push({ target: 'VOID', label: 'Vô hiệu', danger: true });
  }
  return transitions;
}

const WORKFLOW_STATUSES: Array<{ value: GeneratedDocumentStatus; label: string }> = [
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'IN_REVIEW', label: 'Đang duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Bị từ chối' },
  { value: 'FINAL', label: 'Đã phát hành' },
  { value: 'VOID', label: 'Đã vô hiệu' },
];

function workflowLabel(status?: string): string {
  return WORKFLOW_STATUSES.find((item) => item.value === status)?.label ?? status ?? 'Bản nháp';
}

function auditLabel(action: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Tạo tài liệu',
    GENERATED: 'Sinh file Word',
    WORKFLOW_TRANSITION: 'Chuyển trạng thái',
    DOWNLOADED: 'Tải tài liệu',
  };
  return labels[action] ?? action;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-0.5 break-words font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function formatDateTime(value?: string): string {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
