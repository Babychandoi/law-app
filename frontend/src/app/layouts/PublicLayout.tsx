import { Outlet } from 'react-router-dom';
import Footer from '../../component/common/Footer/Footer';
import Header from '../../component/common/Header/Header';
import ChatyWidget from '../../component/common/ChatyWidget/ChatyWidget';
import ScrollToTop from '../../component/common/ScrollToTop';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <ChatyWidget />
      <Footer />
    </div>
  );
}
