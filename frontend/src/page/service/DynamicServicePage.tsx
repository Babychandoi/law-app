import { CheckCircle2, ChevronDown, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConsultationForm from '../../component/Consultation';
import { Seo } from '../../component/Seo';
import HeroService from '../../component/service/HeroService';
import PartnersCarousel from '../../component/service/PartnersCarousel';
import PricingComponent from '../../component/service/UniversalPricing';
import { UniversalProcess } from '../../component/service/UniversalProcess';
import { getServicePage } from '../../service/service';
import { ServicePageData, ServiceSection } from '../../types/servicePage';

/**
 * Trang dịch vụ động — render hoàn toàn từ dữ liệu admin nhập.
 * Section nào không có dữ liệu thì tự ẩn.
 */
export default function DynamicServicePage() {
  const { pathname } = useLocation();
  const [page, setPage] = useState<ServicePageData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getServicePage(pathname)
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setPage(res.data);
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      })
      .catch(() => !cancelled && setStatus('notfound'));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'notfound' || !page) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <FileText className="h-10 w-10 text-brand-goldDark" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-brand-ink">Không tìm thấy trang</h1>
        <p className="text-brand-muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
        <Link to="/dich-vu" className="font-semibold text-brand-goldDark underline">
          Xem các dịch vụ của Luật Poip
        </Link>
      </div>
    );
  }

  const hero = page.hero;
  const sections = page.sections ?? [];
  const process = page.process ?? [];
  const pricing = page.pricing ?? [];
  const processLayout = process.some((p) => p.details && p.details.length > 0)
    ? 'detailed'
    : 'simple';

  return (
    <div>
      <Seo
        title={`${page.title} - Luật Poip`}
        description={page.description || hero?.description || page.title}
        keywords={`${page.title}, Luật Poip, sở hữu trí tuệ`}
      />

      <HeroService
        title={hero?.title || page.title}
        subtitle={hero?.subtitle || 'Poip Law'}
        description={hero?.description || page.description}
      />

      {sections.map((section, index) => (
        <SectionRenderer key={section.id || index} section={section} index={index} />
      ))}

      {process.length > 0 && (
        <UniversalProcess title="Quy trình thực hiện" steps={process} layout={processLayout} />
      )}

      {pricing.length > 0 && (
        <PricingComponent
          title="Bảng giá dịch vụ"
          plans={pricing}
          variant={pricing.length === 1 ? 'feature' : 'card'}
        />
      )}

      <ConsultationForm />
      <PartnersCarousel />
    </div>
  );
}

/* ===== Render từng loại section ===== */

function SectionRenderer({ section, index }: { section: ServiceSection; index: number }) {
  const alt = index % 2 === 0; // xen kẽ nền trắng / surface cho nhịp thị giác
  switch (section.type) {
    case 'benefits':
      return <BenefitsSection section={section} alt={alt} />;
    case 'cards':
      return <CardsSection section={section} alt={alt} />;
    case 'conditions':
      return <ConditionsSection section={section} alt={alt} />;
    case 'faq':
      return <FaqSection section={section} />;
    case 'comparison':
      return <ComparisonSection section={section} alt={alt} />;
    case 'info':
    default:
      return <InfoSection section={section} alt={alt} />;
  }
}

