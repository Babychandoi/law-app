import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Loader2,
  MessageSquare,
  FileClock,
  Briefcase,
  Newspaper,
  Cog,
  AlertCircle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getCustomers } from '../../../../service/admin';
import chatService from '../../../../service/chat';
import { getMe, MeResponse } from '../../../../service/auth';
import type { Customer } from '../../../../types/admin';

const BASE = '/2025/luatpoip/admin';

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  to: string;
  accent: string;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [counts, setCounts] = useState({ newLead: 0, pending: 0, total: 0 });
  const [recent, setRecent] = useState<Customer[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const user = await getMe();
        // Đếm CHÍNH XÁC toàn hệ thống qua meta.totalElements (không dùng .length của trang đầu).
        const countOf = async (status?: string) =>
          (await getCustomers({ page: 0, size: 1, status })).meta?.totalElements ?? 0;
        const [total, newLead, received, processing, recentRes, stats] = await Promise.all([
          countOf(),
          countOf('NEW'),
          countOf('RECEIVED'),
          countOf('PROCESSING'),
          getCustomers({ page: 0, size: 6 }),
          user ? chatService.fetchStats(user.id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setMe(user);
        setCounts({ total, newLead, pending: received + processing });
        setRecent(Array.isArray(recentRes.data) ? recentRes.data : []);
        setUnread(stats?.unreadConversations ?? 0);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats: Stat[] = [
    {
      label: 'Lead mới',
      value: counts.newLead,
      icon: UserPlus,
      to: `${BASE}/customers`,
      accent: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Hồ sơ đang xử lý',
      value: counts.pending,
      icon: FileClock,
      to: `${BASE}/customers`,
      accent: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Tin nhắn chưa đọc',
      value: unread,
      icon: MessageSquare,
      to: `${BASE}/chats`,
      accent: 'text-sky-600 bg-sky-50',
    },
    {
      label: 'Tổng khách hàng',
      value: counts.total,
      icon: Users,
      to: `${BASE}/customers`,
      accent: 'text-brand-goldDark bg-brand-surface',
    },
  ];

  const quickActions = [
    { label: 'Khách hàng', to: `${BASE}/customers`, icon: Users },
    { label: 'CRM chăm sóc', to: `${BASE}/crm`, icon: Briefcase },
    { label: 'Chat khách', to: `${BASE}/chats`, icon: MessageSquare },
    { label: 'Chat nội bộ', to: `${BASE}/team-chat`, icon: Newspaper },
    ...(me?.role === 'ADMIN'
      ? [{ label: 'Quản trị hệ thống', to: '/2025/luatpoip/he-thong', icon: Cog }]
      : []),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Page header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tổng quan</h1>
        <p className="mt-1 text-sm text-gray-500">
          {me?.fullName ? `Xin chào ${me.fullName}. ` : ''}Đây là tình hình công việc hôm nay.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} aria-hidden="true" />
          Không tải được một phần dữ liệu. Vui lòng thử tải lại trang.
        </div>
      )}

      {/* KPI */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-goldDark/40 hover:shadow"
          >
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.accent}`}
              >
                <s.icon size={20} aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold text-gray-800">{s.value}</p>
            <p className="mt-1 text-sm text-gray-500">{s.label}</p>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent customers */}
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Khách hàng gần đây</h2>
            <Link
              to={`${BASE}/customers`}
              className="text-sm font-medium text-brand-goldDark hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              Chưa có khách hàng nào.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-800">{c.name || 'Khách'}</p>
                    <p className="truncate text-xs text-gray-500">
                      {c.serviceName || '—'} · {c.phone || c.email || ''}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick actions */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Truy cập nhanh</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5">
            {quickActions.map((a) => (
              <Link
                key={a.to}
                to={a.to}
                className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 px-3 py-4 text-center text-sm text-gray-600 transition hover:border-brand-goldDark/40 hover:bg-brand-surface hover:text-brand-goldDark"
              >
                <a.icon size={22} aria-hidden="true" />
                {a.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Customer['status'] }) {
  const map: Record<Customer['status'], { label: string; cls: string }> = {
    NEW: { label: 'Mới', cls: 'bg-emerald-50 text-emerald-700' },
    RECEIVED: { label: 'Đã nhận', cls: 'bg-sky-50 text-sky-700' },
    PROCESSING: { label: 'Đang xử lý', cls: 'bg-amber-50 text-amber-700' },
    COMPLETED: { label: 'Hoàn tất', cls: 'bg-gray-100 text-gray-600' },
    CANCELED: { label: 'Đã huỷ', cls: 'bg-red-50 text-red-600' },
  };
  const s = map[status] ?? map.NEW;
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}
