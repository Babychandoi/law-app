import React, { useState, useEffect } from 'react';
import {  
  Menu, X, ChevronDown, Globe, Phone, Mail, 
  Home, Users, Shield, Briefcase, Newspaper, 
  UserPlus, MessageCircle, Award, Lightbulb, 
  AlertTriangle, Copyright, Barcode, Building2, 
  Share2, FileText, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ServiceResponse } from '../../../types/service';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  // Icon mapping for menu items
  const getMenuIcon = (id: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'home': <Home size={18} />,
      'about': <Users size={18} />,
      'services': <Shield size={18} />,
      'other-services': <Briefcase size={18} />,
      'news': <Newspaper size={18} />,
      'qa': <UserPlus size={18} />,
      'contact': <MessageCircle size={18} />,
      'service1': <Award size={16} />,
      'service2': <Sparkles size={16} />,
      'service3': <AlertTriangle size={16} />,
      'service4': <Lightbulb size={16} />,
      'service5': <Copyright size={16} />,
      'service6': <Barcode size={16} />,
      'service7': <Building2 size={16} />,
      'service8': <Share2 size={16} />,
      'service9': <FileText size={16} />,
    };
    return iconMap[id] || null;
  };

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
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-all duration-300 relative overflow-hidden ${
            isMobile 
              ? 'text-gray-300 hover:text-yellow-400 text-lg hover:bg-gray-700/50 rounded-lg w-full border border-transparent hover:border-gray-600' 
              : 'text-gray-300 hover:text-yellow-400 text-base hover:scale-105'
          }`}
        >
          <span className={`relative z-10 ${isMobile ? 'text-yellow-400' : 'text-yellow-400 group-hover:text-yellow-300'} transition-colors duration-300`}>
            {getMenuIcon(item.id)}
          </span>
          <span className="relative z-10">{item.title}</span>
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
          )}
        </button>
        {item.children && isMobile && (
          <button
            onClick={() => toggleSubmenu(item.id)}
            className="ml-1 p-2 text-gray-300 hover:text-yellow-400 transition-all duration-300"
          >
            <ChevronDown 
              size={16} 
              className={`transform transition-all duration-300 ${
                activeSubmenu === item.id ? 'rotate-180 text-yellow-400' : ''
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
              : 'absolute left-0 top-full w-96 backdrop-blur-xl bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 border border-yellow-400/30 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden'
          }`}
        >
          {!isMobile && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 via-orange-600/10 to-red-600/10"></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
            </>
          )}
          {item.children.map((child, index) => (
            <li key={child.id} className="relative">
              <button
                onClick={() => handleNavigation(child)}
                className={`flex items-center gap-3 w-full text-left px-6 py-4 text-gray-300 hover:text-yellow-400 hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-orange-400/10 transition-all duration-300 relative overflow-hidden group/item ${
                  isMobile ? 'text-base rounded-lg border border-transparent hover:border-gray-600' : 'text-sm border-b border-gray-700/50 last:border-b-0 hover:translate-x-2'
                }`}
                style={!isMobile ? {animationDelay: `${index * 50}ms`} : {}}
              >
                <span className="text-yellow-400/80 group-hover/item:text-yellow-300 transition-colors duration-300">
                  {getMenuIcon(child.id)}
                </span>
                <span className="relative z-10 flex-1">{child.title}</span>
                {!isMobile && (
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400 to-orange-400 transform scale-y-0 group-hover/item:scale-y-100 transition-transform duration-300"></div>
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
      {/* Main header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-gradient-to-b from-gray-900/95 via-black/95 to-gray-900/95 shadow-2xl border-b border-yellow-400/20' 
          : 'backdrop-blur-lg bg-gradient-to-b from-gray-900/90 via-black/90 to-gray-900/90'
      }`}>
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
        
        {/* Top contact bar */}
        <div className="hidden lg:block bg-gradient-to-r from-gray-800/40 via-gray-900/40 to-gray-800/40 border-b border-yellow-400/20">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2.5 text-sm">
              <div className="flex items-center space-x-6 text-gray-300">
                <div className="flex items-center space-x-2 hover:text-yellow-400 transition-all duration-300 cursor-pointer group">
                  <div className="p-1.5 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors duration-300">
                    <Phone size={14} className="text-yellow-400 group-hover:animate-pulse" />
                  </div>
                  <span className="font-medium">Hotline: 0346.903.548</span>
                </div>
                <div className="flex items-center space-x-2 hover:text-yellow-400 transition-all duration-300 cursor-pointer group">
                  <div className="p-1.5 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors duration-300">
                    <Mail size={14} className="text-yellow-400 group-hover:animate-pulse" />
                  </div>
                  <span className="font-medium">luatpoip@gmail.com</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-all duration-300 cursor-pointer group">
                <div className="p-1.5 bg-yellow-400/10 rounded-lg group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Globe size={14} className="text-yellow-400 group-hover:rotate-180 transition-transform duration-500" />
                </div>
                <span className="font-medium">Việt Nam</span>
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
                <button onClick={() => navigate('/')} className="flex items-center space-x-3 transition-all duration-300 h-full hover:scale-105">
                  <div className="hidden md:block relative h-full">
                    {/* Main logo container - Tăng size từ 50px lên 70px */}
                    <div className="relative h-full">
                      <div className="w-[130px] h-[50px] bg-transparent relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                        <img 
                          src="/assets/images/logo.png"
                          alt="Logo"
                          className="w-full h-full object-cover mix-blend-screen opacity-90 relative z-10 group-hover:opacity-100 transition-opacity duration-300"
                        />
                      </div>
                      
                    </div>
                  </div>
                  
                  {/* Mobile version - Tăng size từ 40px lên 55px */}
                  <div className="md:hidden relative h-full">
                    <div className="w-[140px] h-[60px] bg-transparent relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
                      <img 
                        src="/assets/images/logo.png"
                        alt="Logo"
                        className="w-full h-full object-cover mix-blend-screen opacity-90 relative z-10"
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
                className="lg:hidden p-3 text-white hover:text-yellow-400 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-yellow-400/50 rounded-xl transition-all duration-300 transform hover:scale-110 relative overflow-hidden group"
                aria-label="Mobile menu"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 to-orange-400/0 group-hover:from-yellow-400/10 group-hover:to-orange-400/10 transition-all duration-300"></div>
                <div className="relative z-10">
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-yellow-400/20 py-6 animate-fadeIn bg-gradient-to-b from-gray-800/40 to-gray-900/40">
              <nav>

                  <ul className="space-y-2">
                    {menuItems.map(item => renderMenuItem(item, true))}
                  </ul>
              </nav>
            </div>
          )}
        </div>

        {/* Animated decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-shimmer"></div>
        </div>
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
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Header;