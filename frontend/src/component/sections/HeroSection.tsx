import React from 'react';
import { Scale } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ title, subtitle }) => (
  <section className="public-page-hero border-b border-brand-line bg-brand-surface py-16 text-brand-ink sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-brand-primaryDark">
        <span className="flex h-10 w-10 items-center justify-center rounded-md border border-brand-line bg-white">
          <Scale size={20} aria-hidden="true" />
        </span>
        <span>{subtitle}</span>
      </div>
      <h1 className="public-page-hero-title max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-brand-ink md:text-5xl lg:text-6xl">
        {title}
      </h1>
    </div>
  </section>
);

export default HeroSection;
