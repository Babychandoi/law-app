import { Award, BookOpen, CheckCircle, Users } from 'lucide-react';
import { TeamSectionProps } from '../types';

const TeamSection = ({ title, content, image }: TeamSectionProps) => {
  const strengths = [
    { label: 'Đội ngũ chuyên nghiệp', icon: Users },
    { label: 'Giàu kinh nghiệm', icon: Award },
    { label: 'Cập nhật kiến thức', icon: BookOpen },
  ];

  return (
    <section className="bg-white py-14 sm:py-16" aria-labelledby="about-team-title">
      <div className="container mx-auto grid items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <img
          src={image}
          alt="Đội ngũ chuyên gia của Luật Poip"
          className="h-80 w-full rounded-lg border border-brand-line object-cover shadow-sm md:h-[30rem]"
          loading="lazy"
          decoding="async"
        />

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-goldDark">
            Chuyên môn thực tiễn
          </p>
          <h2 id="about-team-title" className="text-3xl font-semibold leading-tight text-brand-ink">
            {title}
          </h2>
          <div className="mt-6 space-y-4">
            {content.map((paragraph) => (
              <div key={paragraph} className="flex gap-3">
                <CheckCircle
                  className="mt-1 h-5 w-5 flex-none text-brand-goldDark"
                  aria-hidden="true"
                />
                <p className="leading-7 text-brand-muted">{paragraph}</p>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid gap-3 sm:grid-cols-3">
            {strengths.map(({ label, icon: Icon }) => (
              <li key={label} className="rounded-lg border border-brand-line bg-brand-surface p-4">
                <Icon className="h-5 w-5 text-brand-goldDark" aria-hidden="true" />
                <span className="mt-3 block text-sm font-semibold leading-5 text-brand-ink">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
