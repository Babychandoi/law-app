import { CheckCircle2, Loader2, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Seo } from '../../component/Seo';
import { getLandingPage } from '../../service/landing';
import { contactInfo } from '../../shared/config/site';
import { LandingPageView } from '../../types/landing';
import ServicePageView from '../service/ServicePageView';
import LandingForm from './components/LandingForm';
import { initLandingTracking, trackLead } from './tracking';

/**
 * Trang landing chạy ads. Thân trang là chính nội dung trang dịch vụ con (ServicePageView) nên hai
 * bên không bao giờ lệch nhau; landing chỉ khác ở chỗ bỏ menu điều hướng và thay bằng form thu lead
 * gắn cứng vào một dịch vụ.
 */
export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [view, setView] = useState<LandingPageView | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    initLandingTracking();
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getLandingPage(slug || '')
      .then((res) => {
        if (cancelled) return;
        if (res.data?.landing && res.data?.page) {
          setView(res.data);
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('notfound');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-surface text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
        <span className="sr-only">Đang tải nội dung</span>
      </div>
    );
  }

  if (status === 'notfound' || !view) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-surface px-6 text-center">
        <Seo title="Không tìm thấy trang -  Poip Legal" noindex />
        <h1 className="text-2xl font-semibold text-brand-ink">Không tìm thấy trang</h1>
        <a href="/" className="text-brand-goldDark underline">
          Về trang chủ Poip Legal
        </a>
      </div>
    );
  }

  const { landing, page } = view;
  const heroTitle = page.hero?.title || page.title;
  const heroSubtitle = page.hero?.description || page.description || '';
  const heroPoints = landing.heroPoints ?? [];

  const scrollToForm = () => {
    document
      .getElementById('lead-form-top')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="landing-page bg-brand-surface pb-20 lg:pb-0">
      {/* Cho index (và có mặt trong sitemap) theo yêu cầu. Lưu ý: thân trang lấy nguyên nội dung
          trang dịch vụ nên hai URL gần như trùng nhau — nếu về sau Google gộp/chọn nhầm trang,
          cách xử lý là viết nội dung riêng cho landing chứ không phải thêm canonical (canonical
          trỏ về trang dịch vụ sẽ khiến landing không bao giờ được xếp hạng). */}
      <Seo
        title={`${landing.eyebrow || landing.serviceTitle} | Poip Legal`}
        description={heroSubtitle || landing.serviceTitle}
      />

      {/* Thanh trên cùng — chỉ logo + hotline, không nav để giữ khách trên trang */}
      <header className="border-b border-brand-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-brand-ink">
            Luật <span className="text-brand-goldDark">Poip Legal</span>
          </span>
          <a
            href={contactInfo.phoneHref}
            onClick={() => trackLead(`${landing.slug}-header-call`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark"
          >
            <Phone size={16} aria-hidden="true" />
            {contactInfo.hotline}
          </a>
        </div>
      </header>

      {/* HERO — thay hero của trang dịch vụ, đặt form ngay cạnh tiêu đề */}
      <section className="bg-brand-ink text-white">
        <div className="landing-hero-inner mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="lg:pt-6">
            {landing.eyebrow && (
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">
                {landing.eyebrow}
              </p>
            )}
            <h1 className="landing-hero-title mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance md:text-5xl">
              {heroTitle}
            </h1>
            {heroSubtitle && (
              <p className="mt-5 max-w-xl text-base leading-8 text-white/80">{heroSubtitle}</p>
            )}

            {heroPoints.length > 0 && (
              <ul className="mt-7 space-y-3">
                {heroPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-white/85">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-brand-gold"
                      size={19}
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={contactInfo.phoneHref}
                onClick={() => trackLead(`${landing.slug}-hero-call`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-ink"
              >
                <Phone size={18} aria-hidden="true" />
                Gọi {contactInfo.hotline}
              </a>
              <a
                href={contactInfo.zaloHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackLead(`${landing.slug}-hero-zalo`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Nhắn Zalo
              </a>
            </div>
          </div>

          <div className="lg:pt-2">
            <LandingForm
              id="lead-form-top"
              source={landing.slug}
              serviceId={landing.serviceId}
              serviceTitle={landing.serviceTitle}
              title={landing.formTitle}
              subtitle={landing.formSubtitle}
            />
          </div>
        </div>
      </section>

      {/* THÂN TRANG — dùng lại y hệt nội dung trang dịch vụ con */}
      <ServicePageView data={page} hideHero hidePricing />

      {/* CTA CUỐI — chỉ nút, không đặt form thứ hai. Một form duy nhất ở hero để khách không
          phải chọn giữa hai chỗ điền giống nhau; nút dưới cuộn ngược lên đúng form đó. */}
      <section className="bg-brand-ink text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold leading-tight md:text-3xl text-balance">
            {landing.finalCtaTitle || `Nhận tư vấn ${landing.serviceTitle} miễn phí`}
          </h2>
          <p className="mx-auto mt-4 max-w-xl leading-8 text-white/80">
            {landing.finalCtaSubtitle ||
              'Để lại thông tin, luật sư sẽ tư vấn và báo phí trọn gói cho bạn.'}
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={scrollToForm}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-ink"
            >
              Để lại thông tin tư vấn
            </button>
            <a
              href={contactInfo.phoneHref}
              onClick={() => trackLead(`${landing.slug}-final-call`)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Phone size={18} aria-hidden="true" />
              Gọi {contactInfo.hotline}
            </a>
          </div>
        </div>
      </section>

      {/* STICKY BAR MOBILE — luôn hiện nút Gọi + Zalo */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-brand-line bg-white lg:hidden">
        <a
          href={contactInfo.phoneHref}
          onClick={() => trackLead(`${landing.slug}-sticky-call`)}
          className="flex min-h-14 items-center justify-center gap-2 text-sm font-semibold text-brand-goldDark"
        >
          <Phone size={18} aria-hidden="true" />
          Gọi ngay
        </a>
        <a
          href={contactInfo.zaloHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackLead(`${landing.slug}-sticky-zalo`)}
          className="flex min-h-14 items-center justify-center gap-2 bg-brand-goldDark text-sm font-semibold text-white"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Nhắn Zalo
        </a>
      </div>
    </div>
  );
}
