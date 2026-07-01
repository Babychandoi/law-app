import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Archive, Edit, FileText, Plus, Wand2 } from 'lucide-react';
import { toast } from 'react-toastify';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentTemplate } from '../../types/documentTemplate';

export default function TemplateList() {
  const { isAdmin } = useOutletContext<{ isAdmin: boolean }>();
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setTemplates(await documentTemplateService.listTemplates(isAdmin ? 'ALL' : undefined));
    } catch {
      toast.error('Không tải được danh sách mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [isAdmin]);

  const archive = async (id: string) => {
    if (!window.confirm('Lưu trữ mẫu này?')) return;
    try {
      await documentTemplateService.archive(id);
      toast.success('Đã lưu trữ mẫu');
      load();
    } catch {
      toast.error('Không lưu trữ được mẫu');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Mẫu tài liệu</h2>
          <p className="text-sm text-brand-muted">
            Chọn mẫu để nhập thông tin và tạo file Word mới.
          </p>
        </div>
        {isAdmin && (
          <Link
            to="/2025/luatpoip/tai-lieu/templates/new"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-white hover:bg-brand-primaryDark"
          >
            <Plus size={18} /> Tải mẫu mới
          </Link>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <article
            key={template.id}
            className="rounded-2xl border border-brand-line bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary/15 text-brand-primaryDark">
                <FileText size={22} />
              </span>
              <StatusBadge status={template.status} />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{template.name}</h3>
            <p className="mt-1 min-h-[2.5rem] text-sm text-brand-muted">
              {template.description || 'Chưa có mô tả'}
            </p>
            <div className="mt-4 text-xs text-brand-muted">
              {template.fields.length} trường · v{template.version}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {template.status === 'ACTIVE' && (
                <Link
                  to={`/2025/luatpoip/tai-lieu/generate/${template.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-3 py-2 text-sm text-white hover:bg-brand-primaryDark"
                >
                  <Wand2 size={16} /> Tạo hồ sơ
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link
                    to={`/2025/luatpoip/tai-lieu/templates/${template.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand-line px-3 py-2 text-sm hover:bg-brand-surface"
                  >
                    <Edit size={16} /> Sửa key
                  </Link>
                  {template.status !== 'ARCHIVED' && (
                    <button
                      onClick={() => archive(template.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-line px-3 py-2 text-sm hover:bg-brand-surface"
                    >
                      <Archive size={16} /> Lưu trữ
                    </button>
                  )}
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      {!loading && templates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-brand-line bg-white p-10 text-center text-brand-muted">
          Chưa có mẫu tài liệu nào.
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DocumentTemplate['status'] }) {
  const cls =
    status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : status === 'DRAFT'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-gray-100 text-gray-600';
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{status}</span>;
}
