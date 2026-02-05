import Header from '../component/common/Header/Header'
import Footer from '../component/common/Footer/Footer'
import { Outlet } from 'react-router-dom'
import ChatyWidget from '../component/common/ChatyWidget/ChatyWidget'
import ScrollToTop from '../component/common/ScrollToTop' // Đường dẫn phù hợp

export default function Dashboard() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Outlet />
      <ChatyWidget />
      <Footer />
    </>
  )
}
