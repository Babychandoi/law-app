import { Send } from 'lucide-react';
import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import 'react-phone-input-2/lib/style.css';
import { createCustomerService } from '../../../service/service';
import { CustomerService } from '../../../types/service';
import { newSubmissionId } from '../../../shared/analytics/submission';

interface LandingFormProps {
  /** slug LP — dùng làm nguồn lead để biết ads nào ra khách */
  source: string;
  /**
   * Id dịch vụ con mà landing này thu lead về, lấy thẳng từ cấu hình landing trong DB.
   * Trước đây đoán theo chuỗi con của tên dịch vụ và fallback về dịch vụ đầu danh sách,
   * nên khi dữ liệu dịch vụ đổi thì lead âm thầm chạy sang dịch vụ sai.
   */
  serviceId: string;
  /** Tên dịch vụ, chỉ để nhắc lại trên trang cảm ơn cho khách yên tâm. */
  serviceTitle?: string;
  /** id để bắn focus từ nút CTA */
  id?: string;
  title?: string;
  subtitle?: string;
}

const inputClass =
  'min-h-12 w-full rounded-md border border-brand-line bg-white px-4 py-3 text-base text-brand-ink outline-none transition-colors placeholder:text-brand-muted hover:border-brand-gold focus:border-brand-goldDark focus:ring-2 focus:ring-brand-gold/25';

export default function LandingForm({
  source,
  serviceId,
  serviceTitle,
  id,
  title = 'Nhận tư vấn miễn phí',
  subtitle = 'Điền thông tin, luật sư sẽ gọi lại cho bạn.',
}: LandingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+84');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const navigate = useNavigate();

  const validate = () => {
    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = 'Vui lòng nhập họ và tên.';
    if (phone.replace(/\D/g, '').length < 9) next.phone = 'Số điện thoại chưa hợp lệ.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    Swal.fire({
      title: 'Đang gửi yêu cầu',
      text: 'Vui lòng chờ trong giây lát.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const payload: CustomerService = {
      name: name.trim(),
      phone,
      email: email.trim(),
      serviceId,
      // gắn nguồn LP vào nội dung để admin biết lead đến từ chiến dịch nào
      description: `[Nguồn: LP ${source}] ${note.trim()}`.trim(),
    };

    try {
      await createCustomerService(payload);
      Swal.close();
      setName('');
      setPhone('+84');
      setEmail('');
      setNote('');
      // Sang trang cảm ơn; chuyển đổi được bắn tại đó, không bắn ở đây (một chỗ duy nhất).
      navigate('/cam-on', {
        state: { source, submissionId: newSubmissionId(), serviceTitle },
      });
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Chưa thể gửi yêu cầu',
        text: 'Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại và Zalo.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      noValidate
      className="landing-form rounded-lg border border-brand-line bg-white p-5 shadow-soft sm:p-6"
    >
      <h2 className="text-lg font-semibold text-brand-ink">{title}</h2>
      <p className="mt-1 text-sm text-brand-muted">{subtitle}</p>

      <div className="landing-form-fields mt-5 space-y-4">
        <div>
          <label
            htmlFor={`${id}-name`}
            className="mb-1.5 block text-sm font-semibold text-brand-ink"
          >
            Họ và tên <span className="text-red-700">*</span>
          </label>
          <input
            id={`${id}-name`}
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} ${errors.name ? '!border-red-600' : ''}`}
            placeholder="Nguyễn Văn A"
          />
          {errors.name && <p className="mt-1 text-sm text-red-700">{errors.name}</p>}
        </div>

        <div>
          <label
            htmlFor={`${id}-phone`}
            className="mb-1.5 block text-sm font-semibold text-brand-ink"
          >
            Số điện thoại <span className="text-red-700">*</span>
          </label>
          <PhoneInput
            country="vn"
            value={phone}
            onChange={setPhone}
            inputProps={{ id: `${id}-phone`, name: 'phone', autoComplete: 'tel' }}
            inputClass={`!h-12 !w-full !rounded-md !border !bg-white !text-base !text-brand-ink ${
              errors.phone ? '!border-red-600' : '!border-brand-line'
            }`}
            containerClass="!w-full"
            buttonClass="!rounded-l-md !border !border-brand-line !bg-brand-surface"
            preferredCountries={['vn']}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-700">{errors.phone}</p>}
        </div>

        <div>
          <label
            htmlFor={`${id}-email`}
            className="mb-1.5 block text-sm font-semibold text-brand-ink"
          >
            Email
          </label>
          <input
            id={`${id}-email`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="email@doanhnghiep.vn"
          />
        </div>

        <div>
          <label
            htmlFor={`${id}-note`}
            className="mb-1.5 block text-sm font-semibold text-brand-ink"
          >
            Nội dung cần tư vấn
          </label>
          <textarea
            id={`${id}-note`}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={`${inputClass} resize-y`}
            placeholder="Mô tả ngắn nhu cầu của bạn..."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-brand-goldDark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                aria-hidden="true"
              />
              Đang gửi
            </>
          ) : (
            <>
              <Send size={18} aria-hidden="true" />
              Gửi yêu cầu tư vấn
            </>
          )}
        </button>
        <p className="text-center text-xs text-brand-muted">
          Thông tin của bạn được bảo mật và chỉ dùng để tư vấn.
        </p>
      </div>
    </form>
  );
}
