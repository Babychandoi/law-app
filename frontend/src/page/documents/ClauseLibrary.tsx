import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Archive, Copy, Library, PlusCircle, RefreshCw, Search, Settings2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { ClauseRequest, DocumentClause } from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import Modal from '../../component/common/Modal';
import ConfirmDialog from '../../component/common/ui/ConfirmDialog';

// eslint-disable-next-line no-template-curly-in-string
const IF_EXAMPLE = '${if_KEY}';

type EditTarget = { mode: 'new' } | { mode: 'edit'; clause: DocumentClause } | null;

export default function ClauseLibrary() {
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const [clauses, setClauses] = useState<DocumentClause[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<EditTarget>(null);
  const [archiving, setArchiving] = useState<DocumentClause | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async (q?: string) => {
    setLoading(true);
    setError('');
    try {
      setClauses(await documentTemplateService.listClauses(q));
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không tải được thư viện điều khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    load(query.trim() || undefined);
  };

  const copy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Đã sao chép nội dung điều khoản');
    } catch {
      toast.info('Hãy sao chép thủ công.');
    }
  };

  const confirmArchive = async () => {
    if (!archiving) return;
    setBusy(true);
    try {
      await documentTemplateService.archiveClause(archiving.id);
      toast.success('Đã lưu trữ điều khoản');
      setArchiving(null);
      load(query.trim() || undefined);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không lưu trữ được.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Thư viện điều khoản</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kho đoạn văn tái dùng — sao chép vào file Word mẫu; kết hợp{' '}
            <code className="rounded bg-brand-surface px-1">{IF_EXAMPLE}</code> để bật/tắt theo điều
            kiện.
          </p>
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setEditing({ mode: 'new' })}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold"
          >
            <PlusCircle size={16} aria-hidden="true" /> Tạo điều khoản
          </button>
        )}
      </div>

      <form onSubmit={search} className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung, nhóm, tag…"
            aria-label="Tìm điều khoản"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Tìm
        </button>
      </form>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white">
          <Spinner center label="Đang tải điều khoản" />
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-3 inline-flex items-center gap-2 font-medium underline"
          >
            <RefreshCw size={16} aria-hidden="true" /> Thử lại
          </button>
        </div>
      ) : clauses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Library className="mx-auto text-gray-400" aria-hidden="true" />
          <p className="mt-3 text-gray-600">Chưa có điều khoản nào.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {clauses.map((clause) => (
            <li
              key={clause.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{clause.title}</h3>
                {clause.status === 'ARCHIVED' && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    Lưu trữ
                  </span>
                )}
              </div>
              {clause.category && <p className="mt-0.5 text-xs text-gray-500">{clause.category}</p>}
              <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-gray-700">
                {clause.content}
              </p>
              {clause.tags && clause.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {clause.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-brand-surface px-1.5 py-0.5 text-xs text-brand-goldDark"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => copy(clause.content)}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand-goldDark px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-gold"
                >
                  <Copy size={14} aria-hidden="true" /> Sao chép
                </button>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditing({ mode: 'edit', clause })}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                    >
                      <Settings2 size={14} aria-hidden="true" /> Sửa
                    </button>
                    {clause.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setArchiving(clause)}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Archive size={14} aria-hidden="true" /> Lưu trữ
                      </button>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ClauseEditorModal
          target={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load(query.trim() || undefined);
          }}
        />
      )}

      <ConfirmDialog
        open={!!archiving}
        title="Lưu trữ điều khoản"
        message={`Lưu trữ điều khoản "${archiving?.title}"?`}
        confirmText="Lưu trữ"
        loading={busy}
        onConfirm={confirmArchive}
        onCancel={() => setArchiving(null)}
      />
    </div>
  );
}

function ClauseEditorModal({
  target,
  onClose,
  onSaved,
}: {
  target: { mode: 'new' } | { mode: 'edit'; clause: DocumentClause };
  onClose: () => void;
  onSaved: () => void;
}) {
  const existing = target.mode === 'edit' ? target.clause : null;
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [category, setCategory] = useState(existing?.category || '');
  const [tagsText, setTagsText] = useState((existing?.tags || []).join(', '));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Tiêu đề và nội dung là bắt buộc.');
      return;
    }
    setSaving(true);
    try {
      const request: ClauseRequest = {
        title: title.trim(),
        content,
        category: category.trim() || undefined,
        tags: tagsText
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        expectedRevision: existing?.revision,
      };
      if (existing) await documentTemplateService.updateClause(existing.id, request);
      else await documentTemplateService.createClause(request);
      onSaved();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không lưu được điều khoản.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={existing ? 'Sửa điều khoản' : 'Tạo điều khoản'}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold disabled:opacity-60"
          >
            {saving && <Spinner size={16} className="text-white" label="Đang lưu" />}
            Lưu
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label htmlFor="clause-title" className="text-sm font-medium text-gray-800">
            Tiêu đề *
          </label>
          <input
            id="clause-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            maxLength={300}
          />
        </div>
        <div>
          <label htmlFor="clause-content" className="text-sm font-medium text-gray-800">
            Nội dung *
          </label>
          <textarea
            id="clause-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className={inputClass}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="clause-category" className="text-sm font-medium text-gray-800">
              Nhóm
            </label>
            <input
              id="clause-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="clause-tags" className="text-sm font-medium text-gray-800">
              Tag (phân tách bằng dấu phẩy)
            </label>
            <input
              id="clause-tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-goldDark focus:ring-2 focus:ring-brand-goldDark/20';
