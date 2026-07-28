import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BarChart3, Activity } from 'lucide-react';
import { getAuditStats, type AuditStats } from '../../../../service/admin';
import { Card, PageHeader, Spinner } from '../../../../component/common/ui';

// Nhãn tiếng Việt cho từng loại hành động (đồng bộ với trang Nhật ký kiểm toán).
const ACTION_LABEL: Record<string, string> = {
  USER_ROLE_CHANGED: 'Đổi vai trò',
  USER_ACTIVE_CHANGED: 'Đổi trạng thái tài khoản',
  CUSTOMER_STATUS_CHANGED: 'Đổi trạng thái hồ sơ',
  NEWS_CREATED: 'Tạo bài viết',
  NEWS_UPDATED: 'Sửa bài viết',
  NEWS_DELETED: 'Xóa bài viết',
  NEWS_RESTORED: 'Khôi phục bài viết',
  SUBSCRIBER_DELETED: 'Xóa người đăng ký',
  SERVICE_CREATED: 'Tạo dịch vụ',
};

const RANGES = [
  { v: 7, label: '7 ngày' },
  { v: 30, label: '30 ngày' },
  { v: 90, label: '90 ngày' },
];

const AuditAnalytics: React.FC = () => {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditStats(days);
      if (res.code === 200) setStats(res.data);
    } catch {
      toast.error('Không tải được thống kê hoạt động');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const maxDay = Math.max(1, ...(stats?.byDay.map((d) => d.count) ?? [1]));
  const maxAction = Math.max(1, ...(stats?.byAction.map((a) => a.count) ?? [1]));

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader
          icon={BarChart3}
          title="Thống kê hoạt động"
          subtitle="Tổng hợp các thao tác quản trị quan trọng theo thời gian (từ nhật ký kiểm toán)"
          breadcrumb={[{ label: 'Quản trị hệ thống' }, { label: 'Thống kê hoạt động' }]}
          actions={
            <div className="flex items-center gap-1 rounded-lg border border-brand-line p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setDays(r.v)}
                  aria-pressed={days === r.v}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    days === r.v
                      ? 'bg-brand-surface text-brand-goldDark font-medium'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          }
        />
      </Card>

      {loading ? (
        <Card>
          <Spinner center />
        </Card>
      ) : (
        <>
          {/* KPI tổng */}
          <Card bodyClassName="p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-surface text-brand-goldDark">
                <Activity size={22} aria-hidden="true" />
              </span>
              <div>
                <div className="text-2xl font-bold text-brand-ink">{stats?.total ?? 0}</div>
                <div className="text-sm text-gray-500">thao tác trong {days} ngày qua</div>
              </div>
            </div>
          </Card>

          {/* Biểu đồ theo ngày */}
          <Card bodyClassName="p-5">
            <h3 className="mb-4 text-sm font-semibold text-brand-ink">Hoạt động theo ngày</h3>
            {!stats?.byDay.length ? (
              <p className="py-6 text-center text-sm text-gray-500">Chưa có dữ liệu.</p>
            ) : (
              <div className="flex items-end gap-1 overflow-x-auto" style={{ minHeight: 140 }}>
                {stats.byDay.map((d) => {
                  const h = Math.round((d.count / maxDay) * 120) + 2;
                  const [, m, day] = d.day.split('-');
                  return (
                    <div
                      key={d.day}
                      className="flex min-w-[16px] flex-1 flex-col items-center justify-end gap-1"
                      title={`${d.day}: ${d.count} thao tác`}
                    >
                      <span className="text-[10px] text-gray-500">{d.count}</span>
                      <div
                        className="w-full rounded-t bg-brand-gold"
                        style={{ height: h }}
                        aria-hidden="true"
                      />
                      <span className="text-[10px] text-gray-400">
                        {day}/{m}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Theo loại hành động */}
          <Card bodyClassName="p-5">
            <h3 className="mb-4 text-sm font-semibold text-brand-ink">Theo loại thao tác</h3>
            {!stats?.byAction.length ? (
              <p className="py-6 text-center text-sm text-gray-500">Chưa có dữ liệu.</p>
            ) : (
              <ul className="space-y-2">
                {stats.byAction.map((a) => (
                  <li key={a.action} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-sm text-gray-700">
                      {ACTION_LABEL[a.action] ?? a.action}
                    </span>
                    <div className="h-4 flex-1 rounded bg-gray-100">
                      <div
                        className="h-4 rounded bg-brand-goldDark"
                        style={{ width: `${Math.round((a.count / maxAction) * 100)}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-medium text-brand-ink">
                      {a.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default AuditAnalytics;
