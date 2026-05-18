import React from 'react';
import { Check, Star } from 'lucide-react';
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
  containerClassName = ''
}) => {

  const handlePlanClick = (planId: string) => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const renderCardVariant = () => (
    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
            plan.featured ? 'ring-2 ring-blue-500 relative' : ''
          }`}
          style={{ 
            flex: plans.length < 3 ? '0 0 auto' : '1 1 0',
            minWidth: '320px',
            maxWidth: plans.length === 1 ? '400px' : '350px'
          }}
        >
          {plan.featured && (
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Phổ biến
            </div>
          )}

          {/* Image */}
          {plan.image && (
            <div className="relative h-48 overflow-hidden" style={{
              borderRadius: '0.5rem',
              padding: '0.5rem',
            }}>
              <img
                src={plan.image}
                alt={plan.imageAlt || plan.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
              />
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              {plan.title}
            </h3>

            {/* Price */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center">
                {plan.currency && (
                  <span className="text-gray-600 text-sm mr-1">{plan.currency}</span>
                )}
                <span className="text-3xl font-bold text-blue-600">
                  {plan.price}
                </span>
              </div>
            </div>

            {/* Divider */}
            <hr className="border-blue-200 mb-4" />
            
            {/* Description */}
            {plan.description && (
              <div className="px-8 py-6">
                <p className="text-gray-700 text-center leading-relaxed">
                  {plan.description}
                </p>
              </div>
            )}

            {/* Features */}
            {plan.features && plan.features.length > 0 && (
              <div className="px-8 pb-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">
                        {typeof feature === 'string' ? feature : feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Custom Content */}
            {plan.customContent && (
              <div className="mb-6">
                {plan.customContent}
              </div>
            )}

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`w-full px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${
                  plan.featured
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {plan.buttonText || 'Đăng ký tư vấn'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFeatureVariant = () => (
    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
      {plans.map((plan, index) => (
        <div
          key={plan.id}
          className={`w-full max-w-sm relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
            plan.featured
              ? 'ring-4 ring-blue-500 ring-opacity-50'
              : ''
          }`}
          style={{ 
            flex: plans.length < 3 ? '0 0 auto' : '1 1 0',
            minWidth: '320px',
            maxWidth: plans.length === 1 ? '400px' : '350px'
          }}
        >
          {/* Featured Badge */}
          {plan.featured && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-bl-2xl z-10">
              <Star className="w-4 h-4 inline-block mr-1" />
              <span className="text-sm font-semibold">Phổ biến</span>
            </div>
          )}

          {/* Header */}
          <div className={`px-8 py-8 text-center ${
            plan.featured
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
              : 'bg-gray-50'
          }`}>
            <h3 className={`text-2xl font-bold mb-4 ${
              plan.featured ? 'text-white' : 'text-gray-900'
            }`}>
              {plan.title}
            </h3>

            <div className="mb-4">
              <span className={`text-4xl font-bold ${
                plan.featured ? 'text-white' : 'text-gray-900'
              }`}>
                {plan.price}
              </span>
              {plan.currency && (
                <span className={`text-sm font-medium ml-2 ${
                  plan.featured ? 'text-blue-100' : 'text-gray-600'
                }`}>
                  {plan.currency}
                </span>
              )}
            </div>

            <div className={`w-16 h-1 mx-auto rounded-full ${
              plan.featured
                ? 'bg-white bg-opacity-50'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
            }`}></div>
          </div>

          {/* Description */}
          {plan.description && (
            <div className="px-8 py-6">
              <p className="text-gray-700 text-center leading-relaxed">
                {plan.description}
              </p>
            </div>
          )}

          {/* Features */}
          {plan.features && plan.features.length > 0 && (
            <div className="px-8 pb-8">
              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 mr-3">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {typeof feature === 'string' ? feature : feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Custom Content */}
          {plan.customContent && (
            <div className="px-8 pb-6">
              {plan.customContent}
            </div>
          )}

          {/* CTA Button */}
          <div className="px-8 pb-8">
            <button
              onClick={() => handlePlanClick(plan.id)}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 transform hover:scale-105 ${
                plan.featured
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200 border-2 border-transparent hover:border-blue-500'
              }`}
            >
              {plan.buttonText || 'Đăng ký tư vấn'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <section className={`py-16 ${backgroundColor}`}>
      <div className={`container mx-auto px-4 ${containerClassName}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {variant === 'feature' && (
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full"></div>
          )}
          {subtitle && (
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        {variant === 'card' ? renderCardVariant() : renderFeatureVariant()}

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 max-w-2xl mx-auto">
            {variant === 'feature'
              ? "Tất cả các gói dịch vụ đều bao gồm tư vấn chuyên nghiệp và hỗ trợ khách hàng 24/7. Liên hệ với chúng tôi để được tư vấn chi tiết về gói dịch vụ phù hợp nhất."
              : "Liên hệ với chúng tôi để được tư vấn chi tiết về quy trình đăng ký và các dịch vụ pháp lý khác tại POIP LAW."
            }
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;