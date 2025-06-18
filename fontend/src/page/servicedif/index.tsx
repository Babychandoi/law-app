import React from 'react'
import HeroSection from '../../component/service/HeroService';
import Content from './content';

export default function Index() {
  return (
    <div>
      <HeroSection
        title="Dịch vụ khác"
        subtitle="ToTo Law"
      />
      <Content />
    </div>
  )
}
