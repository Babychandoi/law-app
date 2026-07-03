import { ArrowRight, Clock } from 'lucide-react';
import { Process } from '../../types/service';

interface UniversalProcessProps {
  title: string;
  subtitle?: string;
  layout?: 'simple' | 'detailed';
  steps: Process[];
}

const UniversalProcess = ({
  title,
  subtitle = '',
  layout = 'simple',
  steps,
}: UniversalProcessProps) => (
  <section className="bg-brand-surface py-14 sm:py-16" aria-labelledby="universal-process-title">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-primaryDark">
          Quy trình thực hiện
        </p>
        <h2
          id="universal-process-title"
          className="text-3xl font-semibold leading-tight text-brand-ink md:text-4xl"
        >
          {title}
        </h2>
        {subtitle && <p className="mt-4 leading-7 text-brand-muted">{subtitle}</p>}
      </div>

      <ol
        className={layout === 'simple' ? 'grid gap-5 md:grid-cols-2 lg:grid-cols-3' : 'grid gap-6'}
      >
        {steps.map((step, index) => (
          <li key={step.id} className="rounded-lg border border-brand-line bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-md bg-brand-surface text-sm font-semibold text-brand-primaryDark">
                {index + 1}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-primaryDark">
                  {step.step}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-brand-ink">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-brand-muted">{step.description}</p>
              </div>
            </div>

            {layout === 'detailed' && step.details && step.details.length > 0 && (
              <ul className="mt-5 grid gap-3 border-t border-brand-line pt-5 md:grid-cols-2">
                {step.details.map((detail, detailIndex) => (
                  <li
                    key={`${detail.type}-${detailIndex}`}
                    className="rounded-md bg-brand-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-brand-ink">{detail.type}</h4>
                      {detail.time && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primaryDark">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {detail.time}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{detail.desc}</p>
                    {detail.accuracy && (
                      <p className="mt-2 text-xs font-semibold text-green-700">{detail.accuracy}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {index < steps.length - 1 && (
              <ArrowRight
                className="mt-5 h-5 w-5 text-brand-primaryDark lg:hidden"
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export { UniversalProcess };
