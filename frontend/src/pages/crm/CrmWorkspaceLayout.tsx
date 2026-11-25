import React, { useEffect, useMemo, useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useOutletContext,
} from 'react-router-dom';
import {
  Building2,
  FileSignature,
  FolderKanban,
  HeartHandshake,
  LayoutGrid,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Target,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import CommandPalette from '../../component/common/CommandPalette';
import Spinner from '../../component/common/ui/Spinner';
import {
  ADMIN_BASE,
  OPERATIONS_GROUPS,
  SYS_BASE,
  SYSTEM_GROUPS,
  type NavGroup,
} from '../../page/admin/home/navConfig';
import { getMe, logout, type MeResponse } from '../../service/auth';
import { tryRefreshToken } from '../../service/axiosClient';
import crmEnterpriseApi from '../../features/crm/api';
import '../../features/crm/crm.css';
import type { StaffUser } from '../../features/crm/types';

export const CRM_BASE = '/2025/luatpoip/crm';
const SIDEBAR_STORAGE_KEY = 'luatpoip.crm.sidebarCollapsed';
const PROACTIVE_REFRESH_MS = 10 * 60 * 1000;

export interface CrmWorkspaceContextValue {
  me: MeResponse | null;
  isAdmin: boolean;
  staffList: StaffUser[];
}

export function useCrmWorkspace(): CrmWorkspaceContextValue {
  const ctx = useOutletContext<CrmWorkspaceContextValue | undefined>();
  return (
    ctx ?? {
      me: null,
      isAdmin: false,
      staffList: [],
    }
  );
}

interface CrmModuleNavItem {
  key: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export const CRM_MODULE_ITEMS: CrmModuleNavItem[] = [
  { key: 'lead', label: 'KH Liên hệ', path: `${CRM_BASE}/lead`, icon: Users },
  { key: 'account', label: 'Khách hàng', path: `${CRM_BASE}/account`, icon: Building2 },
  { key: 'opportunity', label: 'Cơ hội HĐ', path: `${CRM_BASE}/opportunity`, icon: Target },
  { key: 'sale-order', label: 'Hợp đồng', path: `${CRM_BASE}/sale-order`, icon: FileSignature },
];

export default function CrmWorkspaceLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return raw === null ? true : raw === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    let active = true;
    getMe(true)
      .then((user) => {
        if (!active) return;
        if (!user) {
          navigate('/2025/luatpoip/admin/login', { replace: true });
          return;
        }
        setMe(user);
        crmEnterpriseApi
          .listStaff()
          .then((users) => {
            if (active) setStaffList(users);
          })
          .catch(() => {
            if (active) setStaffList([]);
          });
      })
      .finally(() => {
        if (active) setReady(true);
      });

    const timer = setInterval(() => {
      tryRefreshToken();
    }, PROACTIVE_REFRESH_MS);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [navigate]);

  useEffect(() => {
    const p = location.pathname;
    const moduleTitle = p.includes('/crm/lead')
      ? 'KH Liên hệ'
      : p.includes('/crm/account')
        ? 'Khách hàng 360°'
        : p.includes('/crm/opportunity')
          ? 'Cơ hội HĐ'
          : 'Hợp đồng';
    document.title = `${moduleTitle} - CRM Luật Poip Legal`;
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      } catch {
        // Ignore storage error
      }
      return next;
    });
  };

  const isAdmin = me?.role === 'ADMIN';

  const commandGroups = useMemo<NavGroup[]>(() => {
    const crmGroup: NavGroup = {
      title: 'Phân hệ CRM',
      items: CRM_MODULE_ITEMS.map((m) => ({
        label: m.label,
        path: m.path,
        icon: m.icon,
      })),
    };
    return isAdmin
      ? [crmGroup, ...OPERATIONS_GROUPS, ...SYSTEM_GROUPS]
      : [crmGroup, ...OPERATIONS_GROUPS];
  }, [isAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/2025/luatpoip/admin/login', { replace: true });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface">
        <Spinner label="Đang khởi tạo không gian CRM" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface">
        <Spinner label="Đang chuyển đến trang đăng nhập" />
      </div>
    );
  }

  const renderSidebarLinks = (isCollapsedView: boolean, onSelect?: () => void) => (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto py-2.5">
      <nav aria-label="4 phân hệ CRM cốt lõi" className="space-y-1 px-2">
        {CRM_MODULE_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onSelect}
              title={isCollapsedView ? item.label : undefined}
              aria-label={item.label}
              className={({ isActive }) =>
                `flex items-center rounded-lg text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
                  isCollapsedView
                    ? 'flex-col justify-center gap-1 px-1 py-2.5 text-center'
                    : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="shrink-0" aria-hidden="true" />
              <span className={isCollapsedView ? 'text-[10px] leading-tight' : 'truncate text-sm'}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-4 space-y-1 border-t border-white/15 px-2 pt-2.5">
        <Link
          to={`${ADMIN_BASE}/crm`}
          onClick={onSelect}
          title={isCollapsedView ? 'Chăm sóc vụ việc' : undefined}
          aria-label="Chăm sóc vụ việc"
          className={`flex items-center rounded-lg text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
            isCollapsedView ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <HeartHandshake size={17} className="shrink-0" aria-hidden="true" />
          {!isCollapsedView && <span className="truncate">Chăm sóc vụ việc</span>}
        </Link>

        <Link
          to="/2025/luatpoip/tai-lieu"
          onClick={onSelect}
          title={isCollapsedView ? 'Tài liệu pháp lý' : undefined}
          aria-label="Tài liệu pháp lý"
          className={`flex items-center rounded-lg text-xs font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
            isCollapsedView ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
          }`}
        >
          <FolderKanban size={17} className="shrink-0" aria-hidden="true" />
          {!isCollapsedView && <span className="truncate">Tài liệu pháp lý</span>}
        </Link>

        {!onSelect && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            title={collapsed ? 'Mở rộng' : 'Thu gọn'}
            className={`flex w-full items-center rounded-lg text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent ${
              isCollapsedView ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} className="shrink-0" aria-hidden="true" />
            ) : (
              <PanelLeftClose size={17} className="shrink-0" aria-hidden="true" />
            )}
            {!isCollapsedView && <span>Thu gọn</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="crm-workspace flex h-screen flex-col overflow-hidden bg-brand-surface text-brand-ink">
      <CommandPalette groups={commandGroups} />

      {/* Top Global Header (48px) */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-brand-line bg-white px-3 sm:px-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu CRM"
            className="rounded-md p-1.5 text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary lg:hidden"
          >
            <Menu size={18} aria-hidden="true" />
          </button>

          <Link
            to={ADMIN_BASE}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-line bg-brand-surface px-2.5 py-1 text-xs font-semibold text-brand-ink hover:border-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <LayoutGrid size={14} className="text-brand-primary" aria-hidden="true" />
            <span>Vận hành</span>
          </Link>

          <div className="flex items-center gap-1.5 pl-1">
            <span className="text-sm font-bold text-brand-ink">Luật Poip</span>
            <span className="rounded bg-brand-accentSoft px-1.5 py-0.5 text-[11px] font-bold text-brand-ink">
              CRM
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
            aria-label="Mở bảng lệnh tìm kiếm nhanh Ctrl+K"
            className="inline-flex h-8 items-center gap-2 rounded-md border border-brand-line bg-brand-surface px-2.5 text-xs text-brand-muted hover:border-brand-primary hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Search size={14} aria-hidden="true" />
            <span className="hidden md:inline">Chuyển nhanh phân hệ...</span>
            <kbd className="hidden rounded border border-brand-line bg-white px-1.5 py-0.5 text-[10px] font-semibold text-brand-muted sm:inline">
              Ctrl+K
            </kbd>
          </button>

          <Link
            to="/2025/luatpoip/tai-lieu"
            className="hidden h-8 items-center gap-1.5 rounded-md border border-brand-line bg-white px-2.5 text-xs font-medium text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary md:inline-flex"
          >
            <FolderKanban size={14} className="text-brand-primary" aria-hidden="true" />
            <span>Tài liệu & biểu mẫu</span>
          </Link>

          {isAdmin && (
            <Link
              to={`${SYS_BASE}/crm-config`}
              aria-label="Cấu hình danh mục CRM"
              title="Cấu hình danh mục CRM"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-brand-line bg-white text-brand-ink hover:bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Settings size={15} aria-hidden="true" />
            </Link>
          )}

          <div className="flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-surface py-1 pl-2.5 pr-1 text-xs">
            <span className="max-w-[130px] truncate font-semibold text-brand-ink">
              {me.fullName || me.username}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="rounded-full p-1 text-brand-muted hover:bg-white hover:text-[#9f1239] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <LogOut size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Body: Left Sidebar + Main Workspace Canvas */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop Collapsible Sidebar */}
        <aside
          aria-label="Thanh điều hướng CRM"
          className={`hidden shrink-0 flex-col bg-brand-ink transition-[width] duration-150 lg:flex ${
            collapsed ? 'w-16' : 'w-56'
          }`}
        >
          {renderSidebarLinks(collapsed)}
        </aside>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div
            role="presentation"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-50 bg-brand-ink/50 lg:hidden"
          >
            <aside
              aria-label="Menu CRM di động"
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-60 flex-col bg-brand-ink"
            >
              <div className="flex h-12 items-center justify-between border-b border-white/15 px-4">
                <span className="text-sm font-bold text-white">Luật Poip CRM</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Đóng menu CRM"
                  className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              {renderSidebarLinks(false, () => setMobileOpen(false))}
            </aside>
          </div>
        )}

        {/* Main Workspace Canvas */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-brand-surface">
          <Outlet context={{ me, isAdmin, staffList } satisfies CrmWorkspaceContextValue} />
        </main>
      </div>
    </div>
  );
}
