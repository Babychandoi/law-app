import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Search, HeartHandshake, UserCog } from 'lucide-react';
import crmService, { CaseFilter } from '../../../../../service/crm';
import { getMe } from '../../../../../service/auth';
import { CASE_STATUS_VI, CASE_STATUS_OPTIONS, caseStatusLabel } from './caseStatus';
import {
  CareAction,
  CareResult,
  CareStatus,
  CaseRow,
  StaffUser,
  Tag,
} from '../../../../../types/crm';
import CarePopup from './CarePopup';

const STATUS_OPTIONS = CASE_STATUS_OPTIONS;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [me, setMe] = useState<string>('');

  const staffLabel = useCallback(
    (s: StaffUser) => s.fullName || s.username || s.id.slice(0, 8),
    []
  );
  const staffName = useCallback(
    (id: string | null) => {
      if (!id) return 'Chưa giao';
      const s = staff.find((x) => x.id === id);
      return s ? staffLabel(s) : id.slice(0, 8);
    },
    [staff, staffLabel]
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
    getMe().then((u) => {
      const admin = u?.role === 'ADMIN';
      setIsAdmin(admin);
      setMe(u?.id ?? '');
      // Admin nhìn tất cả mặc định; nhân viên chỉ thấy việc của mình.
      setFilter((f) => ({ ...f, assignedTo: admin ? '' : 'me' }));
    });
    crmService
      .careStatuses()
      .then(setStatuses)
      .catch(() => undefined);
    crmService
      .careActions()
      .then(setActions)
      .catch(() => undefined);
    crmService
      .careResults()
      .then(setResults)
      .catch(() => undefined);
    crmService
      .tags()
      .then(setTags)
      .catch(() => undefined);
    // Chỉ admin cần danh bạ để giao việc.
    crmService
      .staff()
      .then(setStaff)
      .catch(() => undefined);
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

  // Đổi trạng thái vụ việc tại chỗ (admin hoặc người phụ trách).
  const canChangeStatus = (row: CaseRow) => isAdmin || row.assignedUserId === me;
  const changeStatus = async (row: CaseRow, status: string) => {
    if (status === row.status) return;
    try {
      await crmService.changeStatus(row.id, status);
      toast.success('Đã đổi trạng thái vụ việc');
      load();
    } catch {
      toast.error('Đổi trạng thái thất bại');
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
        {[
          // Bộ lọc người phụ trách chỉ dành cho admin; nhân viên luôn chỉ thấy việc của mình.
          ...(isAdmin
            ? [
                {
                  val: filter.assignedTo ?? '',
                  set: (v: string) => setFilter((f) => ({ ...f, assignedTo: v, page: 0 })),
                  opts: [
                    { v: '', label: 'Tất cả' },
                    { v: 'me', label: 'Tôi phụ trách' },
                    { v: 'none', label: 'Chưa có người phụ trách' },
                    { v: 'any', label: 'Đã có người phụ trách' },
                  ],
                },
              ]
            : []),
          {
            val: filter.followUp ?? '',
            set: (v: string) => setFilter((f) => ({ ...f, followUp: v, page: 0 })),
            opts: FOLLOWUP_OPTIONS.map((o) => ({ v: o.v, label: o.label })),
          },
        ].map((sel, i) => (
          <select
            key={i}
            aria-label="Bộ lọc CRM"
            className="border border-brand-line rounded-lg px-3 py-2 text-sm bg-white focus:border-brand-gold outline-none"
            value={sel.val}
            onChange={(e) => sel.set(e.target.value)}
          >
            {sel.opts.map((o) => (
              <option key={o.v} value={o.v}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <select
          className="border border-brand-line rounded-lg px-3 py-2 text-sm bg-white focus:border-brand-gold outline-none"
          aria-label="Lọc theo trạng thái chăm sóc"
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
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          className="border border-brand-line rounded-lg px-3 py-2 text-sm bg-white focus:border-brand-gold outline-none"
          aria-label="Lọc theo trạng thái vụ việc"
          value={filter.status ?? ''}
          onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value, page: 0 }))}
        >
          <option value="">Vụ việc: tất cả</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {CASE_STATUS_VI[s]?.label ?? s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-brand-line">
        <table className="w-full text-sm">
          <thead className="bg-brand-surface/60 text-left text-brand-muted">
            <tr>
              <th className="py-3 px-4 font-medium">Khách / Dịch vụ</th>
              <th className="px-3 font-medium">Phụ trách</th>
              <th className="px-3 font-medium">Trạng thái chăm</th>
              <th className="px-3 font-medium">Hẹn chăm lại</th>
              <th className="px-3 font-medium">Vụ việc</th>
              <th className="px-3 font-medium">Tag</th>
              <th className="px-3 font-medium">Lần chăm gần nhất</th>
              <th className="px-3 font-medium text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const cs = statuses.find((s) => s.id === r.careStatusId);
              return (
                <tr
                  key={r.id}
                  className="border-t border-brand-line hover:bg-brand-surface/40 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-full bg-brand-gold/15 text-brand-goldDark grid place-items-center font-semibold shrink-0">
                        {(r.serviceName ?? r.name ?? '?').charAt(0)}
                      </span>
                      <div>
                        <div className="font-medium text-brand-ink">
                          {r.serviceName ?? r.name ?? '—'}
                        </div>
                        <div className="text-xs text-brand-muted">
                          {r.customerEmail ?? r.customerPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    {isAdmin ? (
                      <select
                        className="border border-brand-line rounded-lg px-2 py-1.5 text-xs bg-white max-w-[140px] focus:border-brand-gold outline-none"
                        aria-label="Gán nhân viên phụ trách"
                        value={r.assignedUserId ?? ''}
                        onChange={(e) => assign(r, e.target.value)}
                      >
                        <option value="">Chưa giao</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {staffLabel(s)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-brand-ink">{staffName(r.assignedUserId)}</span>
                    )}
                  </td>
                  <td className="px-3">
                    {cs ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ background: cs.color || '#9CA3AF' }}
                      >
                        {cs.name}
                      </span>
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </td>
                  <td className="px-3">
                    {r.nextFollowUpAt ? (
                      <span
                        className={
                          isOverdue(r.nextFollowUpAt)
                            ? 'text-red-500 font-medium'
                            : 'text-brand-ink'
                        }
                      >
                        {new Date(r.nextFollowUpAt).toLocaleDateString('vi-VN')}
                      </span>
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </td>
                  <td className="px-3">
                    {canChangeStatus(r) ? (
                      // Click để đổi trạng thái vụ việc ngay (badge màu, là 1 select ẩn viền).
                      <select
                        aria-label="Đổi trạng thái vụ việc"
                        value={r.status ?? ''}
                        onChange={(e) => changeStatus(r, e.target.value)}
                        title="Đổi trạng thái vụ việc"
                        className={`appearance-none cursor-pointer px-2 py-0.5 rounded text-xs font-medium border-0 outline-none ${
                          CASE_STATUS_VI[r.status ?? '']?.cls ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {CASE_STATUS_VI[s]?.label ?? s}
                          </option>
                        ))}
                      </select>
                    ) : r.status ? (
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          CASE_STATUS_VI[r.status]?.cls ?? 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {caseStatusLabel(r.status)}
                      </span>
                    ) : (
                      <span className="text-brand-muted">—</span>
                    )}
                  </td>
                  <td className="px-3">
                    <div className="flex flex-wrap gap-1">
                      {r.tagIds.map((id) => {
                        const t = tagMap.get(id);
                        return t ? (
                          <span
                            key={id}
                            className="px-2 py-0.5 rounded-full text-[10px] text-white"
                            style={{ background: t.color }}
                          >
                            {t.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-3 text-brand-muted">
                    {r.lastCaredAt ? new Date(r.lastCaredAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-3 text-right">
                    <button
                      onClick={() => setActive(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold text-white text-xs font-medium hover:bg-brand-goldDark transition-colors"
                    >
                      <HeartHandshake size={14} /> Chăm sóc
                    </button>
                  </td>
                </tr>
              );
            })}
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
