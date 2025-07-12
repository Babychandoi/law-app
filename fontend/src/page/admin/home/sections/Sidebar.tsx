import { Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import  { useNavigate } from 'react-router-dom'; // Assuming you're using react-router for navigation
const Sidebar: React.FC<{
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}> = ({ sidebarOpen, setSidebarOpen }) => {
    const menuItems = [
        {
            category: 'Trang chủ',
            icon: '🏠',
            key: 'home',
            path: '/administration'
        },
        {
            category: 'Quản lý nhân viên',
            icon: '👥',
            key: 'employees',
            path: '/administration/employees'
        },
        {
            category: 'Quản lý khách hàng',
            icon: '👤',
            key: 'customers',
            path: '/administration/customers'
        },
        {
            category: 'Quản lý bài viết',
            icon: '📝',
            key: 'posts',
            path: '/administration/posts'
        },
    ];

    const [activeTab, setActiveTab] = useState<string>('home');
    const navigate = useNavigate(); // Assuming you're using react-router for navigation
    const handleTabChange = (key: string, path: string) => {
        setActiveTab(key);
        setSidebarOpen(false);
        navigate(path)
    };

    return (
        <>
            {/* Overlay - always visible when sidebar open */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Menu toggle button - always visible */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="fixed top-4 left-4 z-50 w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-black/90 backdrop-blur-lg border-r border-white/20 p-6 shadow-2xl transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
                
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">🏢 Admin Panel</h1>
                </div>

                {/* User info */}
                <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-4 mb-8 border border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            A
                        </div>
                        <div>
                            <div className="text-white font-medium">Xin chào, Admin</div>
                            <div className="text-white/70 text-sm">Quản trị viên</div>
                        </div>
                    </div>
                </div>

                {/* Menu items */}
                <div className="space-y-2">
                    {menuItems.map((item, index) => (
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
                                <span className="text-white font-medium text-left">{item.category}</span>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Sidebar;