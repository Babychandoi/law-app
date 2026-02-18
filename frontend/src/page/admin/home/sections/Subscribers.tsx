import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../../../../service/axiosClient';

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const Subscribers: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get<ApiResponse<Subscriber[]>>('/news/subscribers');
      
      if (response.data.code === 200) {
        setSubscribers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Không thể tải danh sách người đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ${email} khỏi danh sách?`)) {
      return;
    }

    try {
      await axiosClient.delete(`/news/subscribers/${id}`);
      toast.success('Đã xóa người đăng ký');
      fetchSubscribers();
    } catch (error) {
      toast.error('Không thể xóa người đăng ký');
    }
  };

  const filteredSubscribers = subscribers.filter(sub =>
    sub.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý người đăng ký</h1>
            <p className="text-gray-600 mt-1">
              Tổng số: {subscribers.length} người đăng ký nhận tin tức
            </p>
          </div>
          <Users className="w-12 h-12 text-blue-600" />
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Tìm kiếm theo email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có người đăng ký nào'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày đăng ký
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(subscriber.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscribers;
