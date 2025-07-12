
import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  User2, 
  LogOut,
  Mail,
  Phone,
} from 'lucide-react';
import { myProfile,logout } from '../../../../service/admin';
import { User } from '../../../../types/admin';
interface ContactRequest {
    id: number;
    name: string;
    email: string;
    message: string;
    date: string;
    isRead: boolean;
  }
const Navbar: React.FC<{
    notifications: ContactRequest[];
    setNotifications: React.Dispatch<React.SetStateAction<ContactRequest[]>>;
  }> = ({ notifications, setNotifications }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [profile, setProfile] = useState<User | null>(null);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    useEffect(() =>{
      const fetchProfile = async () => {
        try {
          const response = await myProfile();
          if (response.code === 200 && response.data) {
            setProfile(response.data);
          } else {
            console.error("Failed to fetch profile data");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      };
      fetchProfile();
    },[]);
    const markAsRead = (id: number) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
    };
    const handleProfile = () => {
      setShowProfile(!showProfile);
      setShowNotifications(false); // Close notifications if profile is opened
    };
    const hanldeLogout = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        if (!token) {
          return;
        }
        const response = await logout(token);
        if (response.code === 200) {
          sessionStorage.clear();
          window.location.href = '/login';
        } else {
          console.error("Logout failed:", response.message);
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-end">
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Thông báo liên hệ</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{notification.name}</p>
                            <p className="text-sm text-gray-600">{notification.email}</p>
                            <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile */}
            <div className="relative">
              <button
                onClick={handleProfile}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User2 size={20} className="text-gray-600" />
              </button>
              
              {showProfile && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User2 size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{profile?.fullName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Mail size={16} />
                      <span className="text-sm">{profile?.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Phone size={16} />
                      <span className="text-sm">{profile?.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                     onClick={hanldeLogout}
                    >
                      <LogOut size={16} />
                      <span className="text-sm">LogOut</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  };
export default Navbar;