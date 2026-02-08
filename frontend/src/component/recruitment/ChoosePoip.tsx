import React from 'react';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const ChoosePoip: React.FC = () => {
  const benefits: Benefit[] = [
    {
      icon: '💰',
      title: 'Mức lương cạnh tranh',
      description: 'Lương thưởng xứng đáng với năng lực'
    },
    {
      icon: '📈',
      title: 'Cơ hội thăng tiến',
      description: 'Môi trường phát triển nghề nghiệp'
    },
    {
      icon: '🎓',
      title: 'Đào tạo chuyên sâu',
      description: 'Được đào tạo và phát triển kỹ năng'
    },
    {
      icon: '🏥',
      title: 'Phúc lợi đầy đủ',
      description: 'Bảo hiểm, nghỉ phép và các quyền lợi khác'
    },
    {
      icon: '⚖️',
      title: 'Môi trường làm việc chuyên nghiệp',
      description: 'Văn hóa công ty tích cực và đoàn kết'
    },
    {
      icon: '🌍',
      title: 'Làm việc đa dạng',
      description: 'Tiếp xúc với các dự án thú vị'
    }
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Tại sao chọn Luật Poip?
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex flex-col relative overflow-hidden h-auto 
                     shadow-medium rounded-large transition-transform-background 
                     bg-gradient-to-br from-[#f2c64d]/10 to-transparent 
                     border-2 border-[#f2c64d]/30
                     hover:scale-105 hover:shadow-lg duration-300"
          >
            <div className="relative flex w-full flex-auto flex-col 
                          p-6 text-center">
              <div className="text-5xl mb-4">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">
                {benefit.title}
              </h3>
              <p className="text-sm text-gray-600">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoosePoip;