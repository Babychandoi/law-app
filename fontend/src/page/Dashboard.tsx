
import Header from '../component/common/Header/Header'
import Footer from '../component/common/Footer/Footer'
import { Outlet } from 'react-router-dom'
import ChatyWidget from '../component/common/ChatyWidget/ChatyWidget'

export default function Dashboard() {
  return (
    <>
      <Header />
      <Outlet />
      <ChatyWidget />
      <Footer />
    </>
  )
}
