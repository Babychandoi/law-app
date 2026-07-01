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
import { Link } from 'react-router-dom';

const services = [
  {
    title: 'Đăng ký nhãn hiệu',
    description: 'Tra cứu khả năng bảo hộ, chuẩn bị và theo dõi hồ sơ nhãn hiệu.',
    href: '/dang-ky-bao-ho-nhan-hieu',
    icon: Shield,
    group: 'Bảo hộ tài sản trí tuệ',
  },
  {
    title: 'Đăng ký bản quyền',
    description: 'Bảo vệ tác phẩm, phần mềm, hình ảnh và nội dung sáng tạo.',
    href: '/dang-ky-bao-ho-ban-quyen',
    icon: Copyright,
    group: 'Bảo hộ tài sản trí tuệ',
  },
  {
    title: 'Sáng chế, giải pháp hữu ích',
    description: 'Bảo hộ giải pháp kỹ thuật, quy trình và sản phẩm có tính mới.',
    href: '/bao-ho-sang-che-giai-phap-huu-ich',
    icon: Lightbulb,
    group: 'Bảo hộ tài sản trí tuệ',
  },
  {
    title: 'Kiểu dáng công nghiệp',
    description: 'Bảo hộ hình dáng bên ngoài và thiết kế đặc trưng của sản phẩm.',
    href: '/bao-ho-kieu-dang-cong-nghiep',
    icon: Palette,
    group: 'Bảo hộ tài sản trí tuệ',
  },
  {
    title: 'Xử lý xâm phạm',
    description: 'Đánh giá vi phạm và xây dựng phương án xử lý tranh chấp.',
    href: '/xu-ly-xam-pham',
    icon: Sword,
    group: 'Bảo hộ tài sản trí tuệ',
  },
  {
    title: 'Mã số mã vạch',
    description: 'Đăng ký và quản lý mã sản phẩm phục vụ hoạt động kinh doanh.',
    href: '/ma-so-ma-vach',
    icon: Barcode,
    group: 'Pháp lý vận hành doanh nghiệp',
  },
  {
    title: 'Doanh nghiệp khoa học công nghệ',
    description: 'Tư vấn điều kiện và hồ sơ xin giấy chứng nhận phù hợp.',
    href: '/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe',
    icon: Scale,
    group: 'Pháp lý vận hành doanh nghiệp',
  },
  {
    title: 'Soạn thảo hợp đồng',
    description: 'Xây dựng hợp đồng rõ nghĩa, phù hợp giao dịch và giảm rủi ro.',
    href: '/tu-van-soan-thao-hop-dong',
    icon: FileText,
    group: 'Pháp lý vận hành doanh nghiệp',
  },
];

const groups = ['Bảo hộ tài sản trí tuệ', 'Pháp lý vận hành doanh nghiệp'];

export default function LegalServicesSection() {
  return (
    <section className="bg-brand-surface py-16 sm:py-20" aria-labelledby="services-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 border-b border-brand-line pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold text-brand-primaryDark">Dịch vụ pháp lý</p>
            <h2
              id="services-heading"
              className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-gray-950 md:text-4xl"
            >
              Chọn đúng giải pháp cho tài sản và hoạt động kinh doanh
            </h2>
          </div>
          <div className="max-w-2xl lg:justify-self-end">
            <p className="text-base leading-7 text-gray-700">
              Mỗi nhu cầu pháp lý có một lộ trình khác nhau. Bắt đầu từ nhóm dịch vụ phù hợp, hoặc
              liên hệ để đội ngũ Luật Poip Legal giúp xác định bước tiếp theo.
            </p>
            <Link
              to="/dich-vu"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-primaryDark underline decoration-brand-primary decoration-2 underline-offset-4 hover:text-brand-ink"
            >
              Xem toàn bộ phạm vi dịch vụ
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {groups.map((group) => (
            <section key={group} aria-labelledby={`service-group-${group}`}>
              <h3
                id={`service-group-${group}`}
                className="mb-2 text-lg font-semibold text-gray-950"
              >
                {group}
              </h3>
              <div>
                {services
                  .filter((service) => service.group === group)
                  .map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.href}
                        to={service.href}
                        className="group grid min-h-28 grid-cols-[44px_1fr_auto] gap-4 border-b border-brand-line py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primaryDark"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-brand-primaryDark shadow-sm">
                          <Icon size={22} aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-base font-semibold text-gray-950 group-hover:text-brand-primaryDark">
                            {service.title}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-gray-600">
                            {service.description}
                          </span>
                        </span>
                        <ArrowRight
                          size={18}
                          className="mt-1 text-brand-primaryDark transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
