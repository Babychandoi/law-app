import { CheckCircle, FileText, Shield, Users } from 'lucide-react';
import { ServicesSectionProps } from '../types';

const icons = [Shield, FileText, Users];

const ServicesSection = ({ title, services, image }: ServicesSectionProps) => (
  <section className="bg-brand-surface py-14 sm:py-16" aria-labelledby="about-services-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-goldDark">
          Phạm vi hỗ trợ
        </p>
        <h2
          id="about-services-title"
          className="text-3xl font-semibold leading-tight text-brand-ink"
        >
          {title}
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="grid gap-5">
          {services.map((service, index) => {
            const Icon = icons[index] || Shield;
            return (
              <article
                key={service.title}
                className="rounded-lg border border-brand-line bg-white p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-surface text-brand-goldDark">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-brand-ink">{service.title}</h3>
                </div>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {service.items.map((item) => (
                    <li key={item} className="flex gap-2 text-sm leading-6 text-brand-muted">
                      <CheckCircle
                        className="mt-1 h-4 w-4 flex-none text-brand-goldDark"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <aside className="overflow-hidden rounded-lg border border-brand-line bg-white">
          <img
            src={image}
            alt="Tư vấn các nhóm dịch vụ pháp lý tại Luật Poip"
            className="h-72 w-full object-cover lg:h-[calc(100%-7rem)]"
            loading="lazy"
            decoding="async"
          />
          <div className="grid grid-cols-2 border-t border-brand-line">
            <div className="p-5">
              <strong className="block text-2xl font-semibold text-brand-goldDark">10+</strong>
              <span className="text-sm text-brand-muted">Năm kinh nghiệm</span>
            </div>
            <div className="border-l border-brand-line p-5">
              <strong className="block text-2xl font-semibold text-brand-goldDark">1000+</strong>
              <span className="text-sm text-brand-muted">Khách hàng tin tưởng</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>
);

export default ServicesSection;
