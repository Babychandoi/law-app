import React, { useEffect, useState } from 'react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { checkToken } from '../../../service/admin';
import { tryRefreshToken } from '../../../service/axiosClient';
interface ContactRequest {
    id: number;
    name: string;
    email: string;
    message: string;
    date: string;
    isRead: boolean;
  }

const AdminDashboard: React.FC = () => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
      const fetchData = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          sessionStorage.clear();
          return navigate('/login');
        }
    
        try {
          const response = await checkToken(token);
          if (response.code !== 200 || !response.data.valid) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              return;
            } else {
              sessionStorage.clear();
              navigate('/login');
            }
          }
        } catch (error) {
          console.error("Error checking token:", error);
          sessionStorage.clear();
          navigate('/login');
        }
      };
    
      fetchData();
    }, [navigate]);
    const [notifications, setNotifications] = useState<ContactRequest[]>([
      {
        id: 1,
        name: "Nguyễn Văn An",
        email: "nguyenvana@email.com",
        message: "Tôi muốn hỏi về sản phẩm của công ty, có thể tư vấn không?",
        date: "2025-01-15",
        isRead: false
      },
      {
        id: 2,
        name: "Trần Thị Bình",
        email: "tranthib@email.com",
        message: "Làm thế nào để đăng ký dịch vụ premium?",
        date: "2025-01-14",
        isRead: false
      },
      {
        id: 3,
        name: "Lê Văn Cường",
        email: "levanc@email.com",
        message: "Tôi gặp vấn đề khi sử dụng hệ thống, cần hỗ trợ.",
        date: "2025-01-13",
        isRead: true
      }
    ]);
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
  
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
            notifications={notifications}
            setNotifications={setNotifications}
          />
  
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };
  
  export default AdminDashboard;