import React, { useEffect, useState } from 'react';
import Sidebar from './sections/Sidebar';
import Navbar from './sections/Navbar';
import { Outlet } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { checkToken } from '../../../service/admin';
import { tryRefreshToken } from '../../../service/axiosClient';



const AdminDashboard: React.FC = () => {

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
      const fetchData = async () => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
          sessionStorage.clear();
          return navigate('/2025/luatpoip/admin/login');
        }
    
        try {
          const response = await checkToken(token);
          if (response.code !== 200 || !response.data.valid) {
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              return;
            } else {
              sessionStorage.clear();
              navigate('/2025/luatpoip/admin/login');
            }
          }
        } catch (error) {
          sessionStorage.clear();
          navigate('/2025/luatpoip/admin/login');
        }
      };
    
      fetchData();
    }, [navigate]);
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
  
        <div className="flex-1 flex flex-col overflow-hidden">
          <Navbar 
          />
  
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };
  
  export default AdminDashboard;