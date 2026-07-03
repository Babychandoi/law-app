import { FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConsultationForm from '../../component/Consultation';
import { Seo } from '../../component/Seo';
import PartnersCarousel from '../../component/service/PartnersCarousel';
import ServiceDirectory from '../../component/service/ServiceDirectory';
import { getServicePage, getServices } from '../../service/service';
import { ServicePageData } from '../../types/servicePage';
import ServicePageView from './ServicePageView';

/**
 * Trang dịch vụ động — render hoàn toàn từ dữ liệu admin nhập.
 * Phần thân trang nằm ở ServicePageView (dùng chung với preview trong admin).
 */
export default function DynamicServicePage() {
  const { pathname } = useLocation();
  const [page, setPage] = useState<ServicePageData | null>(null);
  // 'group' = đường dẫn là nhóm cha → hiển thị trang danh mục liệt kê dịch vụ con
  const [status, setStatus] = useState<'loading' | 'ready' | 'group' | 'notfound'>('loading');
  const [groupTitle, setGroupTitle] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    getServicePage(pathname)
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setPage(res.data);
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      })
      .catch(async () => {
        // Không phải trang dịch vụ con — thử xem có phải nhóm cha không
        try {
          const groups = (await getServices()).data || [];
          const matched = groups.find((g) => g.href === pathname && g.children?.length);
          if (!cancelled && matched) {
            setGroupTitle(matched.title);
            setStatus('group');
          } else if (!cancelled) {
            setStatus('notfound');
          }
        } catch {
          if (!cancelled) setStatus('notfound');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (status === 'group') {
    return (
      <div>
        <Seo title={`${groupTitle} - Luật Poip Legal`} description={`Các dịch vụ ${groupTitle} tại Luật Poip Legal`} />
        <ServiceDirectory
          serviceTitle={groupTitle}
          heading={groupTitle}
          description="Chọn dịch vụ phù hợp để xem quy trình, hồ sơ cần chuẩn bị và bước tư vấn tiếp theo."
        />
        <ConsultationForm />
        <PartnersCarousel />
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-brand-muted">
        <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (status === 'notfound' || !page) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <FileText className="h-10 w-10 text-brand-primaryDark" aria-hidden="true" />
        <h1 className="text-2xl font-semibold text-brand-ink">Không tìm thấy trang</h1>
        <p className="text-brand-muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
        <Link to="/dich-vu" className="font-semibold text-brand-primaryDark underline">
          Xem các dịch vụ của Luật Poip Legal
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Seo
        title={`${page.title} - Luật Poip Legal`}
        description={page.description || page.hero?.description || page.title}
        keywords={`${page.title}, Luật Poip Legal, sở hữu trí tuệ`}
      />
      <ServicePageView data={page} />
      <ConsultationForm />
      <PartnersCarousel />
    </div>
  );
}
