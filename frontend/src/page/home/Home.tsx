
import Slide from './Slide'
import Legal from './Legal'
import Consultation from '../../component/Consultation'
import VideoSection from '../../component/VideoSection'
import { GoogleMap } from '../contact/googleMap'
import New from './New'
import { Seo } from '../../component/Seo'
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
      <GoogleMap />
    </>
  )
}
