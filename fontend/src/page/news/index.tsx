import React from 'react'
import { NewsPage } from '../../component/news/NewsPage'

export default function index() {
  return (
    <div>
      <NewsPage 
        bannerImage="https://example.com/banner.jpg" 
        bannerAlt="News Banner"
      />
    </div>
  )
}
