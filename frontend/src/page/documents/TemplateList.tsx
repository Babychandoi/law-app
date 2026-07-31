import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Archive,
  Copy,
  Edit,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Wand2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentFolder, DocumentTemplate } from '../../types/documentTemplate';
import { MeResponse } from '../../service/auth';
import EmptyState from '../../component/common/ui/EmptyState';
import Spinner from '../../component/common/ui/Spinner';
import useConfirm from '../../component/common/ui/useConfirm';
import DocumentPagination from './DocumentPagination';
import { searchText } from './documentUi';

type StatusFilter = DocumentTemplate['status'] | 'ALL';
type SortValue = 'updatedAt,desc' | 'name,asc' | 'name,desc' | 'version,desc';

export default function TemplateList() {
  const { me, isAdmin } = useOutletContext<{ me: MeResponse | null; isAdmin: boolean }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [sort, setSort] = useState<SortValue>('updatedAt,desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [folderId, setFolderId] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [mineOnly, setMineOnly] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirm();
  const generationContextQuery = buildGenerationContextQuery(searchParams);
  const linkedServiceId = searchParams.get('serviceId') || '';

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, status, sort, pageSize, folderId, mineOnly]);

  const loadFolders = useCallback(async () => {
    try {
      setFolders(await documentTemplateService.listFolders());
    } catch {
      setFolders([]);
    }
  }, []);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  const createFolder = async () => {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      const created = await documentTemplateService.createFolder(name);
      setNewFolderName('');
      setShowNewFolder(false);
      await loadFolders();
      setFolderId(created.id);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không tạo được thư mục.');
    }
  };

  const deleteFolder = async () => {
    if (!folderId || folderId === 'none') return;
    const ok = await confirm({
      title: 'Xóa thư mục',
      message: 'Xóa thư mục này? Các biểu mẫu bên trong sẽ được gỡ khỏi thư mục (không bị xóa).',
      confirmText: 'Xóa',
    });
    if (!ok) return;
    try {
      await documentTemplateService.deleteFolder(folderId);
      setFolderId('');
      await loadFolders();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không xóa được thư mục.');
    }
  };

  const duplicate = async (template: DocumentTemplate) => {
    setDuplicatingId(template.id);
    try {
      const created = await documentTemplateService.duplicateTemplate(template.id);
      toast.success('Đã nhân bản mẫu');
      navigate(`/2025/luatpoip/tai-lieu/templates/${created.id}/edit`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không nhân bản được mẫu.');
    } finally {
      setDuplicatingId(null);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const [sortField, direction] = sort.split(',') as [string, 'asc' | 'desc'];
    try {
      const result = await documentTemplateService.listTemplatesPage({
        q: debouncedQuery || undefined,
        status: isAdmin ? status : 'ACTIVE',
        serviceId: linkedServiceId || undefined,
        folderId: folderId || undefined,
        createdBy: mineOnly && me?.id ? me.id : undefined,
        page: page - 1,
        size: pageSize,
        sort: sortField,
        direction,
      });
      setTemplates(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (pageError: any) {
      // Older deployments only expose the array endpoint. Keep the UI functional while the
      // document-service rolls out independently.
      if (![404, 405].includes(pageError?.response?.status)) {
        setError(
          pageError?.response?.data?.message ||
            'Không tải được danh sách biểu mẫu. Vui lòng thử lại.'
        );
        setTemplates([]);
        setTotalElements(0);
        setTotalPages(0);
        setLoading(false);
        return;
      }
      try {
        const all = await documentTemplateService.listTemplates(isAdmin ? status : 'ACTIVE');
        const normalizedQuery = searchText(debouncedQuery);
        const filtered = all
          .filter((template) => !linkedServiceId || template.serviceId === linkedServiceId)
          .filter((template) => !mineOnly || !me?.id || template.createdByUserId === me.id)
          .filter((template) =>
            !folderId
              ? true
              : folderId === 'none'
                ? !template.folderId
                : template.folderId === folderId
          )
          .filter((template) =>
            normalizedQuery
              ? searchText(
                  [
                    template.name,
                    template.description,
                    template.serviceName,
                    ...(template.tags ?? []),
                  ]
                    .filter(Boolean)
                    .join(' ')
                ).includes(normalizedQuery)
              : true
          )
          .sort((a, b) => {
            if (sort === 'name,asc') return a.name.localeCompare(b.name, 'vi');
            if (sort === 'name,desc') return b.name.localeCompare(a.name, 'vi');
            if (sort === 'version,desc') return b.version - a.version;
            return dateValue(b.updatedAt ?? b.createdAt) - dateValue(a.updatedAt ?? a.createdAt);
          });
        const start = (page - 1) * pageSize;
        setTemplates(filtered.slice(start, start + pageSize));
        setTotalElements(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize));
      } catch (legacyError: any) {
        setError(
          legacyError?.response?.data?.message ||
            'Không tải được danh sách biểu mẫu. Vui lòng thử lại.'
        );
        setTemplates([]);
        setTotalElements(0);
        setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [
    debouncedQuery,
    isAdmin,
    linkedServiceId,
    folderId,
    mineOnly,
    me?.id,
    page,
    pageSize,
    sort,
    status,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!loading && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [loading, page, totalPages]);

  const archive = async (template: DocumentTemplate) => {
    const accepted = await confirm({
      title: 'Lưu trữ biểu mẫu',
      message: (
        <>
          Biểu mẫu <strong>{template.name}</strong> sẽ không còn dùng để tạo tài liệu mới.
        </>
      ),
      confirmText: 'Lưu trữ',
      variant: 'danger',
    });
    if (!accepted) return;
    setArchivingId(template.id);
    try {
      await documentTemplateService.archive(template.id);
      toast.success('Đã lưu trữ biểu mẫu');
      await load();
    } catch (archiveError: any) {
      toast.error(archiveError?.response?.data?.message || 'Không lưu trữ được biểu mẫu');
    } finally {
      setArchivingId(null);
    }
  };

  const restore = async (template: DocumentTemplate) => {
    const accepted = await confirm({
      title: 'Khôi phục biểu mẫu',
      message: (
        <>
          Khôi phục <strong>{template.name}</strong> để tiếp tục sử dụng và chỉnh sửa?
        </>
      ),
      confirmText: 'Khôi phục',
    });
    if (!accepted) return;
    setArchivingId(template.id);
    try {
      await documentTemplateService.restore(template.id);
      toast.success('Đã khôi phục biểu mẫu');
      await load();
    } catch (restoreError: any) {
      toast.error(restoreError?.response?.data?.message || 'Không khôi phục được biểu mẫu');
    } finally {
      setArchivingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {confirmDialog}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Biểu mẫu pháp lý</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Tìm biểu mẫu đã duyệt hoặc quản trị các bản nháp và phiên bản đang lưu trữ.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/2025/luatpoip/tai-lieu/templates/new"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2 text-sm font-medium text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark focus-visible:ring-offset-2"
          >
            <Plus size={18} aria-hidden="true" /> Tải mẫu mới
          </Link>
        )}
      </div>

      {searchParams.get('crmCaseId') && (
        <section
          aria-label="Hồ sơ đang được liên kết"
          className="flex flex-col gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>
            Đang chọn biểu mẫu cho CRM case{' '}
            <strong className="break-all">{searchParams.get('crmCaseId')}</strong>
            {searchParams.get('serviceName') && ` · ${searchParams.get('serviceName')}`}
          </p>
          <Link
            to="/2025/luatpoip/tai-lieu"
            className="shrink-0 font-medium underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            Bỏ liên kết hồ sơ
          </Link>
        </section>
      )}

      <section
        aria-label="Tìm kiếm và lọc biểu mẫu"
        className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(220px,1fr)_180px_210px]"
      >
        <label className="relative block">
          <span className="sr-only">Tìm biểu mẫu</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, dịch vụ hoặc thẻ..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          />
        </label>
        {isAdmin ? (
          <label>
            <span className="sr-only">Lọc theo trạng thái</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="DRAFT">Bản nháp</option>
              <option value="ARCHIVED">Đã lưu trữ</option>
            </select>
          </label>
        ) : (
          <div className="hidden md:block" aria-hidden="true" />
        )}
        <label>
          <span className="sr-only">Sắp xếp biểu mẫu</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortValue)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
          >
            <option value="updatedAt,desc">Cập nhật gần nhất</option>
            <option value="name,asc">Tên A–Z</option>
            <option value="name,desc">Tên Z–A</option>
            <option value="version,desc">Phiên bản mới nhất</option>
          </select>
        </label>
        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-3">
          <label className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Thư mục</span>
            <select
              value={folderId}
              onChange={(event) => setFolderId(event.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-goldDark focus:outline-none focus:ring-2 focus:ring-brand-goldDark/20"
            >
              <option value="">Tất cả</option>
              <option value="none">Chưa phân thư mục</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
          {isAdmin && !showNewFolder && (
            <button
              type="button"
              onClick={() => setShowNewFolder(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Plus size={14} aria-hidden="true" /> Thư mục mới
            </button>
          )}
          {isAdmin && showNewFolder && (
            <span className="inline-flex items-center gap-1">
              <input
                value={newFolderName}
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && createFolder()}
                placeholder="Tên thư mục"
                aria-label="Tên thư mục mới"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                autoFocus
              />
              <button
                type="button"
                onClick={createFolder}
                className="rounded-lg bg-brand-goldDark px-3 py-2 text-sm font-medium text-white hover:bg-brand-gold"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolder(false);
                  setNewFolderName('');
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              >
                Hủy
              </button>
            </span>
          )}
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={mineOnly}
                onChange={(event) => setMineOnly(event.target.checked)}
              />
              Chỉ mẫu của tôi
            </label>
          )}
          {isAdmin && folderId && folderId !== 'none' && (
            <button
              type="button"
              onClick={deleteFolder}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              <Archive size={14} aria-hidden="true" /> Xóa thư mục
            </button>
          )}
        </div>
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
          <Spinner center label="Đang tải danh sách biểu mẫu" />
        </div>
      ) : templates.length === 0 && !error ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white">
          <EmptyState
            icon={FileText}
            title={
              debouncedQuery || status !== 'ALL' ? 'Không có kết quả phù hợp' : 'Chưa có biểu mẫu'
            }
            description={
              debouncedQuery || status !== 'ALL'
                ? 'Hãy đổi từ khóa hoặc bộ lọc để xem thêm biểu mẫu.'
                : 'Tải mẫu DOCX đầu tiên để bắt đầu tự động hóa tài liệu.'
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy={loading}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isAdmin={isAdmin}
              archiving={archivingId === template.id}
              duplicating={duplicatingId === template.id}
              onArchive={() => archive(template)}
              onRestore={() => restore(template)}
              onDuplicate={() => duplicate(template)}
              generationContextQuery={generationContextQuery}
            />
          ))}
        </div>
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
    </div>
  );
}

