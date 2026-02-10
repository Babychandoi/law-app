import React, { useState, useEffect } from 'react';
import { MessageCircle, Phone, Mail, MapPin, MessageSquare, X, Plus } from 'lucide-react';
import ChatBox from '../../chat/ChatBox';

interface ContactChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  ariaLabel: string;
  hoverText: string;
  color: string;
  bgGradient?: string;
}

const ChatyWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const chatChannel: ContactChannel = {
    id: 'chat',
    name: 'Chat trực tiếp',
    ariaLabel: 'Chat trực tiếp',
    hoverText: 'Hỗ trợ trực tiếp',
    color: '#F59E0B',
    bgGradient: 'from-yellow-400 via-orange-400 to-red-400',
    icon: <MessageCircle className="w-5 h-5" />,
    onClick: () => setShowChat(prev => !prev),
  };

  const otherChannels: ContactChannel[] = [
    {
      id: 'email',
      name: 'Email',
      href: 'mailto:lienhe@luatpoip.vn',
      ariaLabel: 'Gửi Email',
      hoverText: 'Gửi Email cho chúng tôi',
      color: '#EF4444',
      bgGradient: 'from-red-500 to-red-600',
      icon: <Mail className="w-5 h-5" />
    },
    {
      id: 'google_maps',
      name: 'Vị trí',
      href: 'https://maps.app.goo.gl/JgpZ9sgqkDv3Y9NU7',
      target: '_blank',
      ariaLabel: 'Xem vị trí trên Google Maps',
      hoverText: 'Tìm đường đến văn phòng',
      color: '#10B981',
      bgGradient: 'from-emerald-500 to-emerald-600',
      icon: <MapPin className="w-5 h-5" />
    },
    {
      id: 'sms',
      name: 'SMS',
      href: 'sms:+84947600064',
      ariaLabel: 'Gửi tin nhắn SMS',
      hoverText: 'Gửi tin nhắn SMS',
      color: '#EC4899',
      bgGradient: 'from-pink-500 to-pink-600',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      id: 'facebook_messenger',
      name: 'Messenger',
      href: 'https://m.me/61577813197981',
      target: '_blank',
      ariaLabel: 'Chat qua Facebook Messenger',
      hoverText: 'Chat qua Messenger',
      color: '#1877F2',
      bgGradient: 'from-blue-600 to-blue-700',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2C6.486,2,2,6.262,2,11.5c0,2.635,1.127,5.025,3,6.765V22l3.698-1.849C9.754,20.384,10.85,20.5,12,20.5 c5.514,0,10-4.262,10-9.5S17.514,2,12,2z M13.5,13.5L10,10l-3,3l6.5-6.5L17,10L13.5,13.5z"/>
        </svg>
      )
    },
    {
      id: 'zalo',
      name: 'Zalo',
      href: 'https://zalo.me/0346903548',
      target: '_blank',
      ariaLabel: 'Chat qua Zalo',
      hoverText: 'Chat qua Zalo',
      color: '#0068FF',
      bgGradient: 'from-blue-500 to-blue-700',
      icon: (
        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
          <span className="text-blue-600 font-bold text-xs">Z</span>
        </div>
      )
    },
    {
      id: 'phone',
      name: 'Điện thoại',
      href: 'tel:0346.903.548',
      ariaLabel: 'Gọi điện thoại',
      hoverText: 'Gọi ngay: 0346 903 548',
      color: '#059669',
      bgGradient: 'from-emerald-600 to-green-600',
      icon: <Phone className="w-5 h-5" />
    }
  ];

  const handleToggle = () => {
    setIsAnimating(true);
    setIsOpen(prev => !prev);
    setTimeout(() => setIsAnimating(false), 300);
  };

  useEffect(() => {
    if (showChat) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showChat]);

  return (
    <>
      {/* Chat Button - Left side */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="relative group">
          {!showChat && (
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 translate-x-full opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                💬 Hỗ trợ trực tiếp
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-0 h-0 border-r-4 border-r-purple-600 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            </div>
          )}
          
          <button
            onClick={chatChannel.onClick}
            className={`relative bg-gradient-to-r ${chatChannel.bgGradient} hover:scale-110 active:scale-95 transform transition-all duration-200 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-xl hover:shadow-2xl group overflow-hidden`}
            aria-label={chatChannel.ariaLabel}
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-full"></div>
            {chatChannel.icon}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
          </button>
        </div>
      </div>

      {/* Main Toggle Button and Other Channels - Right side */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-4">
        {/* Other Channels */}
        <div className={`flex flex-col items-end space-y-3 transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'
        }`}>
          {otherChannels.map((channel, index) => (
            <div 
              key={channel.id} 
              className={`group relative transition-all duration-300 ease-out ${
                isOpen ? 'transform translate-x-0 opacity-100' : 'transform translate-x-4 opacity-0'
              }`}
              style={{ 
                transitionDelay: isOpen ? `${index * 50}ms` : `${(otherChannels.length - index - 1) * 50}ms`
              }}
            >
              <div className="absolute right-16 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                  {channel.hoverText}
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </div>
              </div>
              
              <a
                href={channel.href}
                target={channel.target}
                rel="noopener noreferrer"
                className={`relative bg-gradient-to-r ${channel.bgGradient} hover:scale-110 active:scale-95 transform transition-all duration-200 rounded-full w-12 h-12 flex items-center justify-center text-white shadow-lg hover:shadow-xl group overflow-hidden`}
                aria-label={channel.ariaLabel}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-full"></div>
                {channel.icon}
              </a>
            </div>
          ))}
        </div>

        {/* Main Toggle Button */}
        <button
          onClick={handleToggle}
          className={`relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 hover:scale-110 active:scale-95 transform transition-all duration-200 rounded-full w-16 h-16 flex items-center justify-center text-white shadow-xl hover:shadow-2xl group overflow-hidden ${
            isAnimating ? 'animate-pulse' : ''
          }`}
          aria-label={isOpen ? 'Đóng menu liên hệ' : 'Mở menu liên hệ'}
        >
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-200 rounded-full"></div>
          <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>
            {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </div>
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-30 group-active:animate-ping"></div>
        </button>
      </div>

      {/* Chat Overlay */}
      {showChat && (
        <div className="fixed bottom-20 left-6 z-50 shadow-xl" >
          <ChatBox onClose={() => setShowChat(false)} />
        </div>
      )}
    </>
  );
};

export default ChatyWidget;