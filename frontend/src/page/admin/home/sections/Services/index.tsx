import { ExternalLink, FolderPlus, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  AdminChildrenService,
  createParentService,
  deleteService,
  getAllChildrenServices,
} from '../../../../../service/admin';
import { iconOptions } from '../../../../../shared/config/menuIcons';
import ServiceEditor from './ServiceEditor';
import {
  Button,
  DataTable,
  PageHeader,
  useConfirm,
  type Column,
} from '../../../../../component/common/ui';

/**
 * Quản lý dịch vụ (CMS): thêm/sửa/xóa dịch vụ và toàn bộ nội dung trang
 * (hero, sections, quy trình, bảng giá) — không cần sửa code.
 */
const ServiceManager: React.FC = () => {
  const [services, setServices] = useState<AdminChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminChildrenService | 'new' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { confirm, confirmDialog } = useConfirm();

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await getAllChildrenServices();
      setServices(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddParent = async () => {
    const { value: title } = await Swal.fire({
      title: 'Thêm nhóm dịch vụ',
      input: 'text',
      inputLabel: 'Tên nhóm (hiện trên menu, vd: Sở hữu trí tuệ)',
      inputPlaceholder: 'Sở hữu trí tuệ',
      showCancelButton: true,
      confirmButtonText: 'Tạo',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#b45309',
      inputValidator: (v) => (!v?.trim() ? 'Vui lòng nhập tên nhóm' : undefined),
    });
    if (!title) return;
    const { value: href } = await Swal.fire({
      title: 'Đường dẫn trang nhóm',
      input: 'text',
      inputLabel: 'Vd: /dich-vu-doanh-nghiep (chữ thường, không dấu)',
      inputValue: '/',
      showCancelButton: true,
      confirmButtonText: 'Tạo nhóm',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#b45309',
    });
    if (!href) return;
    const { value: icon } = await Swal.fire({
      title: 'Chọn biểu tượng cho nhóm',
      input: 'select',
      inputOptions: Object.fromEntries(iconOptions.map((o) => [o.value, o.label])),
      inputPlaceholder: 'Chọn icon',
      showCancelButton: true,
      confirmButtonText: 'Tạo nhóm',
      cancelButtonText: 'Bỏ qua icon',
      confirmButtonColor: '#b45309',
    });
    try {
      await createParentService(
        title.trim(),
        href.trim().startsWith('/') ? href.trim() : `/${href.trim()}`,
        icon || undefined
      );
      toast.success(`Đã tạo nhóm "${title}". Menu cập nhật sau khi gán dịch vụ vào nhóm này.`);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Tạo nhóm thất bại.');
    }
  };

  const handleDelete = async (service: AdminChildrenService) => {
    const ok = await confirm({
      title: `Xóa dịch vụ "${service.title}"?`,
      message: 'Toàn bộ nội dung trang (hero, quy trình, bảng giá, sections) sẽ bị xóa vĩnh viễn.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setDeletingId(service.id);
      await deleteService(service.id);
      toast.success('Đã xóa dịch vụ.');
      setServices((prev) => prev.filter((s) => s.id !== service.id));
    } catch {
      toast.error('Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: Column<AdminChildrenService>[] = [
    {
      key: 'title',
      header: 'Dịch vụ',
      sortable: true,
      render: (service) => (
        <div className="flex items-center gap-3">
          {service.image ? (
            <img
              src={service.image}
              alt=""
              className="h-10 w-14 rounded border border-gray-200 object-cover"
            />
          ) : (
            <div className="h-10 w-14 rounded border border-dashed border-gray-300 bg-gray-50" />
          )}
          <span className="font-semibold text-gray-900">{service.title}</span>
        </div>
      ),
    },
    {
      key: 'href',
      header: 'Đường dẫn trang',
      sortable: true,
      render: (service) => (
        <a
          href={service.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-amber-700 hover:underline"
        >
          {service.href}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      ),
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      hideable: false,
      render: (service) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditing(service)}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            loading={deletingId === service.id}
            onClick={() => handleDelete(service)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (editing) {
    return (
      <ServiceEditor
        service={editing === 'new' ? null : editing}
        onClose={(changed) => {
          setEditing(null);
          if (changed) fetchServices();
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {confirmDialog}
      <PageHeader
        className="mb-6"
        icon={Layers}
        title="Quản lý dịch vụ"
        subtitle="Thêm dịch vụ mới hoặc sửa nội dung trang — trang web cập nhật ngay, không cần sửa code."
        breadcrumb={[{ label: 'Quản trị hệ thống' }, { label: 'Dịch vụ' }]}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<FolderPlus className="h-4 w-4" />}
              onClick={handleAddParent}
              className="!border-amber-700 !text-amber-700 hover:!bg-amber-50"
            >
              Thêm nhóm
            </Button>
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setEditing('new')}>
              Thêm dịch vụ
            </Button>
          </>
        }
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <DataTable
          columns={columns}
          data={services}
          rowKey={(s) => s.id}
          loading={loading}
          urlKey="svc"
          tableId="services"
          searchable
          searchPlaceholder="Tìm theo tên hoặc đường dẫn..."
          searchText={(s) => `${s.title} ${s.href}`}
          pageSize={10}
          emptyIcon={Layers}
          emptyTitle="Chưa có dịch vụ nào"
          emptyDescription="Bấm “Thêm dịch vụ” để tạo trang đầu tiên."
        />
      </div>
    </div>
  );
};

export default ServiceManager;
