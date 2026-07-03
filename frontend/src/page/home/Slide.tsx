import { ArrowRight, CheckCircle2, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { contactInfo } from '../../shared/config/site';

const assurances = [
  'Tư vấn bằng ngôn ngữ rõ ràng, dễ hiểu',
  'Đề xuất lộ trình phù hợp trước khi triển khai',
  'Theo dõi hồ sơ và phản hồi minh bạch',
];

export default function Hero() {
  const scrollToConsultation = () => {
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative isolate overflow-hidden bg-brand-ink text-white">
      <img
        src="/assets/images/slide.webp"
        alt=""
        aria-hidden="true"
        width="1600"
        height="900"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 -z-10 bg-black/55" />

      <div className="public-home-hero-inner mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:py-20">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 border border-white/20 bg-black/25 px-3 py-2 text-sm font-medium text-white/90">
            <ShieldCheck size={17} className="text-brand-gold" aria-hidden="true" />
            Tư vấn sở hữu trí tuệ và pháp lý doanh nghiệp
          </div>

          <h1 className="public-home-hero-title max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-white sm:text-5xl lg:text-6xl">
            Bảo vệ tài sản trí tuệ để doanh nghiệp phát triển vững chắc
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            Luật Poip Legal giúp doanh nghiệp, nhà sáng lập và người sáng tạo xác định đúng phương án,
            chuẩn bị hồ sơ và theo dõi thủ tục pháp lý từ đầu đến kết quả.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={scrollToConsultation}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
            >
              Nhận tư vấn ban đầu
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <Phone size={18} aria-hidden="true" />
              Gọi {contactInfo.hotline}
            </a>
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-black/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Nhắn Zalo
            </a>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-white/80 sm:grid-cols-3">
            {assurances.map((assurance) => (
              <li key={assurance} className="flex items-start gap-2">
                <CheckCircle2
                  size={17}
                  className="mt-0.5 shrink-0 text-brand-gold"
                  aria-hidden="true"
                />
                <span>{assurance}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside
          className="border border-white/20 bg-black/35 p-6 sm:p-7"
          aria-label="Cam kết tư vấn"
        >
          <p className="text-sm font-semibold text-brand-gold">Bắt đầu đúng ngay từ đầu</p>
          <h2 className="mt-3 text-2xl font-semibold leading-snug text-white">
            Chưa chắc dịch vụ nào phù hợp?
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Chia sẻ nhu cầu hiện tại. Đội ngũ Luật Poip Legal sẽ giúp bạn xác định vấn đề, lựa chọn hướng
            xử lý và chuẩn bị bước tiếp theo.
          </p>

          <dl className="mt-7 grid grid-cols-3 border-y border-white/15 py-5 text-center">
            <div>
              <dt className="text-xs leading-5 text-white/65">Kinh nghiệm tư vấn</dt>
              <dd className="mt-1 text-2xl font-semibold text-brand-gold">10+</dd>
            </div>
            <div className="border-x border-white/15 px-2">
              <dt className="text-xs leading-5 text-white/65">Nhóm dịch vụ</dt>
              <dd className="mt-1 text-2xl font-semibold text-brand-gold">8</dd>
            </div>
            <div>
              <dt className="text-xs leading-5 text-white/65">Phản hồi ban đầu</dt>
              <dd className="mt-1 text-2xl font-semibold text-brand-gold">24h</dd>
            </div>
          </dl>

          <Link
            to="/dich-vu"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold"
          >
            Xem tất cả dịch vụ
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
