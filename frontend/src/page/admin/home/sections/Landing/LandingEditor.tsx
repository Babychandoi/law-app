import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Button, Input, PageHeader } from '../../../../../component/common/ui';
import { updateLandingPage } from '../../../../../service/landing';
import { LandingPageConfig } from '../../../../../types/landing';

interface LandingEditorProps {
  page: LandingPageConfig;
  /** Trả về bản đã lưu để danh sách cập nhật ngay, hoặc null nếu người dùng thoát không lưu. */
  onClose: (saved: LandingPageConfig | null) => void;
}

const textareaClass =
  'w-full rounded-control border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-goldDark';

/**
 * Sửa phần riêng của landing: đường dẫn ads, câu chữ hero/form/CTA. Thân trang không nằm ở đây —
 * landing render lại nội dung trang dịch vụ nên muốn đổi phải sửa ở mục "Dịch vụ".
 */
const LandingEditor: React.FC<LandingEditorProps> = ({ page, onClose }) => {
  const [slug, setSlug] = useState(page.slug);
  const [eyebrow, setEyebrow] = useState(page.eyebrow ?? '');
  const [heroPoints, setHeroPoints] = useState<string[]>(page.heroPoints ?? []);
  const [formTitle, setFormTitle] = useState(page.formTitle ?? '');
  const [formSubtitle, setFormSubtitle] = useState(page.formSubtitle ?? '');
  const [finalCtaTitle, setFinalCtaTitle] = useState(page.finalCtaTitle ?? '');
  const [finalCtaSubtitle, setFinalCtaSubtitle] = useState(page.finalCtaSubtitle ?? '');
  const [saving, setSaving] = useState(false);

  const updatePoint = (index: number, value: string) =>
    setHeroPoints((prev) => prev.map((p, i) => (i === index ? value : p)));

  const handleSave = async () => {
    if (!slug.trim()) {
      toast.warning('Vui lòng nhập đường dẫn landing');
      return;
    }
    try {
      setSaving(true);
      const res = await updateLandingPage(page.id, {
        slug: slug.trim(),
        eyebrow: eyebrow.trim(),
        heroPoints: heroPoints.map((p) => p.trim()).filter(Boolean),
        formTitle: formTitle.trim(),
        formSubtitle: formSubtitle.trim(),
        finalCtaTitle: finalCtaTitle.trim(),
        finalCtaSubtitle: finalCtaSubtitle.trim(),
      });
      toast.success('Đã lưu landing page.');
      onClose(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Lưu thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        className="mb-6"
        title={`Landing: ${page.serviceTitle}`}
        subtitle="Nội dung thân trang lấy từ trang dịch vụ. Ở đây chỉ đặt đường dẫn quảng cáo và câu chữ quanh form thu lead."
        breadcrumb={[
          { label: 'Quản trị hệ thống' },
          { label: 'Landing page' },
          { label: page.slug },
        ]}
        actions={
          <>
            <Button
              variant="secondary"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => onClose(null)}
              disabled={saving}
            >
              Quay lại
            </Button>
            <Button leftIcon={<Save className="h-4 w-4" />} onClick={handleSave} loading={saving}>
              Lưu
            </Button>
          </>
        }
      />

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-gray-900">Đường dẫn &amp; dịch vụ</h2>
          <div className="space-y-4">
            <Input
              label="Đường dẫn landing *"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="dang-ky-nhan-hieu"
              hint={`Trang chạy ads sẽ là /lp/${slug || '...'}. Đổi đường dẫn làm hỏng link quảng cáo đang chạy.`}
            />
            <div className="rounded-control border border-gray-200 bg-gray-50 p-3 text-sm">
              <div className="text-gray-700">
                Lead của landing này về dịch vụ{' '}
                <span className="font-semibold text-gray-900">{page.serviceTitle}</span>
              </div>
              <a
                href={page.serviceHref}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-brand-goldDark hover:underline"
              >
                Xem trang dịch vụ {page.serviceHref}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <p className="mt-2 text-xs text-gray-500">
                Muốn đổi hero, phần nội dung, quy trình hay bảng giá của landing thì sửa ở mục “Dịch
                vụ” — landing lấy trực tiếp nội dung đó.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-gray-900">Phần đầu trang</h2>
          <div className="space-y-4">
            <Input
              label="Chữ nhỏ phía trên tiêu đề"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder={page.serviceTitle}
              hint="Bỏ trống thì dùng tên dịch vụ."
            />
            <div>
              <span className="mb-1 block text-sm font-medium text-gray-700">
                Cam kết cạnh form
              </span>
              <div className="space-y-2">
                {heroPoints.map((point, index) => (
                  // Danh sách theo thứ tự người dùng nhập, không có id ổn định nên key theo vị trí.
                  // eslint-disable-next-line react/no-array-index-key
                  <div key={index} className="flex gap-2">
                    <input
                      value={point}
                      onChange={(e) => updatePoint(index, e.target.value)}
                      className={textareaClass}
                      placeholder="Phản hồi trong vòng 24 giờ làm việc"
                      aria-label={`Cam kết ${index + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                      onClick={() => setHeroPoints((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Xóa
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                className="mt-2"
                size="sm"
                variant="secondary"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setHeroPoints((prev) => [...prev, ''])}
              >
                Thêm cam kết
              </Button>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-gray-900">Form thu lead</h2>
          <div className="space-y-4">
            <Input
              label="Tiêu đề form"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Nhận tư vấn miễn phí"
            />
            <Input
              label="Mô tả dưới tiêu đề form"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              placeholder="Điền thông tin, luật sư sẽ gọi lại cho bạn."
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-4 font-semibold text-gray-900">Kêu gọi cuối trang</h2>
          <div className="space-y-4">
            <Input
              label="Tiêu đề"
              value={finalCtaTitle}
              onChange={(e) => setFinalCtaTitle(e.target.value)}
              placeholder={`Nhận tư vấn ${page.serviceTitle} miễn phí`}
            />
            <div>
              <label
                htmlFor="landing-final-subtitle"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Mô tả
              </label>
              <textarea
                id="landing-final-subtitle"
                rows={3}
                value={finalCtaSubtitle}
                onChange={(e) => setFinalCtaSubtitle(e.target.value)}
                className={textareaClass}
                placeholder="Để lại thông tin, luật sư sẽ tư vấn và báo phí trọn gói cho bạn."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingEditor;
