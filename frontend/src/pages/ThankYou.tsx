import { CheckCircle2, Home, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Seo } from '../component/Seo';
import { trackAdsPageView, trackLead } from '../page/landing/tracking';
import { contactInfo } from '../shared/config/site';

/** Dữ liệu form gửi kèm khi điều hướng sang đây. */
export interface ThankYouState {
  /** Nguồn lead (slug landing, 'consultation'...) — để biết chiến dịch nào ra khách. */
  source?: string;
  /** Mã một lần của lần gửi form, dùng để chặn F5 bắn chuyển đổi lặp. */
  submissionId?: string;
  serviceTitle?: string;
}

const FIRED_PREFIX = 'conv-fired:';

/**
 * Trang cảm ơn sau khi khách gửi form tư vấn. Đây là nơi duy nhất bắn sự kiện chuyển đổi, thay vì
 * rải ở từng form — đổi cách đo về sau chỉ phải sửa một chỗ.
 *
 * Chỉ bắn khi tới đây từ một lần gửi form thật (có submissionId trong state điều hướng). Vào thẳng
 * URL hoặc F5 thì trang vẫn hiện bình thường nhưng không tính thêm chuyển đổi — React Router giữ
 * state qua lần tải lại nên nếu không chốt bằng cờ trong sessionStorage, mỗi lần F5 là một lượt
 * chuyển đổi ảo và chi phí mỗi lead trong báo cáo sẽ thấp giả tạo.
 */
export default function ThankYou() {
  const location = useLocation();
  // Tách sẵn ra biến nguyên thủy: nếu phụ thuộc vào cả object state thì effect chạy lại mỗi lần
  // render vì `location.state ?? {}` tạo object mới.
  const state = (location.state ?? {}) as ThankYouState;
  const query = new URLSearchParams(location.search);

  // Hai đường vào trang này, phải phân biệt vì cách báo cho Google Ads khác nhau:
  //   1. Điều hướng mềm trong SPA (form React) -> submissionId nằm trong state điều hướng.
  //      Thẻ Google lúc tải trang đã báo URL của trang landing, KHÔNG phải /cam-on, nên phải tự
  //      gọi trackAdsPageView().
  //   2. Tải cứng từ landing HTML tĩnh -> submissionId nằm ở ?sid=. Lúc này thẻ trong index.html
  //      vừa chạy với đúng URL /cam-on nên Ads ĐÃ có lượt tải trang; gọi thêm là đếm hai lần.
  const softNavId = state.submissionId;
  const hardLoadId = query.get('sid') || undefined;
  const submissionId = softNavId || hardLoadId;
  const source = state.source || query.get('src') || undefined;
  const serviceTitle = state.serviceTitle || query.get('service') || undefined;
  const firedRef = useRef(false);

  useEffect(() => {
    if (!submissionId || firedRef.current) return;

    const key = FIRED_PREFIX + submissionId;
    if (sessionStorage.getItem(key)) return;

    firedRef.current = true;
    sessionStorage.setItem(key, '1');
    if (softNavId) {
      trackAdsPageView();
    }
    // Sự kiện chuyển đổi + pixel Facebook/TikTok. Phần Google Ads trong đây hiện im vì chưa cấu
    // hình nhãn; nếu sau này thêm nhãn thì phải bỏ trackAdsPageView ở trên, kẻo đếm hai lần.
    trackLead(source || 'thank-you');
  }, [submissionId, softNavId, source]);

  return (
    <div className="bg-brand-surface">
      {/* noindex: trang xác nhận riêng của từng khách, không có giá trị tìm kiếm và cũng không
          nên xuất hiện trên Google khiến người lạ mở vào rồi tưởng đã gửi form. */}
      <Seo
        title="Đã nhận yêu cầu tư vấn | Poip Legal"
        description="Cảm ơn bạn đã để lại thông tin. Luật sư của Poip Legal sẽ liên hệ trong thời gian sớm nhất."
        noindex
      />

      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
        <CheckCircle2 className="h-16 w-16 text-brand-goldDark" aria-hidden="true" />

        <h1 className="mt-6 text-3xl font-semibold leading-tight text-brand-ink md:text-4xl">
          Đã nhận yêu cầu tư vấn
        </h1>

        <p className="mt-4 max-w-xl text-base leading-8 text-brand-muted">
          Cảm ơn bạn đã tin tưởng Poip Legal
          {serviceTitle ? ` về dịch vụ ${serviceTitle}` : ''}. Luật sư phụ trách sẽ gọi lại trong
          vòng 24 giờ làm việc để trao đổi và báo phí trọn gói.
        </p>

        <div className="mt-8 w-full max-w-md rounded-lg border border-brand-line bg-white p-5 text-left">
          <h2 className="font-semibold text-brand-ink">Cần trao đổi ngay?</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Gọi trực tiếp hoặc nhắn Zalo, chúng tôi hỗ trợ trong giờ làm việc.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-brand-goldDark px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-ink"
            >
              <Phone size={18} aria-hidden="true" />
              {contactInfo.hotline}
            </a>
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-brand-line px-5 py-3 text-sm font-semibold text-brand-ink transition-colors hover:border-brand-gold"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Nhắn Zalo
            </a>
          </div>
        </div>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-goldDark hover:underline"
        >
          <Home size={16} aria-hidden="true" />
          Về trang chủ
        </Link>
      </section>
    </div>
  );
}
