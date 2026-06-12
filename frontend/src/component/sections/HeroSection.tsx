import React from 'react';
import { Scale } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => (
  <section className="border-b border-white/10 bg-brand-ink py-16 text-white sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-brand-gold">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5">
          <Scale size={20} aria-hidden="true" />
        </span>
        <span>{subtitle}</span>
      </div>
      <h1 className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-white md:text-5xl lg:text-6xl">
        {title}
      </h1>
    </div>
  </section>
);

export default HeroSection;
