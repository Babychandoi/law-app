import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, MessageCircle, HeartHandshake, UserCog } from 'lucide-react';
import crmService, { CaseFilter } from '../../../../../service/crm';
import { CareAction, CareResult, CareStatus, CaseRow, StaffUser, Tag } from '../../../../../types/crm';
import CarePopup from './CarePopup';

const STATUS_OPTIONS = ['NEW', 'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELED'];
const FOLLOWUP_OPTIONS = [
  { v: '', label: 'Hẹn chăm: tất cả' },
  { v: 'today', label: 'Hôm nay' },
  { v: 'overdue', label: 'Quá hạn' },
  { v: 'next7', label: '7 ngày tới' },
  { v: 'none', label: 'Không có lịch' },
];

export default function CRM() {
  const [rows, setRows] = useState<CaseRow[]>([]);
  const [statuses, setStatuses] = useState<CareStatus[]>([]);
  const [actions, setActions] = useState<CareAction[]>([]);
  const [results, setResults] = useState<CareResult[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [filter, setFilter] = useState<CaseFilter>({ assignedTo: 'me', page: 0, size: 30 });
  const [active, setActive] = useState<CaseRow | null>(null);
  const [loading, setLoading] = useState(false);

  const staffName = useCallback(
    (id: string | null) => (id ? staff.find((s) => s.id === id)?.fullName ?? id.slice(0, 8) : 'Chưa giao'),
    [staff]
  );
  const careStatusName = useCallback(
    (id: number | null) => statuses.find((s) => s.id === id)?.name ?? '—',
    [statuses]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { rows } = await crmService.cases(filter);
      setRows(rows);
    } catch {
      toast.error('Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    crmService.careStatuses().then(setStatuses).catch(() => undefined);
    crmService.careActions().then(setActions).catch(() => undefined);
    crmService.careResults().then(setResults).catch(() => undefined);
    crmService.tags().then(setTags).catch(() => undefined);
    crmService.staff().then(setStaff).catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const assign = async (row: CaseRow, userId: string) => {
    try {
      await crmService.assign(row.id, userId || '');
      toast.success('Đã cập nhật người phụ trách');
      load();
    } catch {
      toast.error('Gán thất bại');
    }
  };

  const tagMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  return (
    <div className="bg-white rounded-xl shadow-soft p-4">
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <HeartHandshake size={20} className="text-amber-500" /> CRM — Chăm sóc khách hàng
      </h2>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-1 border rounded px-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-gray-400" />
          <input
            className="py-2 outline-none flex-1 text-sm"
            placeholder="Tên / email / SĐT..."
            onKeyDown={(e) =>
              e.key === 'Enter' &&
              setFilter((f) => ({ ...f, keyword: (e.target as HTMLInputElement).value, page: 0 }))
            }
          />
        </div>
        <select
          className="border rounded px-2 py-2 text-sm"
          value={filter.assignedTo ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, assignedTo: e.target.value, page: 0 }))}
        >
          <option value="me">Tôi phụ trách</option>
          <option value="none">Chưa có người phụ trách</option>
          <option value="any">Đã có người phụ trách</option>
          <option value="">Tất cả</option>
        </select>
        <select
          className="border rounded px-2 py-2 text-sm"
          value={filter.followUp ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, followUp: e.target.value, page: 0 }))}
        >
          {FOLLOWUP_OPTIONS.map((o) => (
            <option key={o.v} value={o.v}>{o.label}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-2 text-sm"
          value={filter.careStatusId ?? ''}
          onChange={(e) =>
            setFilter((f) => ({
              ...f,
              careStatusId: e.target.value ? Number(e.target.value) : undefined,
              page: 0,
            }))
          }
        >
          <option value="">Trạng thái chăm sóc: tất cả</option>
          {statuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          className="border rounded px-2 py-2 text-sm"
          value={filter.status ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value, page: 0 }))}
        >
          <option value="">Vụ việc: tất cả</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr>
              <th className="py-2">Khách / Dịch vụ</th>
              <th>Phụ trách</th>
              <th>Trạng thái chăm</th>
              <th>Hẹn chăm lại</th>
              <th>Vụ việc</th>
              <th>Tag</th>
              <th>Lần chăm gần nhất</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2">
                  <div className="font-medium">{r.serviceName ?? r.name ?? '—'}</div>
                  <div className="text-xs text-gray-500">{r.customerEmail ?? r.customerPhone}</div>
                </td>
                <td>
                  <select
                    className="border rounded px-1 py-1 text-xs"
                    value={r.assignedUserId ?? ''}
                    onChange={(e) => assign(r, e.target.value)}
                  >
                    <option value="">Chưa giao</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.fullName}</option>
                    ))}
                  </select>
                </td>
                <td>{careStatusName(r.careStatusId)}</td>
                <td className={isOverdue(r.nextFollowUpAt) ? 'text-red-500' : ''}>
                  {r.nextFollowUpAt ? new Date(r.nextFollowUpAt).toLocaleDateString('vi-VN') : '—'}
                </td>
                <td>{r.status ?? '—'}</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {r.tagIds.map((id) => {
                      const t = tagMap.get(id);
                      return t ? (
                        <span
                          key={id}
                          className="px-1.5 rounded-full text-[10px] text-white"
                          style={{ background: t.color }}
                        >
                          {t.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </td>
                <td>{r.lastCaredAt ? new Date(r.lastCaredAt).toLocaleDateString('vi-VN') : '—'}</td>
                <td>
                  <button
                    onClick={() => setActive(r)}
                    className="p-1.5 rounded hover:bg-amber-100 text-amber-600"
                    title="Chăm sóc"
                  >
                    <HeartHandshake size={16} />
                  </button>
                  <a
                    href="/2025/luatpoip/admin/team-chat"
                    className="p-1.5 rounded hover:bg-blue-100 text-blue-600 inline-block"
                    title="Chat nội bộ"
                  >
                    <MessageCircle size={16} />
                  </a>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  <UserCog className="mx-auto mb-2" /> Không có vụ việc nào khớp bộ lọc
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <CarePopup
          caseRow={active}
          actions={actions}
          results={results}
          statuses={statuses}
          tags={tags}
          staffName={staffName}
          onClose={() => setActive(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function isOverdue(d: string | null): boolean {
  return !!d && new Date(d).getTime() < Date.now();
}
