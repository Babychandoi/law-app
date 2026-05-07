import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    id: 'ip',
    title: 'Dịch vụ sở hữu trí tuệ cho doanh nghiệp Việt Nam',
    description:
      'Luật Poip đồng hành trong đăng ký nhãn hiệu, bản quyền, sáng chế và xử lý tranh chấp với quy trình rõ ràng, dễ theo dõi.',
    image: '/assets/images/slide.webp',
    action: 'Đăng ký tư vấn',
    href: '#contact-form',
  },
  {
    id: 'brand',
    title: 'Bảo vệ thương hiệu trước khi ra thị trường',
    description:
      'Tư vấn khả năng bảo hộ, chuẩn bị hồ sơ và theo dõi tiến trình để doanh nghiệp chủ động hơn với tài sản thương hiệu.',
    image: '/assets/images/dangkynhanhieu.webp',
    action: 'Xem dịch vụ nhãn hiệu',
    href: '/dang-ky-bao-ho-nhan-hieu',
  },
  {
    id: 'team',
    title: 'Tư vấn pháp lý thực tế, ngôn ngữ dễ hiểu',
    description:
      'Đội ngũ chuyên môn giúp chuyển vấn đề pháp lý phức tạp thành các bước xử lý cụ thể cho từng tình huống.',
    image: '/assets/images/law-team.webp',
    action: 'Liên hệ ngay',
    href: '/lien-he',
  },
];

export default function Slider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((value) => (value + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[currentSlide];

  const goTo = (href: string) => {
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(href);
  };

  return (
    <section className="relative overflow-hidden bg-brand-ink text-white">
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <img
            key={slide.id}
            src={slide.image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-45' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
      </div>

      <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80">
            <ShieldCheck size={16} className="text-brand-gold" />
            Luật Poip Intellectual Property
          </div>
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
            {activeSlide.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => goTo(activeSlide.href)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand-gold px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-goldDark"
            >
              {activeSlide.action}
              <ArrowRight size={18} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/dich-vu')}
              className="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Xem tất cả dịch vụ
            </button>
          </div>
        </div>

        <div className="hidden rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur lg:block">
          <div className="grid gap-4">
            {[
              ['10+', 'năm kinh nghiệm tư vấn'],
              ['8', 'nhóm dịch vụ trọng tâm'],
              ['24h', 'phản hồi yêu cầu ban đầu'],
            ].map(([value, label]) => (
              <div key={value} className="rounded-md border border-white/10 bg-black/15 p-4">
                <div className="text-3xl font-semibold text-brand-gold">{value}</div>
                <div className="mt-1 text-sm text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
        <button
          type="button"
          onClick={() => setCurrentSlide((value) => (value === 0 ? slides.length - 1 : value - 1))}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white"
          aria-label="Slide trước"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-brand-gold' : 'w-2.5 bg-white/45'
              }`}
              aria-label={`Chọn slide ${index + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCurrentSlide((value) => (value + 1) % slides.length)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-white"
          aria-label="Slide sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}
