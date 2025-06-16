// components/ui/SectionNumber.tsx
import React from 'react';

interface SectionNumberProps {
  number: number;
}

const SectionNumber: React.FC<SectionNumberProps> = ({ number }) => (
  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">
    {number}
  </div>
);

export default SectionNumber;