function TemplateCard({
  template,
  isAdmin,
  archiving,
  duplicating,
  onArchive,
  onRestore,
  onDuplicate,
  generationContextQuery,
}: {
  template: DocumentTemplate;
  isAdmin: boolean;
  archiving: boolean;
  duplicating: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
  generationContextQuery: string;
}) {
  return (
    <article className="flex min-w-0 flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gold/15 text-brand-goldDark">
          <FileText size={22} aria-hidden="true" />
        </span>
        <StatusBadge status={template.status} />
      </div>
      <h3 className="mt-4 break-words text-lg font-semibold">{template.name}</h3>
      <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-brand-muted">
        {template.description || 'Chưa có mô tả'}
      </p>
      {template.serviceName && (
        <p className="mt-3 text-xs font-medium text-gray-700">Dịch vụ: {template.serviceName}</p>
      )}
      {!!template.tags?.length && (
        <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Thẻ biểu mẫu">
          {template.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              {tag}
            </span>
          ))}
        </div>
      )}
      <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-xs text-brand-muted">
        <div>
          <dt className="sr-only">Số trường</dt>
          <dd>{template.fields.length} trường dữ liệu</dd>
        </div>
        <div className="text-right">
          <dt className="sr-only">Phiên bản</dt>
          <dd>Phiên bản {template.version}</dd>
        </div>
        <div className="col-span-2">
          <dt className="sr-only">Cập nhật</dt>
          <dd>
            Cập nhật{' '}
            {template.updatedAt
              ? new Date(template.updatedAt).toLocaleDateString('vi-VN')
              : 'chưa rõ'}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        {template.status === 'ACTIVE' && (
          <Link
            to={`/2025/luatpoip/tai-lieu/generate/${template.id}${generationContextQuery}`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-3 py-2 text-sm font-medium text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
          >
            <Wand2 size={16} aria-hidden="true" /> Tạo tài liệu
          </Link>
        )}
        {isAdmin && (
          <>
            <Link
              to={`/2025/luatpoip/tai-lieu/templates/${template.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
            >
              <Edit size={16} aria-hidden="true" /> Cấu hình
            </Link>
            <button
              type="button"
              onClick={onDuplicate}
              disabled={duplicating}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-50"
            >
              {duplicating ? (
                <Spinner size={16} label={`Đang nhân bản ${template.name}`} />
              ) : (
                <Copy size={16} aria-hidden="true" />
              )}
              Nhân bản
            </button>
            {template.status !== 'ARCHIVED' && (
              <button
                type="button"
                onClick={onArchive}
                disabled={archiving}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark disabled:opacity-50"
              >
                {archiving ? (
                  <Spinner size={16} label={`Đang lưu trữ ${template.name}`} />
                ) : (
                  <Archive size={16} aria-hidden="true" />
                )}
                Lưu trữ
              </button>
            )}
            {template.status === 'ARCHIVED' && (
              <button
                type="button"
                onClick={onRestore}
                disabled={archiving}
                className="inline-flex items-center gap-2 rounded-lg border border-green-300 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 disabled:opacity-50"
              >
                {archiving ? (
                  <Spinner size={16} label={`Đang khôi phục ${template.name}`} />
                ) : (
                  <RotateCcw size={16} aria-hidden="true" />
                )}
                Khôi phục
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: DocumentTemplate['status'] }) {
  const label =
    status === 'ACTIVE' ? 'Đang hoạt động' : status === 'DRAFT' ? 'Bản nháp' : 'Đã lưu trữ';
  const cls =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : status === 'DRAFT'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-gray-100 text-gray-600';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

function dateValue(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function buildGenerationContextQuery(searchParams: URLSearchParams): string {
  const context = new URLSearchParams();
  ['crmCaseId', 'customerId', 'serviceId', 'serviceName', 'dossierId', 'matterReference'].forEach(
    (key) => {
      const value = searchParams.get(key);
      if (value) context.set(key, value);
    }
  );
  searchParams.getAll('sourceReference').forEach((value) => {
    context.append('sourceReference', value);
  });
  const query = context.toString();
  return query ? `?${query}` : '';
}
