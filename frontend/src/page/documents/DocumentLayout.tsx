import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Files,
  Layers,
  LayoutDashboard,
  Library,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { getMe, MeResponse } from '../../service/auth';
import { tryRefreshToken } from '../../service/axiosClient';
import Sidebar from '../admin/home/sections/Sidebar';
import Navbar from '../admin/home/sections/Navbar';
import { OPERATIONS_GROUPS, SYSTEM_GROUPS, SYS_BASE } from '../admin/home/navConfig';
import CommandPalette from '../../component/common/CommandPalette';
import Spinner from '../../component/common/ui/Spinner';

const PROACTIVE_REFRESH_MS = 10 * 60 * 1000;
const DOCUMENT_BASE = '/2025/luatpoip/tai-lieu';

export default function DocumentLayout() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let active = true;
    getMe(true)
      .then((user) => {
        if (!active) return;
        if (!user) navigate('/2025/luatpoip/admin/login', { replace: true });
        else setMe(user);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    const timer = setInterval(() => tryRefreshToken(), PROACTIVE_REFRESH_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [navigate]);

  useEffect(() => {
    const title = location.pathname.includes('/dashboard')
      ? 'Tổng quan tài liệu'
      : location.pathname.includes('/bundles')
        ? 'Bộ mẫu'
        : location.pathname.includes('/clauses')
          ? 'Thư viện điều khoản'
          : location.pathname.includes('/generated')
            ? 'Tài liệu đã tạo'
            : location.pathname.includes('/templates/new')
              ? 'Tải mẫu mới'
              : location.pathname.includes('/edit')
                ? 'Cấu hình biểu mẫu'
                : location.pathname.includes('/generate')
                  ? 'Tạo tài liệu'
                  : 'Tài liệu & biểu mẫu';
    document.title = `${title} - Luật Poip Legal`;
  }, [location.pathname]);

  const isAdmin = me?.role === 'ADMIN';

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner label="Đang kiểm tra phiên đăng nhập" />
      </div>
    );
  }
  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Spinner label="Đang chuyển đến trang đăng nhập" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 text-brand-ink">
      <CommandPalette
        groups={isAdmin ? [...OPERATIONS_GROUPS, ...SYSTEM_GROUPS] : OPERATIONS_GROUPS}
      />
      <Sidebar
        groups={OPERATIONS_GROUPS}
        workspaceTitle="Vận hành"
        footer={isAdmin ? { label: 'Quản trị hệ thống', to: SYS_BASE, icon: Settings } : undefined}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div id="admin-content-region" className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-goldDark">
                Hồ sơ pháp lý
              </p>
              <h1 className="text-lg font-semibold text-gray-900">Tài liệu & biểu mẫu</h1>
            </div>
            <nav aria-label="Điều hướng tài liệu" className="flex flex-wrap gap-2">
              <DocLink
                to={`${DOCUMENT_BASE}/dashboard`}
                icon={<LayoutDashboard size={16} aria-hidden="true" />}
              >
                Tổng quan
              </DocLink>
              <DocLink to={DOCUMENT_BASE} end icon={<FileText size={16} aria-hidden="true" />}>
                Biểu mẫu
              </DocLink>
              <DocLink
                to={`${DOCUMENT_BASE}/bundles`}
                icon={<Layers size={16} aria-hidden="true" />}
              >
                Bộ mẫu
              </DocLink>
              <DocLink
                to={`${DOCUMENT_BASE}/clauses`}
                icon={<Library size={16} aria-hidden="true" />}
              >
                Điều khoản
              </DocLink>
              <DocLink
                to={`${DOCUMENT_BASE}/generated`}
                icon={<Files size={16} aria-hidden="true" />}
              >
                Tài liệu đã tạo
              </DocLink>
              {isAdmin && (
                <DocLink
                  to={`${DOCUMENT_BASE}/templates/new`}
                  icon={<PlusCircle size={16} aria-hidden="true" />}
                >
                  Tải mẫu mới
                </DocLink>
              )}
            </nav>
          </div>
        </div>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet context={{ me, isAdmin }} />
          </div>
        </main>
      </div>
    </div>
  );
}

function DocLink({
  to,
  end,
  icon,
  children,
}: {
  to: string;
  end?: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
          isActive
            ? 'bg-brand-goldDark text-white'
            : 'bg-white text-brand-ink hover:bg-brand-line/40'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
