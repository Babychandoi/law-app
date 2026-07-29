import { useEffect, useState } from 'react';
import { Building2, UserCheck, FileText, MapPin, Mail, Phone } from 'lucide-react';
import { getCompany } from '../../service/service';
import { contactInfo } from '../../shared/config/site';
import type { TotoCompany } from '../../types/company';

// Thông tin pháp lý công ty (tên, MST, người đại diện, địa chỉ, liên hệ) — lấy từ backend, có fallback.
const fallback: TotoCompany = {
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
      type: 'Trụ sở chính',
      address: '70 Ngách 6, Ngõ 10 Tả Thanh Oai, Xã Đại Thanh, TP Hà Nội',
      color: 'gold',
    },
  ],
  phoneContacts: [{ id: 'hotline', label: 'Hotline', number: contactInfo.hotline, color: 'gold' }],
  importants: [],
  socials: [],
};

export default function CompanyLegalInfo({ className = '' }: { className?: string }) {
  const [data, setData] = useState<TotoCompany>(fallback);

  useEffect(() => {
    let mounted = true;
    getCompany()
      .then((res) => {
        if (mounted && res.data) setData(res.data);
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, []);

  const c = data.company;
  const address = data.locations?.[0]?.address;
  const phone = data.phoneContacts?.[0]?.number || contactInfo.hotline;

  const Row = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: typeof Building2;
    label: string;
    value?: string;
  }) =>
    value ? (
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 shrink-0 text-brand-goldDark" size={18} aria-hidden="true" />
        <p className="text-sm text-brand-ink">
          <span className="text-brand-muted">{label}: </span>
          <span className="font-medium">{value}</span>
        </p>
      </div>
    ) : null;

  return (
    <section className={`mx-auto max-w-3xl px-4 py-10 ${className}`}>
      <div className="rounded-card border border-brand-line bg-white p-6 shadow-card">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-brand-ink">
          <Building2 className="text-brand-goldDark" size={20} aria-hidden="true" />
          Thông tin công ty
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Row icon={Building2} label="Tên công ty" value={c.name} />
          <Row icon={FileText} label="Mã số thuế" value={c.taxCode} />
          <Row icon={UserCheck} label="Người đại diện" value={c.representative} />
          <Row icon={Mail} label="Email" value={c.email} />
          <Row icon={Phone} label="Hotline" value={phone} />
          <Row icon={MapPin} label="Địa chỉ" value={address} />
        </div>
      </div>
    </section>
  );
}
