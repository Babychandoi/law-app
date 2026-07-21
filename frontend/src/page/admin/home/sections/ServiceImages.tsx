import { ImageIcon, Loader2, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  AdminChildrenService,
  getAllChildrenServices,
  updateServiceImage,
  uploadFile,
} from '../../../../service/admin';

const ServiceImages: React.FC = () => {
  const [services, setServices] = useState<AdminChildrenService[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fetchServices = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await getAllChildrenServices();
      setServices(res.data || []);
    } catch {
      toast.error('Không thể tải danh sách dịch vụ');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    service: AdminChildrenService
  ) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset để chọn lại cùng file được
    if (!file) return;

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.type)) {
      toast.error('Chỉ chấp nhận ảnh JPG, PNG, WebP, GIF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ảnh quá lớn (tối đa 5MB). Hãy nén ảnh trước khi tải lên.');
      return;
    }

    try {
      setUploadingId(service.id);
      const uploadRes = await uploadFile(file);
      await updateServiceImage(service.id, uploadRes.data);
      await fetchServices(true); // lấy lại URL ảnh chuẩn từ backend, không nháy loading
      toast.success(`Đã cập nhật ảnh cho "${service.title}".`);
    } catch {
      toast.error('Cập nhật ảnh thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
          <ImageIcon className="h-5 w-5 text-amber-700" />
          Ảnh dịch vụ
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Tải ảnh mới để thay ảnh hiển thị của từng dịch vụ. Nên nén ảnh (WebP, &lt; 200KB) trước
          khi tải để trang tải nhanh.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-gray-500">
          Chưa có dịch vụ nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const uploading = uploadingId === service.id;
            return (
              <div
                key={service.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <div className="relative h-40 w-full bg-gray-100">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 font-semibold text-gray-900">{service.title}</h3>
                  <label
                    className={`mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors ${
                      uploading
                        ? 'cursor-not-allowed bg-gray-400'
                        : 'bg-amber-700 hover:bg-amber-800'
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Đang tải...' : 'Đổi ảnh'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleFileChange(e, service)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ServiceImages;
