import React from 'react';
import { Check } from 'lucide-react';
import { PricingPlan } from '../../types/service';
import { toast } from 'react-toastify';

interface PricingComponentProps {
  title: string;
  subtitle?: string;
  plans: PricingPlan[];
  variant?: 'card' | 'feature'; // card cho artwork/computer, feature cho trademark
  backgroundColor?: string;
  containerClassName?: string;
}

const PricingComponent: React.FC<PricingComponentProps> = ({
  title,
  subtitle,
  plans,
  variant = 'card',
  backgroundColor = 'bg-gray-50',
  containerClassName = '',
}) => {
  const handlePlanClick = (planId: string) => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  // Số cột tối đa theo số lượng plan để 1-2 card không bị kéo giãn xấu
  const colsClass =
    {
      1: 'lg:grid-cols-1 max-w-md',
      2: 'sm:grid-cols-2 max-w-3xl',
      3: 'sm:grid-cols-2 lg:grid-cols-3 max-w-6xl',
    }[plans.length] || 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl';

  // Thiết kế thống nhất: card trắng bo lớn, viền/điểm nhấn vàng, badge "PHỔ BIẾN"
  const renderPlans = () => (
    <div className={`mx-auto grid grid-cols-1 gap-8 ${colsClass}`}>
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`relative flex flex-col rounded-2xl border-2 bg-white p-8 ${
            plan.featured ? 'border-brand-gold shadow-soft' : 'border-brand-line'
          }`}
        >
          {plan.featured && (
            <span className="absolute -top-3 right-6 rounded-md bg-brand-gold px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Phổ biến
            </span>
          )}

          {plan.image && (
            <img
              src={plan.image}
              alt={plan.imageAlt || plan.title}
              className="mb-6 h-40 w-full rounded-lg border border-brand-line object-cover"
              loading="lazy"
              decoding="async"
            />
          )}

          <h3 className="text-center text-2xl font-bold text-brand-ink">{plan.title}</h3>

          <div className="mt-4 text-center">
            <span className="text-4xl font-bold text-brand-goldDark">{plan.price}</span>
            {plan.currency && (
              <span className="ml-1 align-top text-sm font-semibold text-brand-goldDark">
                {plan.currency}
              </span>
            )}
          </div>

          <div className="mx-auto mt-5 h-px w-16 bg-brand-line" aria-hidden="true" />

          {plan.description && (
            <p className="mt-5 text-center leading-7 text-brand-muted">{plan.description}</p>
          )}

          {plan.features && plan.features.length > 0 && (
            <ul className="mt-6 space-y-3.5">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-brand-gold" aria-hidden="true" />
                  <span className="text-sm leading-6 text-gray-700">
                    {typeof feature === 'string' ? feature : feature.text}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {plan.customContent && <div className="mt-6">{plan.customContent}</div>}

          <button
            type="button"
            onClick={() => handlePlanClick(plan.id)}
            className="mt-8 w-full rounded-xl bg-brand-gold px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-goldDark"
          >
            {plan.buttonText || 'Đăng ký tư vấn'}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className={`container mx-auto px-4 ${containerClassName}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          {variant === 'feature' && (
            <div className="w-24 h-1 bg-brand-goldDark mx-auto rounded-full"></div>
          )}
          {subtitle && <p className="text-gray-600 mt-4 max-w-2xl mx-auto">{subtitle}</p>}
        </div>

        {/* Pricing Cards — một thiết kế thống nhất cho mọi variant */}
        {renderPlans()}

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            {variant === 'feature'
              ? 'Tất cả các gói dịch vụ đều bao gồm tư vấn chuyên nghiệp và hỗ trợ khách hàng 24/7. Liên hệ với chúng tôi để được tư vấn chi tiết về gói dịch vụ phù hợp nhất.'
              : 'Liên hệ với chúng tôi để được tư vấn chi tiết về quy trình đăng ký và các dịch vụ pháp lý khác tại POIP LAW.'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;
