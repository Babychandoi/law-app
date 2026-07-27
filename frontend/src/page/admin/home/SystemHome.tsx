import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { getMe } from '../../../service/auth';
import { tryRefreshToken } from '../../../service/axiosClient';
import { SYSTEM_GROUPS, ADMIN_BASE } from './navConfig';

const PROACTIVE_REFRESH_MS = 10 * 60 * 1000;

// Tiêu đề tài liệu theo route — khu QUẢN TRỊ HỆ THỐNG.
const TITLES: Record<string, string> = {
  '/2025/luatpoip/he-thong': 'Quản trị hệ thống',
  '/2025/luatpoip/he-thong/services': 'Dịch vụ',
  '/2025/luatpoip/he-thong/posts': 'Bài viết',
  '/2025/luatpoip/he-thong/service-images': 'Ảnh dịch vụ',
  '/2025/luatpoip/he-thong/employees': 'Nhân viên',
  '/2025/luatpoip/he-thong/applications': 'Ứng viên',
  '/2025/luatpoip/he-thong/subscribers': 'Người đăng ký',
  '/2025/luatpoip/he-thong/crm-config': 'Cấu hình CRM',
};

const SystemHome: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    const label = TITLES[path] ?? 'Quản trị hệ thống';
    document.title = `${label} - Quản trị hệ thống Luật Poip Legal`;
  }, [location.pathname]);

  useEffect(() => {
    // Chỉ ADMIN được vào khu hệ thống. Chưa đăng nhập -> login; là USER -> về khu Vận hành.
    getMe(true).then((me) => {
      if (!me) navigate('/2025/luatpoip/admin/login');
      else if (me.role !== 'ADMIN') navigate(ADMIN_BASE);
    });

    const timer = setInterval(() => {
      tryRefreshToken();
    }, PROACTIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        groups={SYSTEM_GROUPS}
        workspaceTitle="Hệ thống"
        footer={{ label: 'Về Vận hành', to: ADMIN_BASE, icon: ArrowLeft }}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div id="admin-content-region" className="flex-1 flex flex-col overflow-hidden">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SystemHome;
