
import Slide from './Slide'
import Legal from './Legal'
import Consultation from '../../component/Consultation'
import VideoSection from '../../component/VideoSection'
import { GoogleMap } from '../contact/googleMap'
import New from './New'
export default function Home() {
 
  return (
    <>
    <Slide />
    <Legal />
    <Consultation />
    <New />
    <VideoSection />
    <GoogleMap />
    </>
  )
}
