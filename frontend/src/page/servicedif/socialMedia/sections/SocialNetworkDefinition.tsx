import React from 'react';
import { UserPlus, Info } from 'lucide-react';

interface Props {
  title?: string;
  content?: string;
  headerIcon?: React.ReactNode;
  variant?: 'default' | 'blue' | 'purple' | 'orange';
}

const SocialNetworkDefinition: React.FC<Props> = ({
  title = 'MẠNG XÃ HỘI LÀ GÌ?',
  content = 'Mạng xã hội (social network) là hệ thống thông tin cung cấp cho cộng đồng người sử dụng mạng các dịch vụ lưu trữ, cung cấp, sử dụng, tìm kiếm, chia sẻ và trao đổi thông tin với nhau, bao gồm dịch vụ tạo trang thông tin điện tử cá nhân, diễn đàn (forum), trò chuyện (chat) trực tuyến, chia sẻ âm thanh, hình ảnh và các hình thức dịch vụ tương tự khác.',
  headerIcon,
  variant = 'default',
}) => {
  const variants = {
    default: {
      background: 'bg-brand-surface  ',
      iconBg: 'bg-brand-surface',
      iconColor: 'text-brand-primaryDark',
      cardBorder: 'border-brand-line',
      textAccent: 'text-brand-primaryDark',
    },
    blue: {
      background: 'bg-brand-surface  ',
      iconBg: 'bg-brand-surface',
      iconColor: 'text-brand-primaryDark',
      cardBorder: 'border-brand-line',
      textAccent: 'text-brand-primaryDark',
    },
    purple: {
      background: 'bg-brand-surface  ',
      iconBg: 'bg-brand-surface',
      iconColor: 'text-brand-primaryDark',
      cardBorder: 'border-brand-line',
      textAccent: 'text-brand-primaryDark',
    },
    orange: {
      background: 'bg-brand-primary',
      iconBg: 'bg-brand-surface',
      iconColor: 'text-brand-primaryDark',
      cardBorder: 'border-brand-line',
      textAccent: 'text-brand-primaryDark',
    },
  };

  const currentVariant = variants[variant];
  const defaultIcon = <UserPlus className={`w-8 h-8 ${currentVariant.iconColor}`} />;

  return (
    <div className={`${currentVariant.background} py-16`}>
      {/* Header */}
      <section className="mb-12">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 ${currentVariant.iconBg} rounded-lg shadow-sm mb-6`}
          >
            {headerIcon || defaultIcon}
          </div>
          <h1
            className={`text-3xl md:text-4xl font-bold ${currentVariant.textAccent} leading-tight`}
          >
            {title}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section>
        <div className="max-w-7xl mx-auto px-6">
          <div
            className={`bg-white rounded-lg shadow-soft p-8 md:p-12 border ${currentVariant.cardBorder}`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-12 h-12 ${currentVariant.iconBg} rounded-full flex items-center justify-center mt-1`}
              >
                <Info className={`w-6 h-6 ${currentVariant.iconColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 text-lg leading-relaxed text-justify">{content}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SocialNetworkDefinition;
