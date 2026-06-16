import { CheckCircle2, ChevronDown, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import HeroService from '../../component/service/HeroService';
import PricingComponent from '../../component/service/UniversalPricing';
import { UniversalProcess } from '../../component/service/UniversalProcess';
import { ServicePageData, ServiceSection } from '../../types/servicePage';

/**
 * Phần thân trang dịch vụ (hero + sections + quy trình + bảng giá).
 * Dùng chung cho trang public (DynamicServicePage) và preview trong admin.
 */
export default function ServicePageView({ data }: { data: ServicePageData }) {
  const hero = data.hero;
  const sections = data.sections ?? [];
  const process = data.process ?? [];
  const pricing = data.pricing ?? [];
  const processLayout = process.some((p) => p.details && p.details.length > 0)
    ? 'detailed'
    : 'simple';

  return (
    <div>
      <HeroService
        title={hero?.title || data.title}
        subtitle={hero?.subtitle || 'Poip Law'}
        description={hero?.description || data.description}
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

/** info: đoạn văn + ảnh tùy chọn; danh sách kèm theo hiển thị dạng thẻ căn giữa */
function InfoSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  const hasImage = !!section.image;
  const items = section.items ?? [];
  return (
    <SectionShell section={section} alt={alt}>
      <div
        className={
          hasImage && section.content
            ? 'mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2'
            : 'mx-auto max-w-3xl'
        }
      >
        {section.content && (
          <div>
            <Paragraphs text={section.content} />
          </div>
        )}
        {hasImage && (
          <div className="flex justify-center">
            <img
              src={section.image}
              alt={section.title || ''}
              className="max-h-[420px] w-auto max-w-full rounded-lg border border-brand-line bg-white object-contain p-2"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
      </div>
      {items.length > 0 && (
        <div
          className={`mx-auto flex max-w-5xl flex-wrap justify-center gap-4 ${section.content || hasImage ? 'mt-8' : ''}`}
        >
          {items.map((item, i) => (
            <div
              key={item.id || i}
              className={`flex w-full items-start gap-3 rounded-lg border border-brand-line p-4 sm:w-[calc(50%-0.5rem)] ${alt ? 'bg-brand-surface' : 'bg-white'}`}
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-goldDark"
                aria-hidden="true"
              />
              <div>
                {item.title && <h3 className="font-semibold text-brand-ink">{item.title}</h3>}
                {item.description && (
                  <p className={`text-sm leading-6 text-brand-muted ${item.title ? 'mt-1' : ''}`}>
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionShell>
  );
}

/** benefits: thẻ lợi ích — flex căn giữa nên item lẻ/đơn vẫn cân */
function BenefitsSection({ section, alt }: { section: ServiceSection; alt: boolean }) {
  return (
    <SectionShell section={section} alt={alt}>
      <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-5">
        {(section.items ?? []).map((item, i) => (
          <div
            key={item.id || i}
            className={`flex w-full gap-4 rounded-lg border border-brand-line p-5 sm:w-[calc(50%-0.625rem)] ${alt ? 'bg-brand-surface' : 'bg-white'}`}
          >
            <ShieldCheck
              className="mt-0.5 h-6 w-6 shrink-0 text-brand-goldDark"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-semibold text-brand-ink">{item.title}</h3>
              {item.description && (
                <p className="mt-2 text-[15px] leading-7 text-brand-muted">{item.description}</p>
              )}
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
