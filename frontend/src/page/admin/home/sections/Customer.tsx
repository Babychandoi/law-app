import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import { Customer, CustomerDetail } from '../../../../types/admin';
import { ServiceItem } from '../../../../types/service';
import { getCustomers, getCustomerById, updateCustomerStatus, myProfile } from '../../../../service/admin';
import { getServiceHome } from '../../../../service/service';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const CustomerManagement: React.FC = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [profile, setProfile] = useState<{ id: string } | null>(null);

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
    const fetchServices = async () => {
      try {
        const response = await getServiceHome();
        if (response.code === 200) {
          setServices(response.data);
        } else {
          toast.warning('Không có dữ liệu dịch vụ nào được trả về!');
        }
      } catch (error) {
        toast.error('Lỗi khi tải danh sách dịch vụ. Vui lòng thử lại!');
      }
    };
    fetchServices();
  }, []);

  const fetchCustomers = async () => {
    try {
      Swal.fire({
        title: 'Đang tải thông tin khách hàng...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const response = await getCustomers();
      if (response.code === 200) {
        Swal.close();
        const sortedCustomers = response.data.sort(
          (a: Customer, b: Customer) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setAllCustomers(sortedCustomers);
        setFilteredCustomers(sortedCustomers);
      } else {
        toast.warning('Lỗi khi tải danh sách khách hàng: ' + response.message);
      }
    } catch (error) {
      toast.error("Lỗi khi tải danh sách khách hàng: " + (error as Error).message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      const wsUrl = process.env.REACT_APP_WS_URL?.replace('http://', 'ws://').replace('https://', 'wss://');
      const socket = new WebSocket(`${wsUrl}?userId=${profile.id}`);
      
      socket.onopen = () => {
        console.log('Customer WebSocket connected');
      };
      
      socket.onmessage = async (event) => {
        await fetchCustomers();
      };
      
      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        toast.error("Lỗi kết nối đến máy chủ thông báo");
      };
      
      return () => {
        socket.close();
      };
    }
  }, [profile?.id]);

  const applyFiltersAndSearch = React.useCallback(() => {
    let filtered = allCustomers;
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((customer) => customer.status === statusFilter);
    }
    if (serviceFilter !== 'ALL') {
      filtered = filtered.filter((customer) => customer.serviceName === serviceFilter);
    }
    if (dateFromFilter) {
      filtered = filtered.filter(
        (customer) => new Date(customer.createdAt) >= new Date(dateFromFilter)
      );
    }
    if (dateToFilter) {
      filtered = filtered.filter(
        (customer) => new Date(customer.createdAt) <= new Date(dateToFilter)
      );
    }
    filtered = filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setFilteredCustomers(filtered);
    setCurrentPage(1);
  }, [allCustomers, searchTerm, statusFilter, serviceFilter, dateFromFilter, dateToFilter]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  const quickFilterByService = (service: string) => {
    setServiceFilter(service);
    setShowFilters(true);
  };

  const quickFilterByDate = (date: string) => {
    setDateFromFilter(date);
    setDateToFilter(date);
    setShowFilters(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setServiceFilter('ALL');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const updateStatus = async (
    customerId: string,
    newStatus: 'NEW' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED'
  ) => {
    try {
      const response = await updateCustomerStatus(customerId, newStatus);
      if (response.code === 200) {
        setAllCustomers((prevCustomers) => {
          const updatedCustomers = prevCustomers.map((customer) =>
            customer.id === customerId ? { ...customer, status: newStatus } : customer
          );
          return updatedCustomers.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
        applyFiltersAndSearch();
      } else {
        toast.error("Cập nhật trạng thái khách hàng thất bại: " + response.message);
      }
    } catch (error) {
      toast.error("Lỗi khi cập nhật trạng thái khách hàng: " + (error as Error).message);
    }
  };

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleView = async (id: string) => {
    const customerdetail = await getCustomerById(id);
    if (customerdetail.code === 200) {
      setSelectedCustomer(customerdetail.data);
      setShowModal(true);
    } else {
      toast.error("Lỗi khi tải chi tiết khách hàng: " + customerdetail.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'NEW':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'RECEIVED':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'PROCESSING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'CANCELED':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'Mới';
      case 'RECEIVED':
        return 'Đã tiếp nhận';
      case 'PROCESSING':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý khách hàng</h2>
      </div>
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, điện thoại, email hoặc dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Lọc
          </button>
        </div>
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="NEW">Mới</option>
                  <option value="RECEIVED">Đã tiếp nhận</option>
                  <option value="PROCESSING">Đang xử lý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELED">Đã hủy</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ</label>
                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tất cả dịch vụ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>{service.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Hiển thị {filteredCustomers.length} / {allCustomers.length} khách hàng
              </div>
              <button
                onClick={clearFilters}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Xóa bộ lọc
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tên khách hàng</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Điện thoại</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dịch vụ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ngày tạo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map((customer) => (
              <tr key={customer.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 font-medium">{customer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{customer.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{customer.email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <div
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={() => quickFilterByService(customer.serviceName)}
                  >
                    {customer.serviceName}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={customer.status}
                    onChange={(e) => updateStatus(customer.id, e.target.value as any)}
                    className={`${getStatusBadge(customer.status)} border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:rounded-md`}
                  >
                    <option value="NEW">Mới</option>
                    <option value="RECEIVED">Đã tiếp nhận</option>
                    <option value="PROCESSING">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELED">Đã hủy</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  <span
                    className="cursor-pointer hover:text-blue-600"
                    onClick={() => quickFilterByDate(customer.createdAt)}
                  >
                    {formatDate(customer.createdAt)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleView(customer.id)}
                    className="text-green-600 hover:text-green-800 text-sm font-medium mr-3"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredCustomers.length)} trong {filteredCustomers.length} khách hàng
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {filteredCustomers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Không tìm thấy khách hàng phù hợp với tìm kiếm và bộ lọc hiện tại</p>
        </div>
      )}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Chi tiết khách hàng</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ID khách hàng</label>
                    <p className="text-sm text-gray-900 font-mono">{selectedCustomer.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                    <span className={getStatusBadge(selectedCustomer.status)}>
                      {getStatusText(selectedCustomer.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Điện thoại</label>
                    <p className="text-sm text-gray-900">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.serviceName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <p className="text-sm text-gray-900">{selectedCustomer.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCustomer.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cập nhật</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCustomer.updatedAt)}</p>
                  </div>
                </div>
                {selectedCustomer.completedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hoàn thành</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCustomer.completedAt)}</p>
                  </div>
                )}
                {selectedCustomer.cancelledAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hủy</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedCustomer.cancelledAt)}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;