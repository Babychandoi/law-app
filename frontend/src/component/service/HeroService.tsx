import React from 'react';
import { ArrowRight, Mail, Phone, Scale } from 'lucide-react';

export interface HeroSectionProps {
  title: string;
  subtitle: string;
  description?: string;
  showCTA?: boolean;
  ctaText?: string;
  onCTAClick?: () => void;
  showContactInfo?: boolean;
  phone?: string;
  email?: string;
  backgroundGradient?: string;
  icon?: React.ReactNode;
  enableAnimations?: boolean;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  showCTA = false,
  ctaText = 'Liên hệ tư vấn',
  onCTAClick,
  showContactInfo = false,
  phone,
  email,
  icon,
}: HeroSectionProps) {
  const handleCTAClick = () => {
    if (onCTAClick) {
      onCTAClick();
      return;
    }

    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="public-page-hero border-b border-white/10 bg-brand-ink py-16 text-white sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="max-w-4xl">
          <div className="mb-5 flex items-center gap-3 text-sm font-semibold text-brand-gold">
            <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/5">
              {icon || <Scale size={20} aria-hidden="true" />}
            </span>
            <span>{subtitle}</span>
          </div>
          <h1 className="public-page-hero-title text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-white md:text-5xl lg:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              {description}
            </p>
          )}

          {showContactInfo && (phone || email) && (
            <div className="mt-7 flex flex-col gap-3 text-sm sm:flex-row">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="inline-flex min-h-11 items-center gap-2 text-white underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold"
                >
                  <Phone size={17} aria-hidden="true" />
                  {phone}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex min-h-11 items-center gap-2 text-white underline decoration-brand-gold decoration-2 underline-offset-4 hover:text-brand-gold"
                >
                  <Mail size={17} aria-hidden="true" />
                  {email}
                </a>
              )}
            </div>
          )}
        </div>

        {showCTA && (
          <button
            type="button"
            onClick={handleCTAClick}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-gold"
          >
            {ctaText}
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
}
