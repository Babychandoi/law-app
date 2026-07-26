import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, Users } from 'lucide-react';
import Modal from '../../../../component/common/Modal';
import { Customer, CustomerDetail } from '../../../../types/admin';
import { ServiceItem } from '../../../../types/service';
import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  myProfile,
} from '../../../../service/admin';
import { getServiceHome } from '../../../../service/service';
import { toast } from 'react-toastify';
import { Button, DataTable, PageHeader, type Column } from '../../../../component/common/ui';

type CustomerStatus = 'NEW' | 'RECEIVED' | 'PROCESSING' | 'COMPLETED' | 'CANCELED';

const CustomerManagement: React.FC = () => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState<string>(() => searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<string>(
    () => searchParams.get('status') ?? 'ALL'
  );
  const [serviceFilter, setServiceFilter] = useState<string>(
    () => searchParams.get('svc') ?? 'ALL'
  );
  const [dateFromFilter, setDateFromFilter] = useState<string>(
    () => searchParams.get('from') ?? ''
  );
  const [dateToFilter, setDateToFilter] = useState<string>(() => searchParams.get('to') ?? '');
  // Mở sẵn panel lọc nếu URL đã có bộ lọc.
  const [showFilters, setShowFilters] = useState(
    () =>
      (searchParams.get('status') ?? 'ALL') !== 'ALL' ||
      (searchParams.get('svc') ?? 'ALL') !== 'ALL' ||
      !!searchParams.get('from') ||
      !!searchParams.get('to')
  );

  // Đồng bộ bộ lọc -> URL (deep-link / reload giữ nguyên bộ lọc).
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        searchTerm ? next.set('q', searchTerm) : next.delete('q');
        statusFilter !== 'ALL' ? next.set('status', statusFilter) : next.delete('status');
        serviceFilter !== 'ALL' ? next.set('svc', serviceFilter) : next.delete('svc');
        dateFromFilter ? next.set('from', dateFromFilter) : next.delete('from');
        dateToFilter ? next.set('to', dateToFilter) : next.delete('to');
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, serviceFilter, dateFromFilter, dateToFilter]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await myProfile();
        if (response.code === 200 && response.data) {
          setProfile(response.data);
        } else {
          toast.error('Không thể tải thông tin người dùng');
        }
      } catch (error) {
        toast.error('Lỗi khi tải thông tin người dùng');
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
      setLoading(true);
      const response = await getCustomers();
      if (response.code === 200) {
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
      toast.error('Lỗi khi tải danh sách khách hàng: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (profile?.id) {
      const wsUrl = process.env.REACT_APP_WS_URL?.replace('http://', 'ws://').replace(
        'https://',
        'wss://'
      );
      const socket = new WebSocket(`${wsUrl}?userId=${profile.id}`);

      socket.onopen = () => {};

      // Debounce: gom nhiều thông báo gần nhau thành 1 lần fetch (tránh gọi lại
      // toàn bộ danh sách liên tục khi có nhiều sự kiện realtime dồn dập).
      let refetchTimer: ReturnType<typeof setTimeout> | null = null;
      socket.onmessage = () => {
        if (refetchTimer) clearTimeout(refetchTimer);
        refetchTimer = setTimeout(() => {
          fetchCustomers();
        }, 800);
      };

      socket.onerror = () => {
        toast.error('Lỗi kết nối đến máy chủ thông báo');
      };

      return () => {
        if (refetchTimer) clearTimeout(refetchTimer);
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

  const updateStatus = async (customerId: string, newStatus: CustomerStatus) => {
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
      } else {
        toast.error('Cập nhật trạng thái khách hàng thất bại: ' + response.message);
      }
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái khách hàng: ' + (error as Error).message);
    }
  };

  const handleView = async (id: string) => {
    const customerdetail = await getCustomerById(id);
    if (customerdetail.code === 200) {
      setSelectedCustomer(customerdetail.data);
      setShowModal(true);
    } else {
      toast.error('Lỗi khi tải chi tiết khách hàng: ' + customerdetail.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
    switch (status) {
      case 'NEW':
      case 'RECEIVED':
        return `${baseClasses} bg-brand-surface text-brand-goldDark`;
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

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN');

  const statusSelect = (customer: Customer) => (
    <select
      aria-label="Cập nhật trạng thái khách hàng"
      value={customer.status}
      onChange={(e) => updateStatus(customer.id, e.target.value as CustomerStatus)}
      className={`${getStatusBadge(customer.status)} border-none bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-goldDark focus:rounded-md`}
    >
      <option value="NEW">Mới</option>
      <option value="RECEIVED">Đã tiếp nhận</option>
      <option value="PROCESSING">Đang xử lý</option>
      <option value="COMPLETED">Hoàn thành</option>
      <option value="CANCELED">Đã hủy</option>
    </select>
  );

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Tên khách hàng',
      sortable: true,
      render: (c) => <span className="font-medium text-gray-900">{c.name}</span>,
    },
    {
      key: 'phone',
      header: 'Điện thoại',
      render: (c) => <span className="font-mono">{c.phone}</span>,
    },
    { key: 'email', header: 'Email' },
    {
      key: 'serviceName',
      header: 'Dịch vụ',
      sortable: true,
      render: (c) => (
        <button
          type="button"
          onClick={() => quickFilterByService(c.serviceName)}
          className="font-medium text-left hover:text-brand-goldDark"
        >
          {c.serviceName}
        </button>
      ),
    },
    { key: 'status', header: 'Trạng thái', render: (c) => statusSelect(c) },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      sortable: true,
      sortValue: (c) => new Date(c.createdAt).getTime(),
      render: (c) => (
        <button
          type="button"
          onClick={() => quickFilterByDate(c.createdAt)}
          className="hover:text-brand-goldDark"
        >
          {formatDate(c.createdAt)}
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (c) => (
        <Button size="sm" variant="secondary" onClick={() => handleView(c.id)}>
          Xem
        </Button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <PageHeader
        className="mb-6"
        icon={Users}
        title="Quản lý khách hàng"
        breadcrumb={[{ label: 'Vận hành' }, { label: 'Khách hàng' }]}
      />
      <div className="mb-6 space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, điện thoại, email hoặc dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showFilters
                ? 'bg-brand-goldDark text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                  aria-label="Lọc theo trạng thái"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
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
                  aria-label="Lọc theo dịch vụ"
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
                >
                  <option value="ALL">Tất cả dịch vụ</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.title}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  aria-label="Lọc từ ngày"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  aria-label="Lọc đến ngày"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-goldDark"
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

      <DataTable
        columns={columns}
        data={filteredCustomers}
        rowKey={(c) => c.id}
        loading={loading}
        pageSize={8}
        emptyIcon={Search}
        emptyTitle="Không tìm thấy khách hàng"
        emptyDescription="Không có khách hàng phù hợp với tìm kiếm và bộ lọc hiện tại."
        mobileCard={(c) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-gray-900">{c.name}</span>
              {statusSelect(c)}
            </div>
            <div className="text-sm text-gray-600 font-mono">{c.phone}</div>
            <div className="text-sm text-gray-600 break-words">{c.email}</div>
            <button
              type="button"
              onClick={() => quickFilterByService(c.serviceName)}
              className="text-sm font-medium text-left hover:text-brand-goldDark"
            >
              {c.serviceName}
            </button>
            <div className="flex items-center justify-between pt-1 text-sm text-gray-500">
              <span>{formatDate(c.createdAt)}</span>
              <Button size="sm" variant="secondary" onClick={() => handleView(c.id)}>
                Xem
              </Button>
            </div>
          </div>
        )}
      />

      {showModal && selectedCustomer && (
        <Modal
          title="Chi tiết khách hàng"
          onClose={() => setShowModal(false)}
          size="lg"
          footer={
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Đóng
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID khách hàng
                </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày cập nhật
                </label>
                <p className="text-sm text-gray-900">{formatDate(selectedCustomer.updatedAt)}</p>
              </div>
            </div>
            {selectedCustomer.completedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hoàn thành
                </label>
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
        </Modal>
      )}
    </div>
  );
};

export default CustomerManagement;
