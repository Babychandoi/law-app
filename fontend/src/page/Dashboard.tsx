
import Header from '../component/common/Header/Header'
import Footer from '../component/common/Footer/Footer'
import { Outlet } from 'react-router-dom'

export default function Dashboard() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
