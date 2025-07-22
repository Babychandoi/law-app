import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  User2, 
  LogOut,
  Mail,
  Phone,
  ChevronDown,
  Eye
} from 'lucide-react';
import { myProfile, logout, getNotificationById } from '../../../../service/admin';
import { Notification, User } from '../../../../types/admin';
import { toast } from 'react-toastify';
import { markAsRead,markAllRead } from '../../../../service/admin';

const Navbar: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<User | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
  const [notificationsToShow, setNotificationsToShow] = useState(3); // Hiển thị 5 thông báo đầu tiên
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getNotificationById();
        if (response.code === 200) {
          const mappedNotifications = response.data.map((notification: any) => ({
            id: notification.id,
            customerServiceName: notification.customerServiceName,
            serviceName: notification.serviceName,
            createdAt: notification.createdAt,
            read: notification.read,
          }));
          setNotifications(mappedNotifications);
          setDisplayedNotifications(mappedNotifications.slice(0, 3));
          setUnreadCount(mappedNotifications.filter(n => !n.read).length);
        } else {
          toast.error("Không thể tải thông báo"); 
        }
      } catch (error) {
        toast.error("Lỗi khi tải thông báo");
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myProfile();
        if (response.code === 200 && response.data) {
          setProfile(response.data);
        } else {
          toast.error("Không thể tải thông tin người dùng");
        }
      } catch (error) {
        toast.error("Lỗi khi tải thông tin người dùng");
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      const socket = new WebSocket(`wss://luattoto.uk/ws/notifications?userId=${profile.id}`);
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        const newNotification: Notification = {
          id: data.id,
          customerServiceName: data.customerServiceName,
          serviceName: data.serviceName,
          createdAt: new Date(data.createdAt).toLocaleString("vi-VN"),
          read: data.read,
        };

        setNotifications((prev) => {
          const updated = [newNotification, ...prev];
          // Cập nhật displayedNotifications nếu đang hiển thị tất cả hoặc thêm vào đầu danh sách
          if (showAllNotifications) {
            setDisplayedNotifications(updated);
          } else {
            setDisplayedNotifications(updated.slice(0, notificationsToShow));
          }
          return updated;
        });
        setUnreadCount((prevCount) => prevCount + (data.read ? 0 : 1));
      };

      socket.onerror = (err) => {
        toast.error("Lỗi kết nối đến máy chủ thông báo");
      };

      return () => {
        socket.close();
      };
    }
  }, [profile?.id, showAllNotifications, notificationsToShow]);

  // Cập nhật displayedNotifications khi notifications thay đổi
  useEffect(() => {
    if (showAllNotifications) {
      setDisplayedNotifications(notifications);
    } else {
      setDisplayedNotifications(notifications.slice(0, notificationsToShow));
    }
  }, [notifications, notificationsToShow, showAllNotifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setDisplayedNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prevCount) => Math.max(0, prevCount - 1));
    await markAsRead(id);
  };

  const handleLoadMore = () => {
    const newCount = notificationsToShow + 5;
    setNotificationsToShow(newCount);
    setDisplayedNotifications(notifications.slice(0, newCount));
  };

  const handleViewAll = () => {
    setShowAllNotifications(true);
    setDisplayedNotifications(notifications);
  };

  const handleViewLess = () => {
    setShowAllNotifications(false);
    setNotificationsToShow(5);
    setDisplayedNotifications(notifications.slice(0, 5));
  };

  const markAllAsRead = async () => {
    try {
      
      // Cập nhật UI trước
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setDisplayedNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);

      // Gọi API để đánh dấu từng thông báo đã đọc
      await markAllRead();
      
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc");
    } catch (error) {
      toast.error("Lỗi khi đánh dấu thông báo");
      // Rollback nếu có lỗi
      window.location.reload();
    }
  };

  const handleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const handleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
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
        toast.error("Không thể đăng xuất");
      }
    } catch (error) {
      toast.error("Lỗi khi đăng xuất");
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-end">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={handleNotifications}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    Thông báo liên hệ {notifications.length > 0 && `(${notifications.length})`}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Eye size={12} />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {displayedNotifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300" />
                      <p>Không có thông báo nào</p>
                    </div>
                  ) : (
                    displayedNotifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !n.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {if (!n.read) markRead(n.id);}}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{n.customerServiceName}</p>
                            <p className="text-sm text-gray-600">{n.serviceName}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.createdAt}</p>
                          </div>
                          {!n.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Nút điều khiển xem thêm/xem tất cả */}
                  {notifications.length > 5 && (
                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-center space-x-4">
                        {!showAllNotifications && displayedNotifications.length < notifications.length && (
                          <button
                            onClick={handleLoadMore}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ChevronDown size={16} />
                            <span>Xem thêm ({Math.min(5, notifications.length - displayedNotifications.length)})</span>
                          </button>
                        )}
                        
                        {!showAllNotifications && displayedNotifications.length < notifications.length && (
                          <button
                            onClick={handleViewAll}
                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Eye size={16} />
                            <span>Xem tất cả ({notifications.length})</span>
                          </button>
                        )}
                        
                        {showAllNotifications && (
                          <button
                            onClick={handleViewLess}
                            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-700"
                          >
                            <span>Thu gọn</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

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