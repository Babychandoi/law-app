import React, { useEffect, useState } from 'react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../../service/auth';
import { tryRefreshToken } from '../../../service/axiosClient';

// Proactively refresh a bit before the access token expires (default valid-duration ~1h). Keeps
// the session alive without waiting for a 401. Interval kept modest so an expired idle tab recovers.
const PROACTIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

// Tiêu đề tài liệu (document.title) theo route — đặt tập trung cho toàn khu admin (P0.7).
const TITLES: Record<string, string> = {
  '/2025/luatpoip/admin': 'Tổng quan',
  '/2025/luatpoip/admin/customers': 'Khách hàng',
  '/2025/luatpoip/admin/employees': 'Nhân viên',
  '/2025/luatpoip/admin/posts': 'Bài viết',
  '/2025/luatpoip/admin/applications': 'Ứng viên',
  '/2025/luatpoip/admin/subscribers': 'Người đăng ký',
  '/2025/luatpoip/admin/chats': 'Chat khách',
  '/2025/luatpoip/admin/team-chat': 'Chat nội bộ',
  '/2025/luatpoip/admin/crm': 'CRM chăm sóc',
  '/2025/luatpoip/admin/crm/config': 'Cấu hình CRM',
  '/2025/luatpoip/admin/services': 'Dịch vụ',
  '/2025/luatpoip/admin/service-images': 'Ảnh dịch vụ',
};

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.replace(/\/$/, '');
    const label = TITLES[path] ?? 'Quản trị';
    document.title = `${label} - Quản trị Luật Poip Legal`;
  }, [location.pathname]);
  useEffect(() => {
    // Gate on the cookie session. On 401 the axios interceptor tries a refresh transparently.
    getMe(true).then((me) => {
      if (!me) navigate('/2025/luatpoip/admin/login');
    });

    const timer = setInterval(() => {
      tryRefreshToken();
    }, PROACTIVE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [navigate]);
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

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
