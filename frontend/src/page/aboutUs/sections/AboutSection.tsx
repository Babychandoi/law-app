import { CheckCircle } from 'lucide-react';
import { AboutSectionProps } from '../types';

const AboutSection = ({ title, content, image }: AboutSectionProps) => (
  <section className="bg-white py-14 sm:py-16" aria-labelledby="about-section-title">
    <div className="container mx-auto grid items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
      <img
        src={image}
        alt="Đội ngũ Luật Poip tư vấn sở hữu trí tuệ"
        className="h-80 w-full rounded-lg border border-brand-line object-cover shadow-sm md:h-[28rem]"
        loading="lazy"
        decoding="async"
      />

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-goldDark">
          Năng lực đại diện
        </p>
        <h2
          id="about-section-title"
          className="text-3xl font-semibold leading-tight text-brand-ink"
        >
          {title}
        </h2>
        <div className="mt-6 space-y-4">
          {content.map((paragraph, index) => (
            <div key={paragraph} className="flex gap-3">
              <CheckCircle
                className="mt-1 h-5 w-5 flex-none text-brand-goldDark"
                aria-hidden="true"
              />
              <p
                className={
                  index < 2
                    ? 'font-semibold leading-7 text-brand-ink'
                    : 'leading-7 text-brand-muted'
                }
              >
                {paragraph}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
