import { Button, Input, Badge, PageHeader, type BadgeColor } from '../../component/common/ui';
import { textOn } from '../../shared/utils/contrast';

/**
 * Trang PREVIEW cho kiểm thử a11y offline (không cần backend/đăng nhập).
 * Gom các nguyên thủy UI dùng chung + chip màu CRM để axe-core quét tương phản màu
 * ngay trong CI (cổng chặn PR) mà không phụ thuộc dữ liệu prod.
 * Chỉ truy cập trực tiếp qua URL `/2025/luatpoip/_a11y`; không có liên kết điều hướng tới đây.
 */

// Màu seed trạng thái + tag CRM (đồng bộ với CrmSeedRunner) — chip tự chọn màu chữ theo WCAG.
const CHIP_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#9CA3AF', '#EF4444', '#3F3F46'];
const BADGE_COLORS: BadgeColor[] = ['gold', 'green', 'red', 'gray', 'blue', 'yellow'];

export default function A11yPreview() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          title="A11y Preview"
          subtitle="Trang nội bộ để axe-core quét tương phản màu trong CI"
          breadcrumb={[{ label: 'Nội bộ' }, { label: 'A11y' }]}
        />

        <section aria-label="Nút">
          <h2 className="mb-2 text-sm font-semibold text-brand-ink">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Chính</Button>
            <Button variant="secondary">Phụ</Button>
            <Button variant="ghost">Mờ</Button>
            <Button variant="danger">Xóa</Button>
            <button className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white">
              Gửi email
            </button>
          </div>
        </section>

        <section aria-label="Nhập liệu">
          <h2 className="mb-2 text-sm font-semibold text-brand-ink">Inputs</h2>
          <label htmlFor="a11y-in" className="mb-1 block text-sm text-brand-muted">
            Ô nhập ví dụ
          </label>
          <Input id="a11y-in" placeholder="Nhập nội dung…" defaultValue="Nội dung mẫu" />
        </section>

        <section aria-label="Nhãn Badge">
          <h2 className="mb-2 text-sm font-semibold text-brand-ink">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {BADGE_COLORS.map((c) => (
              <Badge key={c} color={c}>
                {c}
              </Badge>
            ))}
          </div>
        </section>

        <section aria-label="Chip màu CRM">
          <h2 className="mb-2 text-sm font-semibold text-brand-ink">
            CRM chips (màu chữ tự chọn theo WCAG)
          </h2>
          <div className="flex flex-wrap gap-2">
            {CHIP_COLORS.map((bg) => (
              <span
                key={bg}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: bg, color: textOn(bg) }}
              >
                {bg}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm">
            <span className="font-medium text-red-600">Quá hạn</span> — màu cảnh báo trên nền trắng.
          </p>
        </section>
      </div>
    </div>
  );
}
