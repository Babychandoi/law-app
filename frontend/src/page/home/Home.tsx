
import Slide from './Slide'
import Legal from './Legal'
import Consultation from '../../component/Consultation'
import VideoSection from '../../component/VideoSection'
import New from './New'
import { Seo } from '../../component/Seo'
import React,{ lazy, Suspense } from 'react'
const GoogleMap = lazy(() => import('../contact/googleMap/index').then(module => ({ default: module.GoogleMap })));
export default function Home() {

  return (
    <>
      <Seo title="Dịch Vụ Sở Hữu Trí Tuệ - Luật Poip"
        description="Luật Poip cung cấp dịch vụ sở hữu trí tuệ, chúng tôi hỗ trợ tư vấn miễn phí. Mọi thắc mắc về luật hãy liên hệ chúng tôi."
        keywords='Dịch vụ sở hữu trí tuệ, tư vấn pháp luật, bảo hộ nhãn hiệu, bản quyền, giấy phép, luật sư sở hữu trí tuệ, Luật Poip'
      />
      <Slide />
      <Legal />
      <Consultation />
      <New />
      <VideoSection />
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
        </div>
      }>
        <GoogleMap />
      </Suspense>
    </>
  )
}
