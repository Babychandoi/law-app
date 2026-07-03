import { Clock, Cog, FileText, LucideIcon, Search, Upload } from 'lucide-react';
import { ProcessStep } from '../../types/service';

interface ProcessTimelineProps {
  title?: string;
  subtitle?: string;
  steps: ProcessStep[];
  layout?: 'horizontal' | 'vertical';
  showConnectors?: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  search: Search,
  fileText: FileText,
  upload: Upload,
  cog: Cog,
  clock: Clock,
};

const ProcessTimeline = ({
  title = 'THỜI GIAN THỰC HIỆN',
  subtitle,
  steps,
  layout = 'horizontal',
}: ProcessTimelineProps) => (
  <section className="bg-brand-surface py-14 sm:py-16" aria-labelledby="process-timeline-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-white text-brand-goldDark shadow-sm">
          <Clock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2
          id="process-timeline-title"
          className="mt-5 text-3xl font-semibold leading-tight text-brand-ink md:text-4xl"
        >
          {title}
        </h2>
        {subtitle && <p className="mt-4 leading-7 text-brand-muted">{subtitle}</p>}
      </div>

      <ol
        className={
          layout === 'horizontal'
            ? 'grid gap-5 md:grid-cols-2 lg:grid-cols-3'
            : 'mx-auto grid max-w-3xl gap-5'
        }
      >
        {steps.map((step, index) => {
          const Icon = iconMap[step.icon ?? 'clock'] || Clock;
          return (
            <li
              key={`${step.title}-${index}`}
              className="rounded-lg border border-brand-line bg-white p-6"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-surface text-brand-goldDark">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-goldDark">
                    Bước {index + 1}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-brand-ink">{step.title}</h3>
                </div>
              </div>
              {step.duration && (
                <p className="mt-4 inline-flex rounded-full bg-brand-surface px-3 py-1 text-xs font-semibold text-brand-goldDark">
                  {step.duration}
                </p>
              )}
              <p className="mt-4 text-sm leading-6 text-brand-muted">{step.description}</p>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-brand-line bg-white p-6 text-center">
        <h3 className="text-lg font-semibold text-brand-ink">Quy trình minh bạch</h3>
        <p className="mt-2 text-sm leading-6 text-brand-muted">
          Luật Poip Legal cập nhật tiến độ, giải thích từng bước và trao đổi trước khi phát sinh thay đổi.
        </p>
      </div>
    </div>
  </section>
);

export { ProcessTimeline };
