import { CheckCircle2, Clock3, Mail, MessageCircle, Phone, Send, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import 'react-phone-input-2/lib/style.css';
import { createCustomerService, getServiceHome } from '../service/service';
import { contactInfo } from '../shared/config/site';
import { CustomerService, ServiceItem } from '../types/service';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const initialForm: CustomerService = {
  name: '',
  phone: '',
  email: '',
  serviceId: '',
  description: '',
};

const inputClass =
  'min-h-12 w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-base text-gray-950 outline-none transition-colors placeholder:text-gray-500 hover:border-brand-primary focus:border-brand-primaryDark focus:ring-2 focus:ring-brand-primary/25';

interface ConsultationFormProps {
  sectionId?: string;
}

export default function ConsultationForm({ sectionId = 'contact-form' }: ConsultationFormProps) {
  const [formData, setFormData] = useState<CustomerService>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceOptions, setServiceOptions] = useState<ServiceItem[]>([]);
  const [errors, setErrors] = useState<Partial<CustomerService>>({});

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServiceHome();
        if (response.data?.length) {
          setServiceOptions(response.data);
          setFormData((current) => ({
            ...current,
            serviceId: current.serviceId || response.data[0].id,
          }));
        }
      } catch {
        toast.error('Không thể tải danh sách dịch vụ. Vui lòng thử lại.');
      }
    };

    fetchServices();
  }, []);

  const clearError = (field: keyof CustomerService) => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    clearError(name as keyof CustomerService);
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((current) => ({ ...current, phone }));
    clearError('phone');
  };

  const validateForm = () => {
    const nextErrors: Partial<CustomerService> = {};

    if (!formData.name.trim()) nextErrors.name = 'Vui lòng nhập họ và tên.';
    if (!formData.phone.trim()) nextErrors.phone = 'Vui lòng nhập số điện thoại.';
    else if (formData.phone.replace(/\D/g, '').length < 9)
      nextErrors.phone = 'Số điện thoại chưa hợp lệ.';
    if (!formData.email.trim()) nextErrors.email = 'Vui lòng nhập email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      nextErrors.email = 'Email chưa hợp lệ.';
    if (!formData.serviceId) nextErrors.serviceId = 'Vui lòng chọn dịch vụ cần tư vấn.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    Swal.fire({
      title: 'Đang gửi yêu cầu',
      text: 'Vui lòng chờ trong giây lát.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await createCustomerService(formData);
      await Swal.fire({
        icon: 'success',
        title: 'Đã nhận yêu cầu tư vấn',
        text: response.message || 'Đội ngũ Luật Poip Legal sẽ liên hệ với bạn trong thời gian sớm nhất.',
      });

      window.gtag?.('event', 'conversion', {
        send_to: 'AW-17438859267/9CUZCKWNmoAbEIPAv_tA',
        value: 1.0,
        currency: 'VND',
      });

      setFormData({
        ...initialForm,
        phone: '+84',
        serviceId: serviceOptions[0]?.id || '',
      });
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Chưa thể gửi yêu cầu',
        text: 'Vui lòng thử lại hoặc liên hệ trực tiếp qua điện thoại và Zalo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id={sectionId}
      className="scroll-mt-28 bg-brand-surface py-16 text-brand-ink sm:py-20"
      aria-labelledby="consultation-heading"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-sm font-semibold text-brand-primaryDark">Tư vấn ban đầu</p>
          <h2
            id="consultation-heading"
            className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-brand-ink md:text-4xl"
          >
            Chia sẻ nhu cầu, nhận hướng xử lý rõ ràng
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-brand-muted">
            Điền thông tin để đội ngũ Luật Poip Legal hiểu nhu cầu và chuẩn bị nội dung trao đổi phù hợp.
            Bạn cũng có thể gọi hoặc nhắn Zalo nếu cần phản hồi nhanh.
          </p>

          <div className="mt-8 space-y-4 border-y border-brand-line py-6 text-sm text-brand-muted">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 shrink-0 text-brand-primary" size={19} aria-hidden="true" />
              <span>Phản hồi yêu cầu ban đầu trong vòng 24 giờ làm việc.</span>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 shrink-0 text-brand-primary"
                size={19}
                aria-hidden="true"
              />
              <span>Thông tin được sử dụng để phục vụ yêu cầu tư vấn của bạn.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-brand-primary"
                size={19}
                aria-hidden="true"
              />
              <span>Trao đổi rõ phạm vi công việc trước khi triển khai.</span>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a
              href={contactInfo.phoneHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryDark"
            >
              <Phone size={18} aria-hidden="true" />
              Gọi {contactInfo.hotline}
            </a>
            <a
              href={contactInfo.zaloHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-brand-line bg-white px-5 py-3 text-sm font-semibold text-brand-ink transition-colors hover:bg-brand-surface"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Nhắn Zalo
            </a>
          </div>
        </div>

        <div className="rounded-lg border border-brand-line bg-white p-5 text-gray-950 shadow-soft sm:p-8">
          <div className="mb-7 border-b border-brand-line pb-6">
            <h3 className="text-xl font-semibold text-gray-950">Thông tin cần tư vấn</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Các trường có dấu <span aria-hidden="true">*</span> là bắt buộc.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="grid gap-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="consultation-name" label="Họ và tên" required error={errors.name}>
                <input
                  id="consultation-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'consultation-name-error' : undefined}
                  className={`${inputClass} ${errors.name ? 'border-red-600' : ''}`}
                  placeholder="Nguyễn Văn A"
                />
              </Field>

              <Field id="consultation-phone" label="Số điện thoại" required error={errors.phone}>
                <PhoneInput
                  country="vn"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputProps={{
                    id: 'consultation-phone',
                    name: 'phone',
                    autoComplete: 'tel',
                    'aria-invalid': !!errors.phone,
                    'aria-describedby': errors.phone ? 'consultation-phone-error' : undefined,
                  }}
                  inputClass={`!h-12 !w-full !rounded-md !border !bg-white !text-base !text-gray-950 !outline-none focus:!border-brand-primaryDark focus:!ring-2 focus:!ring-brand-primary/25 ${
                    errors.phone ? '!border-red-600' : '!border-gray-300'
                  }`}
                  containerClass="!w-full"
                  buttonClass={`!rounded-l-md !border !bg-brand-surface ${
                    errors.phone ? '!border-red-600' : '!border-gray-300'
                  }`}
                  dropdownClass="!rounded-md !border !border-brand-line !bg-white !shadow-soft"
                  preferredCountries={['vn']}
                />
              </Field>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="consultation-email" label="Email" required error={errors.email}>
                <input
                  id="consultation-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'consultation-email-error' : undefined}
                  className={`${inputClass} ${errors.email ? 'border-red-600' : ''}`}
                  placeholder="email@doanhnghiep.vn"
                />
              </Field>

              <Field
                id="consultation-service"
                label="Dịch vụ cần tư vấn"
                required
                error={errors.serviceId}
              >
                <select
                  id="consultation-service"
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  aria-invalid={!!errors.serviceId}
                  aria-describedby={errors.serviceId ? 'consultation-service-error' : undefined}
                  className={`${inputClass} ${errors.serviceId ? 'border-red-600' : ''}`}
                >
                  {!serviceOptions.length && <option value="">Đang tải dịch vụ...</option>}
                  {serviceOptions.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field id="consultation-description" label="Nội dung cần trao đổi">
              <textarea
                id="consultation-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`${inputClass} resize-y`}
                placeholder="Mô tả ngắn nhu cầu, tình trạng hiện tại hoặc câu hỏi của bạn..."
              />
            </Field>

            <div className="flex flex-col gap-4 border-t border-brand-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-md text-xs leading-5 text-gray-600">
                Bằng việc gửi yêu cầu, bạn đồng ý để Luật Poip Legal liên hệ nhằm hỗ trợ nội dung tư vấn
                đã cung cấp.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
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
            </div>
          </form>

          <a
            href={contactInfo.emailHref}
            className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-gray-700 underline decoration-brand-primary decoration-2 underline-offset-4 hover:text-brand-primaryDark"
          >
            <Mail size={17} aria-hidden="true" />
            Hoặc gửi email đến {contactInfo.email}
          </a>
        </div>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
        {required && (
          <span className="ml-1 text-red-700" aria-label="bắt buộc">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
