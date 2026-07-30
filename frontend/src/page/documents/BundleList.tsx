import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Archive,
  Layers,
  PlayCircle,
  PlusCircle,
  Puzzle,
  RefreshCw,
  Settings2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentBundle } from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';
import ConfirmDialog from '../../component/common/ui/ConfirmDialog';

const DOCUMENT_BASE = '/2025/luatpoip/tai-lieu';

export default function BundleList() {
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const [bundles, setBundles] = useState<DocumentBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiving, setArchiving] = useState<DocumentBundle | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setBundles(await documentTemplateService.listBundles());
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không tải được danh sách bộ mẫu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmArchive = async () => {
    if (!archiving) return;
    setBusy(true);
    try {
      await documentTemplateService.archiveBundle(archiving.id);
      toast.success('Đã lưu trữ bộ mẫu');
      setArchiving(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Không lưu trữ được.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải bộ mẫu" />
      </div>
    );
  }
  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error}</p>
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Bộ mẫu tài liệu</h2>
          <p className="mt-1 text-sm text-gray-600">
            Nhóm nhiều biểu mẫu thành một bộ để tạo trọn bộ hồ sơ trong một lần.
          </p>
        </div>
        {isAdmin && (
          <Link
            to={`${DOCUMENT_BASE}/bundles/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
          >
            <PlusCircle size={16} aria-hidden="true" /> Tạo bộ mẫu
          </Link>
        )}
      </div>

      {bundles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Layers className="mx-auto text-gray-400" aria-hidden="true" />
          <p className="mt-3 text-gray-600">Chưa có bộ mẫu nào.</p>
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {bundles.map((bundle) => (
            <li
              key={bundle.id}
              className="flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900">{bundle.name}</h3>
                <StatusBadge status={bundle.status} />
              </div>
              {bundle.serviceName && (
                <p className="mt-1 text-xs text-gray-500">{bundle.serviceName}</p>
              )}
              {bundle.description && (
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">{bundle.description}</p>
              )}
              <p className="mt-3 inline-flex items-center gap-1 text-sm text-gray-700">
                <Puzzle size={14} aria-hidden="true" /> {bundle.items.length} biểu mẫu
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {bundle.status === 'ACTIVE' && (
                  <Link
                    to={`${DOCUMENT_BASE}/bundles/${bundle.id}/generate`}
                    className="inline-flex items-center gap-1 rounded-lg bg-brand-goldDark px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-gold"
                  >
                    <PlayCircle size={14} aria-hidden="true" /> Tạo hồ sơ
                  </Link>
                )}
                {isAdmin && (
                  <>
                    <Link
                      to={`${DOCUMENT_BASE}/bundles/${bundle.id}/edit`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                    >
                      <Settings2 size={14} aria-hidden="true" /> Sửa
                    </Link>
                    {bundle.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => setArchiving(bundle)}
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

      <ConfirmDialog
        open={!!archiving}
        title="Lưu trữ bộ mẫu"
        message={`Lưu trữ bộ mẫu "${archiving?.name}"? Người dùng sẽ không tạo hồ sơ từ bộ này nữa.`}
        confirmText="Lưu trữ"
        loading={busy}
        onConfirm={confirmArchive}
        onCancel={() => setArchiving(null)}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ACTIVE: { label: 'Đang dùng', className: 'bg-green-100 text-green-800' },
    ARCHIVED: { label: 'Lưu trữ', className: 'bg-gray-100 text-gray-600' },
    DRAFT: { label: 'Nháp', className: 'bg-amber-100 text-amber-800' },
  };
  const item = map[status] ?? map.DRAFT;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
}
