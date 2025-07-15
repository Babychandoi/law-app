import React, { useState, useEffect } from 'react';
import {  Menu, X, ChevronDown, Sparkles, Globe, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getServices } from '../../../service/service';
import { ServiceResponse } from '../../../types/service';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState<ServiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Base menu items that don't change
  const staticMenuItems = React.useMemo(() => [
    { id: 'home', title: 'Trang chủ', href: '/' },
    { id: 'about', title: 'Về chúng tôi', href: '/about' },
    { id: 'news', title: 'Bản tin', href: '/news' },
    { id: 'qa', title: 'Tuyển dụng', href: '/recruitment' },
    { id: 'contact', title: 'Liên hệ', href: '/contact' }
  ], []);

  useEffect(() => {
    const fetchServicesAndBuildMenu = async () => {
      try {
        setIsLoading(true);
        const response = await getServices();
        const services = response.data;
        
        // Build dynamic menu items from fetched services
        const dynamicMenuItems: ServiceResponse[] = [];
        services.forEach((service: ServiceResponse) => {
          const children = service.children?.map(child => ({
            id: child.id,
            title: child.title,
            href: child.href,
          })) || [];

          dynamicMenuItems.push({
            id: service.id,
            title: service.title,
            href: service.href,
            children: children.length > 0 ? children : undefined
          });
        });

        // Combine static and dynamic menu items
        const combinedMenuItems = [
          staticMenuItems[0], // Trang chủ
          staticMenuItems[1], // Về chúng tôi
          ...dynamicMenuItems, // Dynamic services
          ...staticMenuItems.slice(2) // Remaining static items
        ];

        setMenuItems(combinedMenuItems);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to static menu if API fails
        setMenuItems(staticMenuItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServicesAndBuildMenu();
  }, [staticMenuItems]);

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
    // For static menu items, navigate normally
    if (['home', 'about', 'news', 'qa', 'contact'].includes(item.id)) {
      navigate(item.href);
    } else {
      // For dynamic service items, include ID as path variable
      navigate(item.href, { state: { id: item.id } });
    }
    
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const renderMenuItem = (item: ServiceResponse, isMobile = false) => (
    <li key={item.id} className={`relative ${item.children ? 'group' : ''}`}>
      <div className="flex items-center">
        <button
          onClick={() => handleNavigation(item)}
          className={`block px-4 py-3 font-medium transition-all duration-300 relative overflow-hidden ${
            isMobile 
              ? 'text-white hover:text-yellow-300 text-base hover:bg-white/10 rounded-lg' 
              : 'text-white hover:text-yellow-300 text-sm hover:scale-105'
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
              : 'absolute left-0 top-full w-80 backdrop-blur-xl bg-gray-900/95 border border-white/20 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden'
          }`}
        >
          {!isMobile && (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          )}
          {item.children.map((child, index) => (
            <li key={child.id} className="relative">
              <button
                onClick={() => handleNavigation(child)}
                className={`block w-full text-left px-6 py-3 text-white/90 hover:text-yellow-300 hover:bg-white/10 transition-all duration-300 relative overflow-hidden ${
                  isMobile ? 'text-sm rounded-lg' : 'text-sm border-b border-white/10 last:border-b-0 hover:translate-x-2'
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

  // Loading skeleton for menu items
  const renderLoadingSkeleton = () => (
    <div className="hidden lg:block">
      <ul className="flex space-x-1">
        {[...Array(6)].map((_, index) => (
          <li key={index} className="relative">
            <div className="block px-4 py-3 bg-white/10 rounded-lg animate-pulse">
              <div className="h-4 bg-white/20 rounded w-20"></div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="relative">
      {/* Background with animated gradient */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 z-40">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400"></div>
      </div>

      {/* Main header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-xl bg-gray-900/90 shadow-2xl border-b border-white/10' 
          : 'backdrop-blur-lg bg-gray-900/80'
      }`}>
        
        {/* Top contact bar */}
        <div className="hidden lg:block bg-black/20 border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 text-sm">
              <div className="flex items-center space-x-6 text-white/70">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-yellow-400" />
                  <span>Hotline: 0346.903.548</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail size={14} className="text-yellow-400" />
                  <span>lienhe@luattoto.vn</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Globe size={14} className="text-yellow-400" />
                <span className="text-white/70">Việt Nam</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Điều chỉnh layout để logo gần navigation hơn */}
          <div className="flex items-center justify-between lg:justify-center h-16 lg:h-18">
            {/* Logo Section - Giảm flex-shrink và margin */}
            <div className="flex items-center space-x-8"
            >
              {/* Enhanced Logo with glow effect */}
              <div className="relative group">
                <button onClick={() => navigate('/')} className="flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 hover:bg-white/5">
                  <div className="hidden md:block relative">
                    {/* Main logo container */}
                    <div className="relative">
                      <div className="w-[50px] h-[50px] rounded-full overflow-hidden ring-2 ring-yellow-400/50 group-hover:ring-yellow-400 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                        <img 
                          src="/assets/images/20250701_0807_Tấm Khiên Luật Pháp_remix_01jz1rafq0eyx97r1jqa9nrfra.png"
                          alt="Logo"
                          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:contrast-110"
                        />
                        {/* Shine effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      </div>
                      
                      {/* Floating sparkles */}
                      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles size={12} className="text-yellow-400 animate-pulse" />
                      </div>
                      <div className="absolute -bottom-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        <Sparkles size={8} className="text-orange-400 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile version */}
                  <div className="md:hidden relative">
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden ring-2 ring-yellow-400/50 group-hover:ring-yellow-400 transition-all duration-300 transform group-hover:scale-110">
                      <img 
                        src="/assets/images/channels4_profile.jpg"
                        alt="Logo"
                        className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                      />
                      {/* Mobile shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Desktop Navigation - Đặt ngay bên cạnh logo */}
              {isLoading ? renderLoadingSkeleton() : (
                <nav className="hidden lg:block">
                  <ul className="flex space-x-1">
                    {menuItems.map(item => renderMenuItem(item))}
                  </ul>
                </nav>
              )}
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
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="bg-white/10 rounded-lg animate-pulse">
                        <div className="h-12 bg-white/20 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {menuItems.map(item => renderMenuItem(item, true))}
                  </ul>
                )}
              </nav>
            </div>
          )}
        </div>

        {/* Animated decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-20 lg:h-24"></div>

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