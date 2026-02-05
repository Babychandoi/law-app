import React, { useState, useEffect } from 'react';
import {  Menu, X, ChevronDown, Sparkles, Globe, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceResponse } from '../../../types/service';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuItems] = useState<ServiceResponse[]>([
    { id: 'home', title: 'Trang chủ', href: '/' },
    { id: 'about', title: 'Về chúng tôi', href: '/ve-chung-toi' },
    { id: 'services', title: 'Dịch vụ sở hữu trí tuệ', href: '/dich-vu', children: [
      { id: 'service1', title: 'Dịch vụ đăng ký nhãn hiệu thương hiệu độc quyền', href: '/dang-ky-bao-ho-nhan-hieu' },
      { id: 'service2', title: 'Dịch vụ Đăng ký bảo hộ kiểu dáng công nghiệp', href: '/bao-ho-kieu-dang-cong-nghiep' },
      { id: 'service3', title: 'Dịch vụ xử lý xâm phạm sở hữu trí tuệ', href: '/xu-ly-xam-pham' },
      { id: 'service4', title: 'Đăng ký bảo hộ Sáng chế, giải pháp hữu ích', href: '/bao-ho-sang-che-giai-phap-huu-ich' },
      { id: 'service5', title: 'Dịch vụ đăng ký bảo hộ bản quyền', href: '/dang-ky-bao-ho-ban-quyen' },
    ]

    },
    { id: 'other-services', title: 'Dịch vụ khác', href: '/dich-vu-khac', children: [
      { id: 'service6', title: 'Dịch vụ đăng ký mã số mã vạch', href: '/ma-so-ma-vach' },
      { id: 'service7', title: 'Giấy phép Doanh nghiệp Khoa học Công nghệ', href: '/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe' },
      { id: 'service8', title: 'Đăng ký giấy phép mạng xã hội', href: '/dang-ky-giay-phep-mang-xa-hoi' },
      { id: 'service9', title: 'Dịch vụ Tư vấn soạn thảo Hợp đồng', href: '/tu-van-soan-thao-hop-dong' },

    ]},
    { id: 'news', title: 'Bản tin', href: '/tin-tuc' },
    { id: 'qa', title: 'Tuyển dụng', href: '/tuyen-dung' },
    { id: 'contact', title: 'Liên hệ', href: '/lien-he' },
    
  ]);
  const navigate = useNavigate();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSubmenu = (itemId: string) => {
    setActiveSubmenu(activeSubmenu === itemId ? null : itemId);
  };

  // Updated navigation function to include ID as path variable
  const handleNavigation = (item: ServiceResponse | { id: string; href: string; title?: string }) => {
      navigate(`${item.href}`);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const renderMenuItem = (item: ServiceResponse, isMobile = false) => (
    <li key={item.id} className={`relative ${item.children ? 'group' : ''}`}>
      <div className="flex items-center">
        <button
          onClick={() => handleNavigation(item)}
          className={`block px-4 py-3 font-medium transition-all duration-300 relative overflow-hidden ${
            isMobile 
              ? 'text-white hover:text-yellow-300 text-lg hover:bg-white/10 rounded-lg' 
              : 'text-white hover:text-yellow-300 text-base hover:scale-105'
          }`}
        >
          <span className="relative z-10">{item.title}</span>
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          )}
        </button>
        {item.children && (
          <button
            onClick={() => toggleSubmenu(item.id)}
            className={`ml-1 p-2 text-white hover:text-yellow-300 transition-all duration-300 ${
              isMobile ? 'block' : 'hidden group-hover:block'
            }`}
          >
            <ChevronDown 
              size={16} 
              className={`transform transition-all duration-300 ${
                activeSubmenu === item.id ? 'rotate-180 text-yellow-300' : ''
              }`}
            />
          </button>
        )}
      </div>
      
      {item.children && (
        <ul
          className={`${
            isMobile 
              ? `pl-4 mt-2 space-y-1 ${activeSubmenu === item.id ? 'block animate-fadeIn' : 'hidden'}`
              : 'absolute left-0 top-full w-80 backdrop-blur-xl bg-black/95 border border-white/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden'
          }`}
        >
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20"></div>
          )}
          {item.children.map((child, index) => (
            <li key={child.id} className="relative">
              <button
                onClick={() => handleNavigation(child)}
                className={`block w-full text-left px-6 py-3 text-white/90 hover:text-yellow-300 hover:bg-white/10 transition-all duration-300 relative overflow-hidden ${
                  isMobile ? 'text-base rounded-lg' : 'text-base border-b border-white/10 last:border-b-0 hover:translate-x-2'
                }`}
                style={!isMobile ? {animationDelay: `${index * 50}ms`} : {}}
              >
                <span className="relative z-10">{child.title}</span>
                {!isMobile && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400 to-orange-400 transform scale-y-0 hover:scale-y-100 transition-transform duration-300"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </li>
  );


  return (
    <div className="relative">
      {/* Background with solid black */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-black z-40">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
      </div>

      {/* Main header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-black/95 shadow-2xl border-b border-white/10' 
          : 'backdrop-blur-lg bg-black/90'
      }`}>
        
        {/* Top contact bar */}
        <div className="hidden lg:block bg-black/30 border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center space-x-6 text-white/70">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-yellow-400" />
                  <span>Hotline: 0947.600.064</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-yellow-400" />
                  <span>lienhe@luatpoip.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Globe size={14} className="text-yellow-400" />
                <span className="text-white/70">Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-2 lg:px-4" style={{paddingTop: '0.25rem', paddingBottom: '0.25rem', marginTop: '0rem', marginBottom: '0rem'}}>
          {/* Điều chỉnh layout để logo gần navigation hơn */}
          <div className="flex items-center justify-between lg:justify-center h-16 lg:h-16 w-full lg:w-auto">
            {/* Logo Section - Logo lớn hơn */}
            <div className="flex items-center space-x-8 h-full">
              {/* Enhanced Logo with glow effect - Size tăng lên */}
              <div className="relative group">
                <button onClick={() => navigate('/')} className="flex items-center space-x-3 transition-all duration-300 h-full">
                  <div className="hidden md:block relative h-full">
                    {/* Main logo container - Tăng size từ 50px lên 70px */}
                    <div className="relative h-full">
                      <div className="w-[130px] h-[50px] bg-transparent">
                        <img 
                          src="/assets/images/logo.png"
                          alt="Logo"
                          className="w-full h-full object-cover mix-blend-screen opacity-90"
                        />
                      </div>
                      
                    </div>
                  </div>
                  
                  {/* Mobile version - Tăng size từ 40px lên 55px */}
                  <div className="md:hidden relative h-full">
                    <div className="w-[140px] h-[60px] bg-transparent">
                      <img 
                        src="/assets/images/logo.png"
                        alt="Logo"
                        className="w-full h-full object-cover mix-blend-screen opacity-90"
                      />
                    </div>
                  </div>
                </button>
              </div>

              {/* Desktop Navigation - Đặt ngay bên cạnh logo */}
                <nav className="hidden lg:block">
                  <ul className="flex space-x-1">
                    {menuItems.map(item => renderMenuItem(item))}
                  </ul>
                </nav>
            </div>

            {/* Right Side Icons - Giữ nguyên */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 text-white hover:text-yellow-300 hover:bg-white/10 rounded-xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden group"
                aria-label="Mobile menu"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <div className="relative z-10">
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 py-6 animate-fadeIn">
              <nav>

                  <ul className="space-y-2">
                    {menuItems.map(item => renderMenuItem(item, true))}
                  </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Animated decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
      </header>

      {/* Spacer to prevent content overlap - Tăng chiều cao để phù hợp với logo lớn hơn */}
      <div className="h-16 lg:h-16"></div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Header;