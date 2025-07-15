import React from 'react'
import { NewsPage } from '../../component/news/NewsPage'
import HeroSection from '../../component/service/HeroService'

export default function index() {
  return (
    <div>
      <HeroSection
        title="Bản tin pháp luật"
        subtitle="ToTo Law"
      />
      <NewsPage />
    </div>
  )
}
