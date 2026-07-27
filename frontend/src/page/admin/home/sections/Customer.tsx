import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(() => Math.max(1, Number(searchParams.get('page')) || 1));
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(() => {
    const s = searchParams.get('sort');
    if (!s) return null;
    const [key, dir] = s.split(',');
    return key ? { key, dir: dir === 'asc' ? 'asc' : 'desc' } : null;
  });
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
        page > 1 ? next.set('page', String(page)) : next.delete('page');
        sort ? next.set('sort', `${sort.key},${sort.dir}`) : next.delete('sort');
        return next;
      },
      { replace: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, serviceFilter, dateFromFilter, dateToFilter, page, sort]);

  // Đồng bộ NGƯỢC: URL đổi (back/forward, sửa tay) -> cập nhật bộ lọc/trang/sort.
  useEffect(() => {
    const g = (k: string, d = '') => searchParams.get(k) ?? d;
    setSearchTerm((p) => (p !== g('q') ? g('q') : p));
    setStatusFilter((p) => (p !== g('status', 'ALL') ? g('status', 'ALL') : p));
    setServiceFilter((p) => (p !== g('svc', 'ALL') ? g('svc', 'ALL') : p));
    setDateFromFilter((p) => (p !== g('from') ? g('from') : p));
    setDateToFilter((p) => (p !== g('to') ? g('to') : p));
    const pg = Math.max(1, Number(searchParams.get('page')) || 1);
    setPage((p) => (p !== pg ? pg : p));
    const s = searchParams.get('sort');
    const sortObj = s
      ? {
          key: s.split(',')[0],
          dir: (s.split(',')[1] === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
        }
      : null;
    setSort((p) => (JSON.stringify(p) !== JSON.stringify(sortObj) ? sortObj : p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
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

  // Tải khách hàng phía server: phân trang + lọc (từ khóa/trạng thái/dịch vụ/ngày) đều ở backend.
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getCustomers({
        page: page - 1,
        size: 8,
        q: searchTerm || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        serviceId: serviceFilter !== 'ALL' ? serviceFilter : undefined,
        from: dateFromFilter || undefined,
        to: dateToFilter || undefined,
        sort: sort ? `${sort.key},${sort.dir}` : undefined,
      });
      if (response.code === 200) {
        setCustomers(response.data);
        setTotalPages(response.meta?.totalPages ?? 1);
        setTotalElements(response.meta?.totalElements ?? response.data.length);
      } else {
        toast.warning('Lỗi khi tải danh sách khách hàng: ' + response.message);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách khách hàng: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter, serviceFilter, dateFromFilter, dateToFilter, sort]);

  const fetchRef = useRef(fetchCustomers);
  fetchRef.current = fetchCustomers;

  // Đổi bộ lọc/từ khóa -> về trang 1.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, serviceFilter, dateFromFilter, dateToFilter]);

  // Nạp dữ liệu (debounce để gõ tìm kiếm không gọi API mỗi ký tự).
  useEffect(() => {
    const t = setTimeout(() => fetchCustomers(), 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  useEffect(() => {
    if (profile?.id) {
      const wsUrl = process.env.REACT_APP_WS_URL?.replace('http://', 'ws://').replace(
        'https://',
        'wss://'
      );
      const socket = new WebSocket(`${wsUrl}?userId=${profile.id}`);

      socket.onopen = () => {};

      // Debounce: gom nhiều thông báo gần nhau thành 1 lần refetch trang hiện tại.
      let refetchTimer: ReturnType<typeof setTimeout> | null = null;
      socket.onmessage = () => {
        if (refetchTimer) clearTimeout(refetchTimer);
        refetchTimer = setTimeout(() => {
          fetchRef.current();
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

  const quickFilterByService = (service: string) => {
    setServiceFilter(service);
    setShowFilters(true);
  };

  const quickFilterByDate = (date: string) => {
    // input type=date + backend LocalDate cần yyyy-MM-dd (cắt phần giờ của ISO).
    const day = (date || '').slice(0, 10);
    setDateFromFilter(day);
    setDateToFilter(day);
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
        // Cập nhật tại chỗ trên trang hiện tại.
        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === customerId ? { ...customer, status: newStatus } : customer
          )
        );
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
      render: (c) => (
        <button
          type="button"
          onClick={() => quickFilterByService(c.serviceId)}
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
      hideable: false,
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
                    <option key={service.id} value={service.id}>
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
              <div className="text-sm text-gray-600">Tìm thấy {totalElements} khách hàng</div>
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
        data={customers}
        rowKey={(c) => c.id}
        loading={loading}
        tableId="customers"
        serverPagination={{
          page,
          totalPages,
          totalElements,
          onPageChange: setPage,
        }}
        sortState={sort}
        onSortChange={(key, dir) => {
          setSort({ key, dir });
          setPage(1);
        }}
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
              onClick={() => quickFilterByService(c.serviceId)}
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
