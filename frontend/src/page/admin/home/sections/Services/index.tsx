import { ExternalLink, FolderPlus, Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AdminChildrenService,
  createParentService,
  deleteService,
  getAllChildrenServices,
} from '../../../../../service/admin';
import { iconOptions } from '../../../../../shared/config/menuIcons';
import Modal from '../../../../../component/common/Modal';
import ServiceEditor from './ServiceEditor';
import {
  Button,
  DataTable,
  Input,
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
  // Modal "Thêm nhóm dịch vụ" (thay cho wizard SweetAlert cũ).
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [gTitle, setGTitle] = useState('');
  const [gHref, setGHref] = useState('/');
  const [gIcon, setGIcon] = useState('');
  const [gSaving, setGSaving] = useState(false);

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

  const openAddGroup = () => {
    setGTitle('');
    setGHref('/');
    setGIcon('');
    setShowAddGroup(true);
  };

  const submitAddGroup = async () => {
    if (!gTitle.trim()) {
      toast.warning('Vui lòng nhập tên nhóm');
      return;
    }
    const href = gHref.trim().startsWith('/') ? gHref.trim() : `/${gHref.trim()}`;
    try {
      setGSaving(true);
      await createParentService(gTitle.trim(), href, gIcon || undefined);
      toast.success(`Đã tạo nhóm "${gTitle.trim()}". Menu cập nhật sau khi gán dịch vụ vào nhóm.`);
      setShowAddGroup(false);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Tạo nhóm thất bại.');
    } finally {
      setGSaving(false);
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
      {showAddGroup && (
        <Modal
          title="Thêm nhóm dịch vụ"
          onClose={() => setShowAddGroup(false)}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowAddGroup(false)} disabled={gSaving}>
                Hủy
              </Button>
              <Button onClick={submitAddGroup} loading={gSaving}>
                Tạo nhóm
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Input
              label="Tên nhóm *"
              value={gTitle}
              onChange={(e) => setGTitle(e.target.value)}
              placeholder="Vd: Sở hữu trí tuệ"
              hint="Hiển thị trên menu."
            />
            <Input
              label="Đường dẫn trang nhóm *"
              value={gHref}
              onChange={(e) => setGHref(e.target.value)}
              placeholder="/dich-vu-doanh-nghiep"
              hint="Chữ thường, không dấu."
            />
            <div>
              <label htmlFor="group-icon" className="block text-sm font-medium text-gray-700 mb-1">
                Biểu tượng
              </label>
              <select
                id="group-icon"
                value={gIcon}
                onChange={(e) => setGIcon(e.target.value)}
                className="w-full rounded-control border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-goldDark"
              >
                <option value="">— Không dùng icon —</option>
                {iconOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Modal>
      )}
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
              onClick={openAddGroup}
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
