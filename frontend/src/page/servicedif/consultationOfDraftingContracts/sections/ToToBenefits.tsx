import React from 'react';
import { CheckCircle2, Zap, DollarSign, Clock, Award } from 'lucide-react';

interface Benefit {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  iconBg: string;
}

const ToToBenefitsComponent: React.FC = () => {
  const benefits: Benefit[] = [
    {
      id: 1,
      title: 'ĐƠN GIẢN - NHANH CHÓNG',
      description: 'Chỉ với 3 bước đơn giản - Mọi thủ tục Luật Poip Legal lo hết',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-emerald-600',
      bgGradient: ' ',
      iconBg: 'bg-emerald-500',
    },
    {
      id: 2,
      title: 'TIẾT KIỆM CHI PHÍ',
      description: 'Mức phí được Luật Poip Legal hỗ trợ',
      icon: <DollarSign className="w-8 h-8" />,
      color: 'text-brand-primaryDark',
      bgGradient: ' ',
      iconBg: 'bg-brand-primary',
    },
    {
      id: 3,
      title: 'KẾT QUẢ HƠN MONG ĐỢI - HỖ TRỢ CHỈNH SỬA THEO YÊU CẦU',
      description:
        'Luật Poip Legal cam kết về kết quả cho Khách hàng - Hoàn lại tiền cho KH khi kết quả không như mong muốn',
      icon: <Award className="w-8 h-8" />,
      color: 'text-brand-primaryDark',
      bgGradient: ' ',
      iconBg: 'bg-brand-primary',
    },
  ];

  return (
    <div className="relative py-20 bg-brand-surface    overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-green-600 rounded-full blur-lg opacity-60 "></div>
              <div className="relative bg-green-600 p-6 rounded-full shadow-soft">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-brand-ink">LỢI ÍCH KHI SỬ DỤNG</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-ink mb-8">
            DỊCH VỤ CỦA LUẬT POIP
          </h2>

          <div className="flex justify-center space-x-2 mb-8">
            <div className="w-12 h-1 bg-brand-primary rounded-full"></div>
            <div className="w-12 h-1 bg-brand-surface   rounded-full"></div>
            <div className="w-12 h-1 bg-brand-surface   rounded-full"></div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.id}
              className="group relative"
              style={{
                animationDelay: `${index * 200}ms`,
              }}
            >
              {/* Card */}
              <div
                className={`relative bg-brand-surface ${benefit.bgGradient} rounded-xl p-8 lg:p-10 shadow-soft hover:shadow-soft transition-all duration-200  border border-white/60  h-full`}
              >
                {/* Floating Number */}
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-surface   rounded-lg shadow-soft flex items-center justify-center border-4 border-white  transition-transform duration-300">
                  <span className="text-2xl font-bold text-brand-ink">{benefit.id}</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-8">
                  <div
                    className={`relative ${benefit.iconBg} p-6 rounded-lg shadow-sm  transition-all duration-300`}
                  >
                    <div className="text-white">{benefit.icon}</div>
                    {/* Icon glow effect */}
                    <div
                      className={`absolute inset-0 ${benefit.iconBg} rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300`}
                    ></div>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3
                    className={`text-xl lg:text-2xl font-bold ${benefit.color} mb-6 leading-tight  transition-transform duration-300`}
                  >
                    {benefit.title}
                  </h3>

                  <p className="text-slate-700 text-lg leading-relaxed group-hover:text-slate-800 transition-colors duration-300">
                    {benefit.description}
                  </p>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-8 h-8 border-2 border-white/30 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                <div className="absolute bottom-4 right-4 w-6 h-6 border-2 border-white/30 rounded-full group-hover:scale-125 transition-transform duration-200 delay-100"></div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>

              {/* Connection line for desktop */}
              {index < benefits.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-brand-primary opacity-30"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center">
          <div className="relative bg-brand-surface    p-1 rounded-xl shadow-soft max-w-2xl mx-auto">
            <div className="bg-white rounded-xl px-8 py-12">
              <h3 className="text-3xl font-bold text-brand-ink mb-4">Sẵn sàng trải nghiệm?</h3>
              <p className="text-slate-600 text-lg mb-8">
                Hãy để Poip Legal Law đồng hành cùng bạn trong mọi vấn đề pháp lý
              </p>
              <button
                type="button"
                className="group relative inline-flex items-center
              justify-center px-8 py-4 text-lg font-semibold
              text-white bg-brand-primary rounded-lg
              shadow-sm hover:shadow-soft  transition-all duration-300"
                onClick={() => {
                  const contactForm = document.getElementById('contact-form');
                  if (contactForm) {
                    contactForm.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <Clock className="w-5 h-5 mr-2 group-hover:animate-spin" />
                <span>Tư vấn ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToToBenefitsComponent;
