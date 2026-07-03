import { Building2, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCompany } from '../../../service/service';
import { TotoCompany } from '../../../types/company';

const Contact = () => {
  const [contact, setContact] = useState<TotoCompany>();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await getCompany();
        setContact(response.data);
      } catch (error) {
        setHasError(true);
      }
    };

    fetchCompanyInfo();
  }, []);

  const hotline = contact?.phoneContacts.find((item) => item.label === 'Hotline');
  const zaloContacts = contact?.phoneContacts.filter((item) => item.label.includes('Zalo')) ?? [];

  return (
    <div className="p-6 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-goldDark">
        Kênh liên hệ trực tiếp
      </p>
      <h2 className="mt-3 text-3xl font-semibold leading-tight text-brand-ink">
        Thông tin liên hệ
      </h2>
      <p className="mt-4 leading-7 text-brand-muted">
        Liên hệ qua kênh thuận tiện nhất. Đội ngũ Luật Poip Legal sẽ phản hồi và hướng dẫn bước tiếp theo.
      </p>

      {hasError && (
        <p
          className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          Chưa thể tải đầy đủ thông tin công ty. Vui lòng gọi hotline hoặc gửi email cho chúng tôi.
        </p>
      )}

      <div className="mt-8 space-y-6">
        <section aria-labelledby="company-contact-title">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-brand-surface text-brand-goldDark">
              <Building2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="company-contact-title" className="font-semibold text-brand-ink">
                {contact?.company.name || 'Luật Poip Legal'}
              </h3>
              <p className="mt-1 text-sm leading-6 text-brand-muted">
                Tư vấn và đại diện sở hữu trí tuệ cho doanh nghiệp, nhà sáng tạo và chủ sở hữu
                thương hiệu.
              </p>
            </div>
          </div>
        </section>

        <section
          className="border-t border-brand-line pt-6"
          aria-labelledby="address-contact-title"
        >
          <h3 id="address-contact-title" className="font-semibold text-brand-ink">
            Địa chỉ
          </h3>
          <ul className="mt-4 space-y-4">
            {contact?.locations.map((location, index) => (
              <li key={location.id || index} className="flex gap-3">
                <MapPin className="mt-1 h-5 w-5 flex-none text-brand-goldDark" aria-hidden="true" />
                <span>
                  <strong className="block text-sm text-brand-ink">{location.type}</strong>
                  <span className="mt-1 block text-sm leading-6 text-brand-muted">
                    {location.address}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-brand-line pt-6" aria-labelledby="direct-contact-title">
          <h3 id="direct-contact-title" className="font-semibold text-brand-ink">
            Trao đổi trực tiếp
          </h3>
          <ul className="mt-4 space-y-3">
            <ContactLink
              href={`mailto:${contact?.company.email || 'luatpoip@gmail.com'}`}
              label="Email"
              value={contact?.company.email || 'luatpoip@gmail.com'}
              icon={Mail}
            />
            {hotline && (
              <ContactLink
                href={`tel:${hotline.number.replace(/\./g, '')}`}
                label="Hotline"
                value={hotline.number}
                icon={Phone}
              />
            )}
            {zaloContacts.map((zalo) => (
              <ContactLink
                key={zalo.id || zalo.number}
                href={`https://zalo.me/${zalo.number.replace(/\./g, '')}`}
                label={zalo.label}
                value={zalo.number}
                icon={MessageCircle}
              />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

interface ContactLinkProps {
  href: string;
  label: string;
  value: string;
  icon: typeof Mail;
}

const ContactLink = ({ href, label, value, icon: Icon }: ContactLinkProps) => (
  <li>
    <a
      href={href}
      className="flex min-h-11 items-center gap-3 rounded-md border border-brand-line px-4 py-3 text-sm transition-colors duration-200 hover:border-brand-gold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-gold/30"
    >
      <Icon className="h-5 w-5 flex-none text-brand-goldDark" aria-hidden="true" />
      <span>
        <span className="block text-xs text-brand-muted">{label}</span>
        <strong className="block text-brand-ink">{value}</strong>
      </span>
    </a>
  </li>
);

export default Contact;
