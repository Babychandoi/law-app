import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ScrollText, User } from 'lucide-react';
import { getAuditLogs, type AuditLog as AuditLogRow } from '../../../../service/admin';
import { Card, DataTable, PageHeader, Badge, type Column } from '../../../../component/common/ui';

// Nhãn tiếng Việt + màu cho từng loại hành động.
const ACTION_META: Record<
  string,
  { label: string; color: 'gold' | 'green' | 'red' | 'blue' | 'gray' }
> = {
  USER_ROLE_CHANGED: { label: 'Đổi vai trò', color: 'blue' },
  USER_ACTIVE_CHANGED: { label: 'Đổi trạng thái tài khoản', color: 'gold' },
  CUSTOMER_STATUS_CHANGED: { label: 'Đổi trạng thái hồ sơ', color: 'gold' },
  NEWS_CREATED: { label: 'Tạo bài viết', color: 'green' },
  NEWS_UPDATED: { label: 'Sửa bài viết', color: 'blue' },
  NEWS_DELETED: { label: 'Xóa bài viết', color: 'red' },
  SUBSCRIBER_DELETED: { label: 'Xóa người đăng ký', color: 'red' },
  SERVICE_CREATED: { label: 'Tạo dịch vụ', color: 'green' },
};

const TARGET_LABEL: Record<string, string> = {
  USER: 'Người dùng',
  CUSTOMER: 'Khách hàng',
  NEWS: 'Bài viết',
  SUBSCRIBER: 'Người đăng ký',
  SERVICE: 'Dịch vụ',
};

const PAGE_SIZE = 20;

const AuditLogPage: React.FC = () => {
  const [rows, setRows] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [action, setAction] = useState(() => searchParams.get('action') ?? '');
  const [targetType, setTargetType] = useState(() => searchParams.get('targetType') ?? '');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // state -> URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        page > 1 ? next.set('page', String(page)) : next.delete('page');
        q ? next.set('q', q) : next.delete('q');
        action ? next.set('action', action) : next.delete('action');
        targetType ? next.set('targetType', targetType) : next.delete('targetType');
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, q, action, targetType]);

  // URL -> state (back/forward)
  useEffect(() => {
    const p = Math.max(1, Number(searchParams.get('page')) || 1);
    setPage((prev) => (prev !== p ? p : prev));
    setQ((prev) => {
      const v = searchParams.get('q') ?? '';
      return prev !== v ? v : prev;
    });
    setAction((prev) => {
      const v = searchParams.get('action') ?? '';
      return prev !== v ? v : prev;
    });
    setTargetType((prev) => {
      const v = searchParams.get('targetType') ?? '';
      return prev !== v ? v : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAuditLogs({
        page: page - 1,
        size: PAGE_SIZE,
        q: q || undefined,
        action: action || undefined,
        targetType: targetType || undefined,
      });
      if (res.code === 200) {
        setRows(res.data);
        setTotalPages(res.meta?.totalPages ?? 1);
        setTotalElements(res.meta?.totalElements ?? res.data.length);
      }
    } catch {
      toast.error('Không tải được nhật ký kiểm toán');
    } finally {
      setLoading(false);
    }
  }, [page, q, action, targetType]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const fmt = (iso: string) => new Date(iso).toLocaleString('vi-VN');

  const columns: Column<AuditLogRow>[] = [
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (r) => <span className="whitespace-nowrap text-gray-600">{fmt(r.createdAt)}</span>,
    },
    {
      key: 'actor',
      header: 'Người thực hiện',
      render: (r) => (
        <span className="inline-flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" aria-hidden="true" />
          <span className="font-medium text-brand-ink">{r.actorUsername ?? 'Hệ thống'}</span>
          {r.actorRole && <span className="text-xs text-gray-400">({r.actorRole})</span>}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (r) => {
        const m = ACTION_META[r.action];
        return m ? <Badge color={m.color}>{m.label}</Badge> : <Badge>{r.action}</Badge>;
      },
    },
    {
      key: 'target',
      header: 'Đối tượng',
      render: (r) => (
        <span className="text-sm text-gray-700">
          {r.targetType ? (TARGET_LABEL[r.targetType] ?? r.targetType) : '—'}
          {r.targetId && <span className="ml-1 text-xs text-gray-400">#{r.targetId}</span>}
        </span>
      ),
    },
    {
      key: 'summary',
      header: 'Chi tiết',
      render: (r) => <span className="text-sm text-gray-700">{r.summary ?? '—'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <PageHeader
          icon={ScrollText}
          title="Nhật ký kiểm toán"
          subtitle={`Tổng số: ${totalElements} bản ghi — ghi lại ai đã làm gì, lúc nào`}
          breadcrumb={[{ label: 'Quản trị hệ thống' }, { label: 'Nhật ký kiểm toán' }]}
        />
      </Card>

      <Card bodyClassName="p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          <select
            aria-label="Lọc theo loại đối tượng"
            className="rounded-lg border border-brand-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
            value={targetType}
            onChange={(e) => {
              setTargetType(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Đối tượng: tất cả</option>
            {Object.entries(TARGET_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Lọc theo hành động"
            className="rounded-lg border border-brand-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-gold"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Hành động: tất cả</option>
            {Object.entries(ACTION_META).map(([v, m]) => (
              <option key={v} value={v}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={rows}
          rowKey={(r) => r.id}
          loading={loading}
          tableId="audit-logs"
          searchable
          searchPlaceholder="Tìm theo người thực hiện, mô tả, mã đối tượng..."
          searchValue={q}
          onSearch={(v) => {
            setQ(v);
            setPage(1);
          }}
          serverPagination={{ page, totalPages, totalElements, onPageChange: setPage }}
          emptyIcon={ScrollText}
          emptyTitle="Chưa có bản ghi nào"
          emptyDescription="Nhật ký sẽ ghi lại các thao tác nhạy cảm của quản trị viên."
        />
      </Card>
    </div>
  );
};

export default AuditLogPage;
