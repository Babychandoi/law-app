import React from 'react';

interface SectionProps {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({ id, title, content, icon }) => (
  <section id={id} className="rounded-lg border border-brand-line bg-white p-6">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-surface text-brand-primaryDark">
        {icon}
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-brand-ink">{title}</h2>
        <p className="mt-4 whitespace-pre-line leading-7 text-brand-muted">{content}</p>
      </div>
    </div>
  </section>
);

export default Section;
