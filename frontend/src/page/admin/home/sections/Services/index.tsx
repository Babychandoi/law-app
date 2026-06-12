import { ExternalLink, Layers, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import {
  AdminChildrenService,
  deleteService,
  getAllChildrenServices,
} from '../../../../../service/admin';
import ServiceEditor from './ServiceEditor';

/**
 * Quản lý dịch vụ (CMS): thêm/sửa/xóa dịch vụ và toàn bộ nội dung trang
 * (hero, sections, quy trình, bảng giá) — không cần sửa code.
 */
const ServiceManager: React.FC = () => {
  const [services, setServices] = useState<AdminChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminChildrenService | 'new' | null>(null);

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

  const handleDelete = async (service: AdminChildrenService) => {
    const confirm = await Swal.fire({
      icon: 'warning',
      title: `Xóa dịch vụ "${service.title}"?`,
      text: 'Toàn bộ nội dung trang (hero, quy trình, bảng giá, sections) sẽ bị xóa vĩnh viễn.',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#dc2626',
    });
    if (!confirm.isConfirmed) return;
    try {
      await deleteService(service.id);
      toast.success('Đã xóa dịch vụ.');
      fetchServices();
    } catch {
      toast.error('Xóa thất bại. Vui lòng thử lại.');
    }
  };

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
            <Layers className="h-5 w-5 text-amber-700" />
            Quản lý dịch vụ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Thêm dịch vụ mới hoặc sửa nội dung trang — trang web cập nhật ngay, không cần sửa code.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="inline-flex items-center gap-2 rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800"
        >
          <Plus className="h-4 w-4" />
          Thêm dịch vụ
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
          Chưa có dịch vụ nào. Bấm “Thêm dịch vụ” để tạo trang đầu tiên.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Dịch vụ</th>
                <th className="px-4 py-3 font-semibold">Đường dẫn trang</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-700 hover:underline"
                    >
                      {service.href}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(service)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 font-semibold text-gray-700 hover:border-amber-600 hover:text-amber-700"
                      >
                        <Pencil className="h-4 w-4" />
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(service)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 font-semibold text-red-600 hover:border-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
