import React, { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../../service/auth';
import { tryRefreshToken } from '../../../service/axiosClient';
import { OPERATIONS_GROUPS, SYS_BASE } from './navConfig';

// Proactively refresh a bit before the access token expires (default valid-duration ~1h). Keeps
// the session alive without waiting for a 401. Interval kept modest so an expired idle tab recovers.
const PROACTIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

// Tiêu đề tài liệu theo route — khu VẬN HÀNH (P0.7).
const TITLES: Record<string, string> = {
  '/2025/luatpoip/admin': 'Tổng quan',
  '/2025/luatpoip/admin/customers': 'Khách hàng',
  '/2025/luatpoip/admin/chats': 'Chat khách',
  '/2025/luatpoip/admin/team-chat': 'Chat nội bộ',
  '/2025/luatpoip/admin/crm': 'CRM chăm sóc',
};

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    const label = TITLES[path] ?? 'Vận hành';
    document.title = `${label} - Quản trị Luật Poip Legal`;
  }, [location.pathname]);

  useEffect(() => {
    // Gate on the cookie session. On 401 the axios interceptor tries a refresh transparently.
    getMe(true).then((me) => {
      if (!me) navigate('/2025/luatpoip/admin/login');
      else setIsAdmin(me.role === 'ADMIN');
    });

    const timer = setInterval(() => {
      tryRefreshToken();
    }, PROACTIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        groups={OPERATIONS_GROUPS}
        workspaceTitle="Vận hành"
        footer={isAdmin ? { label: 'Quản trị hệ thống', to: SYS_BASE, icon: Settings } : undefined}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