function SectionShell({
  section,
  alt,
  children,
}: {
  section: ServiceSection;
  alt: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`${alt ? 'bg-white' : 'bg-brand-surface'} py-14 sm:py-16`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {(section.title || section.subtitle) && (
          <div className="mx-auto mb-10 max-w-3xl text-center">
            {section.title && (
              <h2 className="text-2xl font-semibold leading-tight text-brand-ink md:text-3xl text-balance">
                {section.title}
              </h2>
            )}
            {section.subtitle && section.type !== 'comparison' && (
              <p className="mt-3 leading-7 text-brand-muted">{section.subtitle}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Paragraphs({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <>
      {text
        .split(/\n+/)
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="mt-3 text-base leading-8 text-brand-muted first:mt-0">
            {p}
          </p>
        ))}
    </>
  );
}

/** info: đoạn văn + ảnh tùy chọn */
function InfoSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  const hasImage = !!section.image;
  return (
    <SectionShell section={section} alt={alt}>
      <div className={hasImage ? 'grid items-center gap-10 lg:grid-cols-2' : 'mx-auto max-w-3xl'}>
        <div>
          <Paragraphs text={section.content} />
          {section.items && section.items.length > 0 && (
            <ul className="mt-6 space-y-3">
              {section.items.map((item, i) => (
                <li key={item.id || i} className="flex items-start gap-3">
                  <CheckCircle2
                    className="mt-1 h-5 w-5 shrink-0 text-brand-goldDark"
                    aria-hidden="true"
                  />
                  <span>
                    {item.title && (
                      <strong className="font-semibold text-brand-ink">{item.title}</strong>
                    )}
                    {item.title && item.description ? ' — ' : ''}
                    <span className="text-brand-muted">{item.description}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {hasImage && (
          <img
            src={section.image}
            alt={section.title || ''}
            className="w-full rounded-lg border border-brand-line bg-white object-contain"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    </SectionShell>
  );
}

/** benefits: lưới lợi ích */
function BenefitsSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  return (
    <SectionShell section={section} alt={alt}>
      <div className="mx-auto grid max-w-5xl gap-x-10 gap-y-8 sm:grid-cols-2">
        {(section.items ?? []).map((item, i) => (
          <div key={item.id || i} className="flex gap-4">
            <ShieldCheck
              className="mt-0.5 h-6 w-6 shrink-0 text-brand-goldDark"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-semibold text-brand-ink">{item.title}</h3>
              <p className="mt-2 text-[15px] leading-7 text-brand-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

/** cards: lưới thẻ có ảnh */
function CardsSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  return (
    <SectionShell section={section} alt={alt}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(section.items ?? []).map((item, i) => (
          <article
            key={item.id || i}
            className="overflow-hidden rounded-lg border border-brand-line bg-white"
          >
            {item.image && (
              <img
                src={item.image}
                alt={item.title || ''}
                className="aspect-[16/10] w-full bg-white object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="p-5">
              <h3 className="font-semibold text-brand-ink">{item.title}</h3>
              {item.description && (
                <p className="mt-2 text-sm leading-6 text-brand-muted">{item.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

/** conditions: checklist điều kiện */
function ConditionsSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  return (
    <SectionShell section={section} alt={alt}>
      <div className="mx-auto max-w-3xl">
        <Paragraphs text={section.content} />
        <ol className="mt-6 space-y-4">
          {(section.items ?? []).map((item, i) => (
            <li
              key={item.id || i}
              className="flex gap-4 rounded-lg border border-brand-line bg-white p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-surface text-sm font-semibold text-brand-goldDark">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-brand-ink">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm leading-6 text-brand-muted">{item.description}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}

/** faq: hỏi đáp accordion */
function FaqSection({ section }: { section: ServiceSection }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-2xl font-semibold leading-tight text-brand-ink md:text-3xl">
          {section.title || 'Câu hỏi thường gặp'}
        </h2>
        <div className="mt-8 divide-y divide-brand-line border-y border-brand-line">
          {(section.items ?? []).map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.id || i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                >
                  <span className="font-semibold text-brand-ink">{item.title}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-brand-goldDark transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <p className="pb-5 text-[15px] leading-7 text-brand-muted">{item.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** comparison: bảng so sánh 2 cột; tên cột đặt trong subtitle dạng "Cột A|Cột B" */
function ComparisonSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  const [colA, colB] = (section.subtitle || 'Tiêu chí A|Tiêu chí B').split('|');
  return (
    <SectionShell section={section} alt={alt}>
      <div className="mx-auto max-w-5xl overflow-x-auto rounded-lg border border-brand-line bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-line bg-brand-surface text-brand-ink">
              <th className="px-5 py-3.5 font-semibold">Tiêu chí</th>
              <th className="px-5 py-3.5 font-semibold">{colA?.trim()}</th>
              <th className="px-5 py-3.5 font-semibold">{colB?.trim()}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-line">
            {(section.items ?? []).map((item, i) => (
              <tr key={item.id || i}>
                <td className="px-5 py-3.5 font-semibold text-brand-ink">{item.title}</td>
                <td className="px-5 py-3.5 leading-6 text-brand-muted">{item.description}</td>
                <td className="px-5 py-3.5 leading-6 text-brand-muted">{item.secondary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionShell>
  );
}
