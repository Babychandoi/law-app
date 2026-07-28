import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactInfo } from '../../shared/config/site';

const benefits = [
  {
    title: 'Hiểu vấn đề trước khi đề xuất',
    description: 'Làm rõ mục tiêu, rủi ro và phạm vi công việc trước khi triển khai hồ sơ.',
  },
  {
    title: 'Lộ trình và đầu việc minh bạch',
    description: 'Biết cần chuẩn bị gì, quy trình diễn ra thế nào và bước nào cần quyết định.',
  },
  {
    title: 'Đồng hành trong suốt quá trình',
    description: 'Theo dõi tiến độ, phản hồi câu hỏi và cập nhật khi hồ sơ có thay đổi.',
  },
];

export default function TrustSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="trust-heading">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16">
        <div className="relative">
          <img
            src="/assets/images/law-team.webp"
            width="960"
            height="720"
            alt="Đội ngũ Luật Poip Legal trao đổi phương án pháp lý"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
          />
          <div className="border border-t-0 border-brand-line bg-brand-surface p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 shrink-0 text-brand-goldDark"
                aria-hidden="true"
              />
              <p className="text-sm leading-6 text-gray-700">
                Mục tiêu của mỗi buổi tư vấn là giúp khách hàng hiểu rõ lựa chọn và tự tin quyết
                định bước tiếp theo.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-goldDark">Vì sao chọn Luật Poip Legal</p>
          <h2
            id="trust-heading"
            className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-gray-950 md:text-4xl"
          >
            Chuyên môn pháp lý đi cùng hướng dẫn thực tế
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-700">
            Luật Poip Legal không chỉ xử lý thủ tục. Đội ngũ tập trung giúp khách hàng hiểu rủi ro,
            chuẩn bị đúng tài liệu và theo dõi công việc một cách chủ động.
          </p>

          <div className="mt-8 divide-y divide-brand-line border-y border-brand-line">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="grid grid-cols-[24px_1fr] gap-3 py-5">
                <CheckCircle2 size={20} className="mt-0.5 text-brand-goldDark" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-gray-950">{benefit.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/ve-chung-toi"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-ink px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-black"
            >
              Tìm hiểu về Luật Poip Legal
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-brand-gold hover:text-brand-goldDark"
            >
              <Phone size={17} aria-hidden="true" />
              Gọi tư vấn
            </a>
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition-colors hover:border-brand-gold hover:text-brand-goldDark"
            >
              <MessageCircle size={17} aria-hidden="true" />
              Nhắn Zalo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
