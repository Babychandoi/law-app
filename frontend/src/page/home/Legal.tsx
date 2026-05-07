import {
  ArrowRight,
  Barcode,
  Copyright,
  FileText,
  Lightbulb,
  Palette,
  Scale,
  Shield,
  Sword,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const services = [
  {
    title: 'Đăng ký nhãn hiệu',
    description: 'Tra cứu, tư vấn khả năng bảo hộ và theo dõi hồ sơ nhãn hiệu đến khi có kết quả.',
    href: '/dang-ky-bao-ho-nhan-hieu',
    icon: Shield,
  },
  {
    title: 'Đăng ký bản quyền',
    description: 'Bảo vệ tác phẩm, phần mềm, hình ảnh, nội dung sáng tạo và tài sản số.',
    href: '/dang-ky-bao-ho-ban-quyen',
    icon: Copyright,
  },
  {
    title: 'Sáng chế, giải pháp hữu ích',
    description: 'Hỗ trợ bảo hộ ý tưởng kỹ thuật, quy trình và sản phẩm có tính mới.',
    href: '/bao-ho-sang-che-giai-phap-huu-ich',
    icon: Lightbulb,
  },
  {
    title: 'Kiểu dáng công nghiệp',
    description: 'Tư vấn bảo hộ hình dáng bên ngoài của sản phẩm và bộ nhận diện thiết kế.',
    href: '/bao-ho-kieu-dang-cong-nghiep',
    icon: Palette,
  },
  {
    title: 'Xử lý xâm phạm',
    description: 'Đánh giá hành vi vi phạm, chuẩn bị hồ sơ và phương án xử lý tranh chấp.',
    href: '/xu-ly-xam-pham',
    icon: Sword,
  },
  {
    title: 'Mã số mã vạch',
    description: 'Hỗ trợ đăng ký và quản lý mã sản phẩm để vận hành bán hàng chuyên nghiệp.',
    href: '/ma-so-ma-vach',
    icon: Barcode,
  },
  {
    title: 'Doanh nghiệp khoa học công nghệ',
    description: 'Tư vấn điều kiện, hồ sơ và quy trình xin giấy chứng nhận phù hợp.',
    href: '/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe',
    icon: Scale,
  },
  {
    title: 'Soạn thảo hợp đồng',
    description: 'Xây dựng hợp đồng rõ nghĩa, giảm rủi ro và phù hợp thực tế giao dịch.',
    href: '/tu-van-soan-thao-hop-dong',
    icon: FileText,
  },
];

export default function LegalServicesSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-brand-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-goldDark">
              Dịch vụ trọng tâm
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold text-gray-950 md:text-4xl">
              Giải pháp pháp lý rõ ràng cho tài sản trí tuệ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dich-vu')}
            className="inline-flex items-center gap-2 rounded-md border border-brand-line bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-brand-gold hover:text-brand-goldDark"
          >
            Tất cả dịch vụ
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <button
                key={service.href}
                type="button"
                onClick={() => navigate(service.href)}
                className="group rounded-lg border border-brand-line bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-brand-gold hover:shadow-soft"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-brand-surface text-brand-goldDark">
                  <Icon size={23} />
                </div>
                <h3 className="min-h-[48px] text-base font-semibold leading-6 text-gray-950 group-hover:text-brand-goldDark">
                  {service.title}
                </h3>
                <p className="mt-3 min-h-[72px] text-sm leading-6 text-gray-600">
                  {service.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark">
                  Xem chi tiết
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
