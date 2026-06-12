import { Outlet } from 'react-router-dom';
import Footer from '../../component/common/Footer/Footer';
import Header from '../../component/common/Header/Header';
import ChatyWidget from '../../component/common/ChatyWidget/ChatyWidget';
import ScrollToTop from '../../component/common/ScrollToTop';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-950">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-md bg-brand-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition-transform focus:translate-y-0"
      >
        Bỏ qua điều hướng
      </a>
      <ScrollToTop />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <ChatyWidget />
      <Footer />
    </div>
  );
}
