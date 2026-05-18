import { Menu, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ sidebarOpen, setSidebarOpen }) => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  // ✅ Decode JWT để lấy scope
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.scope === 'ADMIN');
      } catch (err) {
      }
    }
  }, []);

  const menuItems = [
    {
      category: 'Trang chủ',
      icon: '🏠',
      key: 'home',
      path: '/2025/luatpoip/admin',
    },
    {
      category: 'Quản lý nhân viên',
      icon: '👥',
      key: 'employees',
      path: '/2025/luatpoip/admin/employees',
      onlyAdmin: true,
    },
    {
      category: 'Quản lý khách hàng',
      icon: '👤',
      key: 'customers',
      path: '/2025/luatpoip/admin/customers',
    },
    {
      category: 'Quản lý bài viết',
      icon: '📝',
      key: 'posts',
      path: '/2025/luatpoip/admin/posts',
    },
    {
      category: 'Quản lý ứng viên',
      icon: '💼',
      key: 'applications',
      path: '/2025/luatpoip/admin/applications',
      onlyAdmin: true,
    },
    {
      category: 'Người đăng ký',
      icon: '📧',
      key: 'subscribers',
      path: '/2025/luatpoip/admin/subscribers',
      onlyAdmin: true,
    },
    {
      category: 'Chats',
      icon: '💬',
      key: 'chats',
      path: '/2025/luatpoip/admin/chats',
      onlyAdmin: true,
    }
  ];

  const handleTabChange = (key: string, path: string) => {
    setActiveTab(key);
    setSidebarOpen(false);
    navigate(path);
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-black/90 backdrop-blur-lg border-r border-white/20 p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">🏢 Admin Panel</h1>
        </div>

        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <div className="text-white font-medium">Xin chào, {isAdmin ? "Admin" : "Người dùng"}</div>
              <div className="text-white/70 text-sm">
                {isAdmin ? 'Quản trị viên' : 'Khách truy cập'}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {menuItems
            .filter(item => !item.onlyAdmin || isAdmin)
            .map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => handleTabChange(item.key, item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 hover:bg-white/10 ${
                    activeTab === item.key
                      ? 'bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30'
                      : 'hover:border-white/20 border border-transparent'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white font-medium text-left">
                    {item.category}
                  </span>
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
