import { ExternalLink, Eye, EyeOff, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../../../../../component/common/Modal';
import {
  Badge,
  Button,
  DataTable,
  PageHeader,
  useConfirm,
  type Column,
} from '../../../../../component/common/ui';
import { AdminChildrenService, getAllChildrenServices } from '../../../../../service/admin';
import {
  createLandingPage,
  deleteLandingPage,
  getLandingPages,
  updateLandingPage,
} from '../../../../../service/landing';
import { LandingPageConfig } from '../../../../../types/landing';
import LandingEditor from './LandingEditor';

/**
 * Quản lý landing page chạy ads. Nội dung thân trang không sửa ở đây — landing lấy thẳng nội dung
 * trang dịch vụ tương ứng, nên muốn đổi nội dung thì sửa ở mục "Dịch vụ".
 */
const LandingManager: React.FC = () => {
  const [pages, setPages] = useState<LandingPageConfig[]>([]);
  const [services, setServices] = useState<AdminChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<LandingPageConfig | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newServiceId, setNewServiceId] = useState('');
  const [creating, setCreating] = useState(false);
  const { confirm, confirmDialog } = useConfirm();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [landingRes, serviceRes] = await Promise.all([
        getLandingPages(),
        getAllChildrenServices(),
      ]);
      setPages(landingRes.data || []);
      setServices(serviceRes.data || []);
    } catch {
      toast.error('Không thể tải danh sách landing page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Dịch vụ chưa có landing — chỉ những dịch vụ này mới tạo thêm được (mỗi dịch vụ một landing).
  const servicesWithoutLanding = services.filter((s) => !pages.some((p) => p.serviceId === s.id));

  const togglePublish = async (page: LandingPageConfig) => {
    if (page.published) {
      const ok = await confirm({
        title: `Gỡ landing "/lp/${page.slug}"?`,
        message:
          'Khách bấm vào link quảng cáo đang chạy sẽ thấy trang "Không tìm thấy". Chỉ gỡ khi đã tắt chiến dịch.',
        confirmText: 'Gỡ xuất bản',
        variant: 'danger',
      });
      if (!ok) return;
    }
    try {
      setBusyId(page.id);
      const res = await updateLandingPage(page.id, { published: !page.published });
      setPages((prev) => prev.map((p) => (p.id === page.id ? res.data : p)));
      toast.success(page.published ? 'Đã gỡ xuất bản.' : 'Đã xuất bản landing page.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Cập nhật thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (page: LandingPageConfig) => {
    const ok = await confirm({
      title: `Xóa landing "/lp/${page.slug}"?`,
      message: 'Cấu hình landing sẽ mất. Dịch vụ và nội dung trang dịch vụ vẫn giữ nguyên.',
      confirmText: 'Xóa',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      setBusyId(page.id);
      await deleteLandingPage(page.id);
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      toast.success('Đã xóa landing page.');
    } catch {
      toast.error('Xóa thất bại. Vui lòng thử lại.');
    } finally {
      setBusyId(null);
    }
  };

  const submitCreate = async () => {
    if (!newServiceId) {
      toast.warning('Vui lòng chọn dịch vụ');
      return;
    }
    try {
      setCreating(true);
      const res = await createLandingPage({ serviceId: newServiceId });
      setPages((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewServiceId('');
      toast.success('Đã tạo landing nháp. Bấm "Sửa" để chỉnh nội dung rồi xuất bản.');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Tạo landing thất bại.');
    } finally {
      setCreating(false);
    }
  };

  const columns: Column<LandingPageConfig>[] = [
    {
      key: 'slug',
      header: 'Đường dẫn landing',
      sortable: true,
      render: (page) =>
        page.published ? (
          <a
            href={`/lp/${page.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-brand-goldDark hover:underline"
          >
            /lp/{page.slug}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : (
          <span className="font-semibold text-gray-500">/lp/{page.slug}</span>
        ),
    },
    {
      key: 'serviceTitle',
      header: 'Lead về dịch vụ',
      sortable: true,
      render: (page) => (
        <div>
          <div className="font-medium text-gray-900">{page.serviceTitle}</div>
          <div className="text-xs text-gray-500">{page.serviceHref}</div>
        </div>
      ),
    },
    {
      key: 'published',
      header: 'Trạng thái',
      sortable: true,
      render: (page) =>
        page.published ? <Badge color="green">Đang chạy</Badge> : <Badge color="gray">Nháp</Badge>,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      align: 'right',
      hideable: false,
      render: (page) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={page.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            loading={busyId === page.id}
            onClick={() => togglePublish(page)}
          >
            {page.published ? 'Gỡ' : 'Xuất bản'}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setEditing(page)}
          >
            Sửa
          </Button>
          <Button
            size="sm"
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            loading={busyId === page.id}
            onClick={() => handleDelete(page)}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  if (editing) {
    return (
      <LandingEditor
        page={editing}
        onClose={(saved) => {
          setEditing(null);
          if (saved) setPages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        }}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {confirmDialog}
      {showCreate && (
        <Modal
          title="Thêm landing page"
          onClose={() => setShowCreate(false)}
          size="md"
          footer={
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={creating}>
                Hủy
              </Button>
              <Button onClick={submitCreate} loading={creating}>
                Tạo landing nháp
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="landing-service"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dịch vụ thu lead *
              </label>
              <select
                id="landing-service"
                value={newServiceId}
                onChange={(e) => setNewServiceId(e.target.value)}
                className="w-full rounded-control border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-goldDark"
              >
                <option value="">— Chọn dịch vụ —</option>
                {servicesWithoutLanding.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Chỉ hiện dịch vụ chưa có landing. Mỗi dịch vụ có tối đa một landing page.
              </p>
            </div>
          </div>
        </Modal>
      )}

      <PageHeader
        className="mb-6"
        icon={Megaphone}
        title="Quản lý landing page"
        subtitle="Trang chạy quảng cáo cho từng dịch vụ. Nội dung lấy thẳng từ trang dịch vụ — sửa nội dung ở mục “Dịch vụ”, ở đây chỉ đặt đường dẫn, câu chữ quanh form và bật/tắt."
        breadcrumb={[{ label: 'Quản trị hệ thống' }, { label: 'Landing page' }]}
        actions={
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreate(true)}
            disabled={servicesWithoutLanding.length === 0}
          >
            Thêm landing
          </Button>
        }
      />

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <DataTable
          columns={columns}
          data={pages}
          rowKey={(p) => p.id}
          loading={loading}
          urlKey="lp"
          tableId="landing-pages"
          searchable
          searchPlaceholder="Tìm theo đường dẫn hoặc dịch vụ..."
          searchText={(p) => `${p.slug} ${p.serviceTitle} ${p.serviceHref}`}
          pageSize={10}
          emptyIcon={Megaphone}
          emptyTitle="Chưa có landing page nào"
          emptyDescription="Landing được sinh tự động khi thêm dịch vụ mới, hoặc bấm “Thêm landing”."
        />
      </div>
    </div>
  );
};

export default LandingManager;
