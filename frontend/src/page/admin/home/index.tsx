import React, { useEffect, useState } from 'react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../../../service/auth';
import { tryRefreshToken } from '../../../service/axiosClient';

// Proactively refresh a bit before the access token expires (default valid-duration ~1h). Keeps
// the session alive without waiting for a 401. Interval kept modest so an expired idle tab recovers.
const PROACTIVE_REFRESH_MS = 10 * 60 * 1000; // 10 minutes

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
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
