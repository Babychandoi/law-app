import {
  Facebook,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Building2,
  UserCheck,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCompany, addUserNew } from '../../../service/service';
import { contactInfo, menuItems } from '../../../shared/config/site';
import { TotoCompany } from '../../../types/company';

const fallbackCompany: TotoCompany = {
  company: {
    id: 'fallback',
    name: 'CÔNG TY TNHH POIP LEGAL',
    representative: 'Ls. Trần Thị Kiều Oanh',
    taxCode: '0111585280',
    websiteName: 'luatpoip.com',
    email: contactInfo.email,
  },
  locations: [
    {
      id: 'hn',
      type: 'Văn phòng',
      address: '70 Ngách 6 Ngõ 10 Tả Thanh Oai, Đại Thanh, Hà Nội, Việt Nam',
      color: 'gold',
    },
  ],
  phoneContacts: [{ id: 'hotline', label: 'Hotline', number: contactInfo.hotline, color: 'gold' }],
  importants: [],
  socials: [],
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, '');
}

export default function Footer() {
  const [company, setCompany] = useState<TotoCompany>(fallbackCompany);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCompany()
      .then((response) => {
        if (mounted && response.data) {
          setCompany(response.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setCompany(fallbackCompany);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const quickLinks = useMemo(() => menuItems.filter((item) => item.href !== '/').slice(0, 6), []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await addUserNew(email.trim());
      toast.success(response.message || 'Đã đăng ký nhận tin thành công');
      setEmail('');
    } catch {
      toast.error('Không thể đăng ký nhận tin. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-brand-line bg-brand-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.25fr_0.75fr_1fr]">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-gold">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{company.company.name}</h2>
              <p className="text-sm text-white/60">{company.company.websiteName}</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-white/75">
            {company.locations.map((location) => (
              <div key={location.id} className="flex gap-3">
                <MapPin className="mt-0.5 shrink-0 text-brand-gold" size={18} />
                <div>
                  <p className="font-medium text-white">{location.type}</p>
                  <p>{location.address}</p>
                </div>
              </div>
            ))}
            <a
              className="flex items-center gap-3 hover:text-brand-gold"
              href={`mailto:${company.company.email}`}
            >
              <Mail size={18} />
              <span>{company.company.email}</span>
            </a>
            {company.phoneContacts.map((phone) => (
              <a
                key={phone.id}
                className="flex items-center gap-3 hover:text-brand-gold"
                href={`tel:${normalizePhone(phone.number)}`}
              >
                <Phone size={18} />
                <span>
                  {phone.label}: {phone.number}
                </span>
              </a>
            ))}
            {company.company.representative && (
              <div className="flex items-center gap-3">
                <UserCheck className="shrink-0 text-brand-gold" size={18} />
                <span>Người đại diện: {company.company.representative}</span>
              </div>
            )}
            {company.company.taxCode && (
              <div className="flex items-center gap-3">
                <Building2 className="shrink-0 text-brand-gold" size={18} />
                <span>MST: {company.company.taxCode}</span>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-gold">
            Liên kết
          </h3>
          <div className="grid gap-2 text-sm text-white/75">
            {quickLinks.map((item) => (
              <Link key={item.id} to={item.href} className="hover:text-brand-gold">
                {item.title}
              </Link>
            ))}
            <Link to="/chinh-sach-bao-mat" className="hover:text-brand-gold">
              Chính sách bảo mật
            </Link>
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-gold">
            Nhận bản tin
          </h3>
          <p className="mb-4 text-sm leading-6 text-white/70">
            Cập nhật tin tức pháp lý và sở hữu trí tuệ mới nhất từ đội ngũ Luật Poip Legal.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <label htmlFor="footer-email" className="sr-only">
              Email nhận bản tin
            </label>
            <input
              id="footer-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email của bạn"
              className="min-w-0 flex-1 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/45 outline-none focus:border-brand-gold"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-md bg-brand-goldDark px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={16} />
              Gửi
            </button>
          </form>

          <div className="mt-6 flex gap-2">
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/75 hover:border-brand-gold hover:text-brand-gold"
              aria-label="Zalo"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={contactInfo.messengerHref}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/75 hover:border-brand-gold hover:text-brand-gold"
              aria-label="Facebook"
            >
              <Facebook size={18} />
            </a>
            <a
              href={contactInfo.emailHref}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/75 hover:border-brand-gold hover:text-brand-gold"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
            <a
              href={company.socials[0]?.href || contactInfo.mapHref}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-md border border-white/15 text-white/75 hover:border-brand-gold hover:text-brand-gold"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 {company.company.websiteName}. All rights reserved.</span>
          <span>Tư vấn rõ ràng, bảo vệ tài sản trí tuệ bền vững.</span>
        </div>
      </div>
    </footer>
  );
}
