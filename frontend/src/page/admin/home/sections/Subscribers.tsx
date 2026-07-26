import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Calendar, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../../../../service/axiosClient';
import {
  Card,
  DataTable,
  PageHeader,
  Button,
  useConfirm,
  type Column,
} from '../../../../component/common/ui';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirm();

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

  const handleDelete = async (sub: Subscriber) => {
    const ok = await confirm({
      title: 'Xóa người đăng ký',
      message: `Bạn có chắc muốn xóa ${sub.email} khỏi danh sách?`,
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setDeletingId(sub.id);
      await axiosClient.delete(`/news/subscribers/${sub.id}`);
      toast.success('Đã xóa người đăng ký');
      setSubscribers((prev) => prev.filter((s) => s.id !== sub.id));
    } catch (error) {
      toast.error('Không thể xóa người đăng ký');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async (rows: Subscriber[], clear: () => void) => {
    const ok = await confirm({
      title: 'Xóa nhiều người đăng ký',
      message: `Xóa ${rows.length} người đăng ký đã chọn khỏi danh sách?`,
      confirmText: 'Xóa tất cả',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await Promise.all(rows.map((r) => axiosClient.delete(`/news/subscribers/${r.id}`)));
      const ids = new Set(rows.map((r) => r.id));
      setSubscribers((prev) => prev.filter((s) => !ids.has(s.id)));
      toast.success(`Đã xóa ${rows.length} người đăng ký`);
      clear();
    } catch (error) {
      toast.error('Không thể xóa một số mục. Vui lòng tải lại và thử lại.');
      fetchSubscribers();
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });

  const columns: Column<Subscriber>[] = [
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (s) => (
        <span className="inline-flex items-center gap-3 font-medium text-gray-900">
          <Mail className="w-5 h-5 text-gray-500" aria-hidden="true" />
          {s.email}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày đăng ký',
      sortable: true,
      sortValue: (s) => new Date(s.createdAt).getTime(),
      render: (s) => (
        <span className="inline-flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          {fmtDate(s.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      render: (s) => (
        <Button
          size="sm"
          variant="danger"
          leftIcon={<Trash2 className="w-4 h-4" />}
          loading={deletingId === s.id}
          onClick={() => handleDelete(s)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {confirmDialog}
      <Card>
        <PageHeader
          icon={Users}
          title="Quản lý người đăng ký"
          subtitle={`Tổng số: ${subscribers.length} người đăng ký nhận tin tức`}
          breadcrumb={[{ label: 'Quản trị hệ thống' }, { label: 'Người đăng ký' }]}
        />
      </Card>

      <Card bodyClassName="p-4">
        <DataTable
          columns={columns}
          data={subscribers}
          rowKey={(s) => s.id}
          loading={loading}
          urlKey="sub"
          selectable
          bulkActions={(rows, clear) => (
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={() => handleBulkDelete(rows, clear)}
            >
              Xóa đã chọn ({rows.length})
            </Button>
          )}
          searchable
          searchPlaceholder="Tìm kiếm theo email..."
          searchText={(s) => s.email}
          pageSize={10}
          emptyIcon={Mail}
          emptyTitle="Chưa có người đăng ký nào"
          emptyDescription="Danh sách người đăng ký nhận tin sẽ hiển thị ở đây."
        />
      </Card>
    </div>
  );
};

export default Subscribers;
