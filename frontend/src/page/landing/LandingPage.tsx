import { CheckCircle2, ChevronDown, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { contactInfo } from '../../shared/config/site';
import LandingForm from './components/LandingForm';
import { getLandingConfig } from './data/landingData';
import { initLandingTracking, trackLead } from './tracking';

export default function LandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const config = getLandingConfig(slug);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    initLandingTracking();
  }, []);

  useEffect(() => {
    if (config) document.title = `${config.eyebrow} | Luật Poip Legal`;
  }, [config]);

  if (!config) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-brand-surface px-6 text-center">
        <h1 className="text-2xl font-semibold text-brand-ink">Không tìm thấy trang</h1>
        <a href="/" className="text-brand-goldDark underline">
          Về trang chủ Luật Poip Legal
        </a>
      </div>
    );
  }

  const scrollToForm = () => {
    document
      .getElementById('lead-form-top')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="landing-page bg-brand-surface pb-20 lg:pb-0">
      {/* Thanh trên cùng — chỉ logo + hotline, không nav để giữ khách trên trang */}
      <header className="border-b border-brand-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold tracking-tight text-brand-ink">
            Luật <span className="text-brand-goldDark">Poip Legal</span>
          </span>
          <a
            href={contactInfo.phoneHref}
            onClick={() => trackLead(`${config.slug}-header-call`)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark"
          >
            <Phone size={16} aria-hidden="true" />
            {contactInfo.hotline}
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-brand-ink text-white">
        <div className="landing-hero-inner mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="lg:pt-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">
              {config.eyebrow}
            </p>
            <h1 className="landing-hero-title mt-4 text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance md:text-5xl">
              {config.heroTitle} <span className="text-brand-gold">{config.heroHighlight}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/80">{config.heroSubtitle}</p>

            <ul className="mt-7 space-y-3">
              {config.heroPoints.map((point) => (
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

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={contactInfo.phoneHref}
                onClick={() => trackLead(`${config.slug}-hero-call`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-ink"
              >
                <Phone size={18} aria-hidden="true" />
                Gọi {contactInfo.hotline}
              </a>
              <a
                href={contactInfo.zaloHref}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackLead(`${config.slug}-hero-zalo`)}
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
              source={config.slug}
              serviceTitleMatch={config.serviceTitleMatch}
            />
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-brand-ink md:text-3xl text-balance">
          {config.benefitsTitle}
        </h2>
        <div className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {config.benefits.map((b) => (
            <div key={b.title} className="flex gap-4">
              <ShieldCheck
                className="mt-0.5 h-6 w-6 shrink-0 text-brand-goldDark"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-semibold text-brand-ink">{b.title}</h3>
                <p className="mt-2 text-[15px] leading-7 text-brand-muted">{b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STEPS */}
      <section className="border-y border-brand-line bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold leading-tight text-brand-ink md:text-3xl">
            {config.stepsTitle}
          </h2>
          <ol className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {config.steps.map((s, i) => (
              <li key={s.title} className="border-t-2 border-brand-gold pt-4">
                <span className="text-sm font-semibold text-brand-goldDark">Bước {i + 1}</span>
                <h3 className="mt-1 font-semibold text-brand-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-brand-muted">{s.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold leading-tight text-brand-ink md:text-3xl">
          {config.faqTitle}
        </h2>
        <div className="mt-8 divide-y divide-brand-line border-y border-brand-line">
          {config.faqs.map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={f.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-semibold text-brand-ink">{f.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-goldDark transition-transform ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {open && <p className="pb-5 text-[15px] leading-7 text-brand-muted">{f.answer}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA CUỐI */}
      <section className="bg-brand-ink text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold leading-tight md:text-3xl text-balance">
              {config.finalCtaTitle}
            </h2>
            <p className="mt-4 max-w-lg leading-8 text-white/80">{config.finalCtaSubtitle}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-brand-ink"
              >
                Để lại thông tin tư vấn
              </button>
              <a
                href={contactInfo.phoneHref}
                onClick={() => trackLead(`${config.slug}-final-call`)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone size={18} aria-hidden="true" />
                Gọi {contactInfo.hotline}
              </a>
            </div>
          </div>
          <LandingForm
            source={`${config.slug}-final`}
            serviceTitleMatch={config.serviceTitleMatch}
          />
        </div>
      </section>

      {/* STICKY BAR MOBILE — luôn hiện nút Gọi + Zalo */}
      <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-brand-line bg-white lg:hidden">
        <a
          href={contactInfo.phoneHref}
          onClick={() => trackLead(`${config.slug}-sticky-call`)}
          className="flex min-h-14 items-center justify-center gap-2 text-sm font-semibold text-brand-goldDark"
        >
          <Phone size={18} aria-hidden="true" />
          Gọi ngay
        </a>
        <a
          href={contactInfo.zaloHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackLead(`${config.slug}-sticky-zalo`)}
          className="flex min-h-14 items-center justify-center gap-2 bg-brand-goldDark text-sm font-semibold text-white"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Nhắn Zalo
        </a>
      </div>
    </div>
  );
}
