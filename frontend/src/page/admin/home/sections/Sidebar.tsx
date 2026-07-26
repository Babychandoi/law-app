import {
  X,
  LayoutDashboard,
  Users,
  UserCog,
  Newspaper,
  Briefcase,
  Mail,
  MessageSquare,
  MessagesSquare,
  HeartHandshake,
  SlidersHorizontal,
  Puzzle,
  type LucideIcon,
} from 'lucide-react';
import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { getMe } from '../../../../service/auth';

const BASE = '/2025/luatpoip/admin';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  onlyAdmin?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    title: 'Tổng quan',
    items: [{ label: 'Trang chủ', path: BASE, icon: LayoutDashboard, end: true }],
  },
  {
    title: 'Khách hàng & CRM',
    items: [
      { label: 'Khách hàng', path: `${BASE}/customers`, icon: Users },
      { label: 'CRM chăm sóc', path: `${BASE}/crm`, icon: HeartHandshake },
      {
        label: 'Cấu hình CRM',
        path: `${BASE}/crm/config`,
        icon: SlidersHorizontal,
        onlyAdmin: true,
      },
    ],
  },
  {
    title: 'Dịch vụ & nội dung',
    items: [
      { label: 'Dịch vụ', path: `${BASE}/services`, icon: Puzzle, onlyAdmin: true },
      { label: 'Bài viết', path: `${BASE}/posts`, icon: Newspaper },
    ],
  },
  {
    title: 'Giao tiếp',
    items: [
      { label: 'Chat khách', path: `${BASE}/chats`, icon: MessageSquare, onlyAdmin: true },
      { label: 'Chat nội bộ', path: `${BASE}/team-chat`, icon: MessagesSquare },
      { label: 'Người đăng ký', path: `${BASE}/subscribers`, icon: Mail, onlyAdmin: true },
    ],
  },
  {
    title: 'Tuyển dụng',
    items: [{ label: 'Ứng viên', path: `${BASE}/applications`, icon: Briefcase, onlyAdmin: true }],
  },
  {
    title: 'Quản trị hệ thống',
    items: [{ label: 'Nhân viên', path: `${BASE}/employees`, icon: UserCog, onlyAdmin: true }],
  },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold',
    isActive
      ? 'bg-brand-gold/20 text-brand-gold'
      : 'text-white/70 hover:bg-white/10 hover:text-white',
  ].join(' ');

/** Nội dung điều hướng dùng chung cho cả sidebar desktop và drawer mobile. */
function NavContent({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4" aria-label="Điều hướng quản trị">
      {GROUPS.map((group) => {
        const items = group.items.filter((i) => !i.onlyAdmin || isAdmin);
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/40">
              {group.title}
            </p>
            <div className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onNavigate}
                  className={linkClass}
                >
                  <item.icon size={18} aria-hidden="true" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

const Sidebar: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ sidebarOpen, setSidebarOpen }) => {
  const [isAdmin, setIsAdmin] = React.useState(false);

  useEffect(() => {
    getMe().then((me) => setIsAdmin(me?.role === 'ADMIN'));
  }, []);

  // Đóng drawer mobile bằng Escape.
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen, setSidebarOpen]);

  const brand = (
    <div className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-5">
      <span className="text-lg font-bold text-white">Luật Poip</span>
      <span className="rounded bg-brand-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold">
        Admin
      </span>
    </div>
  );

  return (
    <>
      {/* Desktop: sidebar cố định, là flex child (không overlay) */}
      <aside className="hidden w-60 shrink-0 flex-col bg-brand-ink lg:flex">
        {brand}
        <NavContent isAdmin={isAdmin} />
      </aside>

      {/* Mobile: drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-brand-ink shadow-xl transition-transform duration-300 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu quản trị"
        aria-hidden={!sidebarOpen}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">Luật Poip</span>
            <span className="rounded bg-brand-gold/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-gold">
              Admin
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white"
            aria-label="Đóng menu"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <NavContent isAdmin={isAdmin} onNavigate={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
};

export default Sidebar;
