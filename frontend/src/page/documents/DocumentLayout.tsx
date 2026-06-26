import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FileText, Files, LogOut, PlusCircle } from 'lucide-react';
import { getMe, logout, MeResponse } from '../../service/auth';
import { tryRefreshToken } from '../../service/axiosClient';

const PROACTIVE_REFRESH_MS = 10 * 60 * 1000;

export default function DocumentLayout() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getMe(true).then((user) => {
      if (!user) navigate('/2025/luatpoip/admin/login');
      else setMe(user);
      setReady(true);
    });
    const timer = setInterval(() => tryRefreshToken(), PROACTIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/2025/luatpoip/admin/login');
  };

  const isAdmin = me?.role === 'ADMIN';

  if (!ready) {
    return (
      <div className="min-h-screen bg-brand-surface p-8 text-brand-muted">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-surface text-brand-ink">
      <header className="sticky top-0 z-20 border-b border-brand-line bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand-goldDark">Poip Law</p>
            <h1 className="text-2xl font-semibold">Hồ sơ theo mẫu</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-brand-muted">
              {me?.fullName || me?.username || 'Nhân viên'} · {me?.role}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-line px-3 py-2 hover:bg-brand-surface"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 pb-3 flex flex-wrap gap-2">
          <DocLink to="/2025/luatpoip/tai-lieu" end icon={<FileText size={16} />}>
            Mẫu tài liệu
          </DocLink>
          <DocLink to="/2025/luatpoip/tai-lieu/generated" icon={<Files size={16} />}>
            Đã tạo
          </DocLink>
          {isAdmin && (
            <DocLink to="/2025/luatpoip/tai-lieu/templates/new" icon={<PlusCircle size={16} />}>
              Tải mẫu mới
            </DocLink>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet context={{ me, isAdmin }} />
      </main>
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
          isActive ? 'bg-brand-gold text-white' : 'bg-white text-brand-ink hover:bg-brand-line/40'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
