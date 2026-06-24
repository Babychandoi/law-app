import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContactSectionProps } from '../types';

const ContactSection = ({ title, buttonText }: ContactSectionProps) => {
  const contactItems = [
    { label: 'Hotline', value: '0947.600.064', href: 'tel:0947600064', icon: Phone },
    { label: 'Email', value: 'luatpoip@gmail.com', href: 'mailto:luatpoip@gmail.com', icon: Mail },
    { label: 'Khu vực hỗ trợ', value: 'Toàn quốc', href: '/lien-he', icon: MapPin },
  ];

  return (
    <section
      className="bg-brand-ink py-14 text-white sm:py-16"
      aria-labelledby="about-contact-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-brand-gold">
            Bắt đầu trao đổi
          </p>
          <h2 id="about-contact-title" className="text-3xl font-semibold leading-tight md:text-4xl">
            {title}
          </h2>
          <p className="mt-4 leading-7 text-gray-300">
            Chia sẻ nhu cầu của bạn để đội ngũ Luật Poip xác định hướng xử lý và bước chuẩn bị phù
            hợp.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          {contactItems.map(({ label, value, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                className="flex h-full items-start gap-4 rounded-lg border border-white/20 p-5 transition-colors duration-200 hover:border-brand-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
              >
                <Icon className="mt-1 h-5 w-5 flex-none text-brand-gold" aria-hidden="true" />
                <span>
                  <span className="block text-sm text-gray-300">{label}</span>
                  <strong className="mt-1 block text-sm text-white">{value}</strong>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 text-center">
          <Link
            to="/lien-he"
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white hover:text-brand-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
          >
            {buttonText}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
