import React from 'react';
import { FileText, Scale, Briefcase, Users } from 'lucide-react';

interface ContractType {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const ContractTypesComponent: React.FC = () => {
  const contractTypes: ContractType[] = [
    {
      id: 1,
      name: 'Hợp đồng lao động',
      icon: <Users className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 2,
      name: 'Hợp đồng mua bán',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      id: 3,
      name: 'Hợp đồng cung cấp dịch vụ',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 4,
      name: 'Hợp đồng thuê tài sản',
      icon: <Scale className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 5,
      name: 'Hợp đồng đại lý',
      icon: <Users className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 6,
      name: 'Hợp đồng nhượng quyền thương mại',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50 hover:bg-rose-100',
    },
    {
      id: 7,
      name: 'Hợp đồng hợp tác',
      icon: <Users className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 8,
      name: 'Hợp đồng thuê/cho thuê',
      icon: <FileText className="w-6 h-6" />,
      color: 'text-brand-goldDark',
      bgColor: 'bg-brand-surface hover:bg-brand-surface',
    },
    {
      id: 9,
      name: 'Hợp đồng nguyên tắc/gia công',
      icon: <Scale className="w-6 h-6" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      id: 10,
      name: 'Các loại Hợp đồng dịch vụ khác',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50 hover:bg-slate-100',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-surface   ">
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30"></div>

        <div className="relative py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-goldDark rounded-full blur-lg opacity-60 "></div>
                  <div className="relative bg-brand-goldDark p-6 rounded-full shadow-soft">
                    <Scale className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-brand-ink mb-6 leading-tight">
                CÁC DẠNG HỢP ĐỒNG
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 mb-8">
                MÀ LUẬT POIP TƯ VẤN SOẠN THẢO
              </h2>
              <div className="w-32 h-1 bg-brand-goldDark mx-auto rounded-full"></div>
            </div>

            {/* Contract Types Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {contractTypes.map((contract, index) => (
                <div
                  key={contract.id}
                  className={`group relative ${contract.bgColor} rounded-lg p-8 shadow-sm hover:shadow-soft transition-all duration-200  border border-white/50 `}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Card number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-surface   rounded-lg shadow-sm flex items-center justify-center border-4 border-white">
                    <span className="text-lg font-bold text-slate-700">{contract.id}</span>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-brand-goldDark   rounded-lg transition-all duration-200"></div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div
                      className={`inline-flex p-4 rounded-lg ${contract.color} mb-6 bg-white/80 shadow-md  transition-transform duration-300`}
                    >
                      {contract.icon}
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors duration-300">
                      {contract.name}
                    </h3>

                    {/* Decorative line */}
                    <div className="w-16 h-1 bg-brand-goldDark rounded-full group-hover:w-24 transition-all duration-300"></div>
                  </div>

                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
                    <div className="absolute inset-0 bg-brand-surface    transform rotate-45"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-20 text-center">
              <div className="bg-white/60  rounded-xl p-10 shadow-soft border border-white/50 max-w-4xl mx-auto">
                <h3 className="text-3xl font-bold text-slate-800 mb-4">
                  Cần hỗ trợ tư vấn pháp lý?
                </h3>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Đội ngũ luật sư chuyên nghiệp của Poip Legal sẵn sàng hỗ trợ bạn soạn thảo và tư vấn chi
                  tiết cho từng loại hợp đồng
                </p>
                <button
                  type="button"
                  className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-semibold
                                text-white bg-brand-goldDark rounded-lg shadow-sm
                                hover:shadow-soft  transition-all duration-300"
                  onClick={() => {
                    const contactForm = document.getElementById('contact-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <span className="relative z-10">Liên hệ ngay</span>
                  <div className="absolute inset-0 bg-brand-goldDark rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractTypesComponent;
