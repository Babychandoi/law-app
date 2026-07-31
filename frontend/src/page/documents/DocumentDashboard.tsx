import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Files, Layers, RefreshCw, Sparkles } from 'lucide-react';
import documentTemplateService from '../../service/documentTemplates';
import { DocumentStats } from '../../types/documentTemplate';
import Spinner from '../../component/common/ui/Spinner';

const DOCUMENT_BASE = '/2025/luatpoip/tai-lieu';

const TEMPLATE_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  ACTIVE: 'Đang dùng',
  ARCHIVED: 'Lưu trữ',
};
const WORKFLOW_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Nháp',
  IN_REVIEW: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  FINAL: 'Hoàn tất',
  REJECTED: 'Từ chối',
  VOID: 'Đã hủy',
};

export default function DocumentDashboard() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await documentTemplateService.getStats());
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Không tải được thống kê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white">
        <Spinner center label="Đang tải thống kê tài liệu" />
      </div>
    );
  }
  if (error || !stats) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p>{error || 'Không có dữ liệu.'}</p>
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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon={<FileText size={20} aria-hidden="true" />}
          label="Biểu mẫu"
          value={stats.templatesTotal}
          hint={`${stats.templatesByStatus.ACTIVE ?? 0} đang dùng`}
        />
        <KpiCard
          icon={<Files size={20} aria-hidden="true" />}
          label="Tài liệu đã tạo"
          value={stats.generatedTotal}
        />
        <KpiCard
          icon={<Sparkles size={20} aria-hidden="true" />}
          label="Tạo trong 30 ngày"
          value={stats.generatedLast30Days}
        />
        <KpiCard
          icon={<Layers size={20} aria-hidden="true" />}
          label="Bộ mẫu đang dùng"
          value={stats.bundlesActive}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatusBreakdown
          title="Biểu mẫu theo trạng thái"
          data={stats.templatesByStatus}
          labels={TEMPLATE_STATUS_LABELS}
        />
        <StatusBreakdown
          title="Tài liệu theo trạng thái duyệt"
          data={stats.generatedByStatus}
          labels={WORKFLOW_STATUS_LABELS}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to={DOCUMENT_BASE}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white hover:bg-brand-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
        >
          <FileText size={16} aria-hidden="true" /> Xem biểu mẫu
        </Link>
        <Link
          to={`${DOCUMENT_BASE}/generated`}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-goldDark"
        >
          <Files size={16} aria-hidden="true" /> Tài liệu đã tạo
        </Link>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-brand-goldDark">{icon}</div>
      <p className="mt-3 text-3xl font-semibold text-gray-900">{value.toLocaleString('vi-VN')}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

function StatusBreakdown({
  title,
  data,
  labels,
}: {
  title: string;
  data: Record<string, number>;
  labels: Record<string, string>;
}) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const entries = Object.entries(data).filter(([, count]) => count > 0);
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      {entries.length === 0 ? (
        <p className="mt-3 text-sm italic text-gray-500">Chưa có dữ liệu.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {entries.map(([status, count]) => (
            <li key={status}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{labels[status] ?? status}</span>
                <span className="font-medium text-gray-900">{count.toLocaleString('vi-VN')}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-brand-gold"
                  style={{ width: total ? `${Math.round((count / total) * 100)}%` : '0%' }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
