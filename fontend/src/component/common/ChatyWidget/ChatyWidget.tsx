import React, { useState } from 'react';

interface ContactChannel {
  id: string;
  name: string;
  icon: React.ReactNode;
  href: string;
  target?: string;
  ariaLabel: string;
  hoverText: string;
  color: string;
}

const ChatyWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const channels: ContactChannel[] = [
    {
      id: 'email',
      name: 'Email',
      href: 'mailto:lienhe@luattaga.vn',
      ariaLabel: 'Email',
      hoverText: 'Email',
      color: '#FF485F',
      icon: (
        <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.4395" cy="19.4395" r="19.4395" fill="#FF485F" />
          <path d="M20.5379 14.2557H1.36919C0.547677 14.2557 0 13.7373 0 12.9597V1.29597C0 0.518387 0.547677 0 1.36919 0H20.5379C21.3594 0 21.9071 0.518387 21.9071 1.29597V12.9597C21.9071 13.7373 21.3594 14.2557 20.5379 14.2557ZM20.5379 12.9597V13.6077V12.9597ZM1.36919 1.29597V12.9597H20.5379V1.29597H1.36919Z" transform="translate(8.48619 12.3117)" fill="white" />
          <path d="M10.9659 8.43548C10.829 8.43548 10.692 8.43548 10.5551 8.30588L0.286184 1.17806C0.012346 0.918864 -0.124573 0.530073 0.149265 0.270879C0.423104 0.0116857 0.833862 -0.117911 1.1077 0.141283L10.9659 7.00991L20.8241 0.141283C21.0979 -0.117911 21.5087 0.0116857 21.7825 0.270879C22.0563 0.530073 21.9194 0.918864 21.6456 1.17806L11.3766 8.30588C11.2397 8.43548 11.1028 8.43548 10.9659 8.43548Z" transform="translate(8.47443 12.9478)" fill="white" />
          <path d="M9.0906 7.13951C8.95368 7.13951 8.81676 7.13951 8.67984 7.00991L0.327768 1.17806C-0.0829894 0.918864 -0.0829899 0.530073 0.190849 0.270879C0.327768 0.0116855 0.738525 -0.117911 1.14928 0.141282L9.50136 5.97314C9.7752 6.23233 9.91212 6.62112 9.63828 6.88032C9.50136 7.00991 9.36444 7.13951 9.0906 7.13951Z" transform="translate(20.6183 18.7799)" fill="white" />
          <path d="M0.696942 7.13951C0.423104 7.13951 0.286185 7.00991 0.149265 6.88032C-0.124573 6.62112 0.012346 6.23233 0.286185 5.97314L8.63826 0.141282C9.04902 -0.117911 9.45977 0.0116855 9.59669 0.270879C9.87053 0.530073 9.73361 0.918864 9.45977 1.17806L1.1077 7.00991C0.970781 7.13951 0.833862 7.13951 0.696942 7.13951Z" transform="translate(8.47443 18.7799)" fill="white" />
        </svg>
      )
    },
    {
      id: 'google_maps',
      name: 'Google Maps',
      href: 'https://www.google.com/maps/place/C%C3%B4ng+ty+TNHH+S%E1%BB%9F+H%E1%BB%AFu+Tr%C3%AD+Tu%E1%BB%87+Taga/@21.021079,105.8135092,17z/data=!3m1!4b1!4m6!3m5!1s0x3135add0e2391c21:0xf4ad84364383812c!8m2!3d21.021079!4d105.8160841!16s%2Fg%2F11ssvfztjq?hl=vi-VN&entry=tts&shorturl=1',
      target: '_blank',
      ariaLabel: 'Google Maps',
      hoverText: 'Google Maps',
      color: '#37AA66',
      icon: (
        <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.4395" cy="19.4395" r="19.4395" fill="#37AA66" />
          <path fillRule="evenodd" clipRule="evenodd" d="M0 8.06381C0 3.68631 3.68633 0 8.06383 0C12.4413 0 16.1276 3.68631 16.1276 8.06381C16.1276 12.2109 9.67659 19.5835 8.9854 20.2747C8.755 20.5051 8.29422 20.7355 8.06383 20.7355C7.83344 20.7355 7.37263 20.5051 7.14224 20.2747C6.45107 19.5835 0 12.2109 0 8.06381ZM11.5203 8.06378C11.5203 9.97244 9.97302 11.5197 8.06436 11.5197C6.15572 11.5197 4.60844 9.97244 4.60844 8.06378C4.60844 6.15515 6.15572 4.60788 8.06436 4.60788C9.97302 4.60788 11.5203 6.15515 11.5203 8.06378Z" transform="translate(11.3764 9.07178)" fill="white" />
        </svg>
      )
    },
    {
      id: 'sms',
      name: 'SMS',
      href: 'sms:+84986488248',
      ariaLabel: 'SMS',
      hoverText: 'SMS',
      color: '#FF549C',
      icon: (
        <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.4395" cy="19.4395" r="19.4395" fill="#FF549C" />
          <path fillRule="evenodd" clipRule="evenodd" d="M2.60298 0H16.9194C18.351 0 19.5224 1.19321 19.5224 2.65158V14.5838C19.5224 16.0421 18.351 17.2354 16.9194 17.2354H7.4185L3.64418 20.4173C3.51402 20.5499 3.38388 20.5499 3.25372 20.5499H2.99344C2.73314 20.4173 2.60298 20.1521 2.60298 19.887V17.2354C1.17134 17.2354 0 16.0421 0 14.5838V2.65158C0 1.19321 1.17134 0 2.60298 0ZM2.60316 11.2696C2.60316 11.6673 2.86346 11.9325 3.25391 11.9325H4.5554C5.5966 11.9325 6.50764 11.0044 6.50764 9.94376C6.50764 8.88312 5.5966 7.95505 4.5554 7.95505C4.16496 7.95505 3.90465 7.68991 3.90465 7.29218C3.90465 6.89441 4.16496 6.62927 4.5554 6.62927H5.85689C6.24733 6.62927 6.50764 6.36411 6.50764 5.96637C6.50764 5.56863 6.24733 5.30347 5.85689 5.30347H4.5554C3.51421 5.30347 2.60316 6.23154 2.60316 7.29218C2.60316 8.35281 3.51421 9.28085 4.5554 9.28085C4.94585 9.28085 5.20613 9.54602 5.20613 9.94376C5.20613 10.3415 4.94585 10.6067 4.5554 10.6067H3.25391C2.86346 10.6067 2.60316 10.8718 2.60316 11.2696ZM14.9678 11.9325H13.6664C13.2759 11.9325 13.0156 11.6673 13.0156 11.2696C13.0156 10.8718 13.2759 10.6067 13.6664 10.6067H14.9678C15.3583 10.6067 15.6186 10.3415 15.6186 9.94376C15.6186 9.54602 15.3583 9.28085 14.9678 9.28085C13.9267 9.28085 13.0156 8.35281 13.0156 7.29218C13.0156 6.23154 13.9267 5.30347 14.9678 5.30347H16.2693C16.6598 5.30347 16.9201 5.56863 16.9201 5.96637C16.9201 6.36411 16.6598 6.62927 16.2693 6.62927H14.9678C14.5774 6.62927 14.3171 6.89441 14.3171 7.29218C14.3171 7.68991 14.5774 7.95505 14.9678 7.95505C16.009 7.95505 16.9201 8.88312 16.9201 9.94376C16.9201 11.0044 16.009 11.9325 14.9678 11.9325ZM10.4126 11.2697C10.4126 11.6674 10.6729 11.9326 11.0633 11.9326C11.4538 11.9326 11.7141 11.6674 11.8442 11.2697V5.96649C11.8442 5.70135 11.5839 5.43619 11.3236 5.30362C10.9332 5.30362 10.6729 5.43619 10.5427 5.70135L9.76186 7.15973L8.98094 5.70135C8.85081 5.43619 8.46034 5.17102 8.20006 5.30362C7.93977 5.43619 7.67946 5.70135 7.67946 5.96649V11.2697C7.67946 11.6674 7.93977 11.9326 8.33022 11.9326C8.72066 11.9326 8.98094 11.6674 8.98094 11.2697V8.75067L9.1111 8.88327C9.37138 9.28101 10.0221 9.28101 10.2825 8.88327L10.4126 8.75067V11.2697Z" transform="translate(9.67801 10.4601)" fill="white" />
        </svg>
      )
    },
    {
      id: 'facebook_messenger',
      name: 'Facebook Messenger',
      href: 'https://m.me/108815868839327',
      target: '_blank',
      ariaLabel: 'Facebook Messenger',
      hoverText: 'Facebook Messenger',
      color: '#1E88E5',
      icon: (
        <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.4395" cy="19.4395" r="19.4395" fill="#1E88E5" />
          <path fillRule="evenodd" clipRule="evenodd" d="M0 9.63934C0 4.29861 4.68939 0 10.4209 0C16.1524 0 20.8418 4.29861 20.8418 9.63934C20.8418 14.98 16.1524 19.2787 10.4209 19.2787C9.37878 19.2787 8.33673 19.1484 7.42487 18.8879L3.90784 20.8418V17.1945C1.56311 15.3708 0 12.6353 0 9.63934ZM8.85779 10.1604L11.463 13.0261L17.1945 6.90384L12.1143 9.76959L9.37885 6.90384L3.64734 13.0261L8.85779 10.1604Z" transform="translate(9.01854 10.3146)" fill="white" />
        </svg>
      )
    },
    {
      id: 'zalo',
      name: 'Zalo',
      href: 'https://zalo.me/1991225575693015758',
      target: '_blank',
      ariaLabel: 'Zalo',
      hoverText: 'Zalo',
      color: '#0068FF',
      icon: (
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">Z</span>
        </div>
      )
    },
    {
      id: 'phone',
      name: 'Phone',
      href: 'tel:0968856464',
      ariaLabel: 'Phone',
      hoverText: 'Phone',
      color: '#03E78B',
      icon: (
        <svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="19.4395" cy="19.4395" r="19.4395" fill="#03E78B" />
          <path d="M19.3929 14.9176C17.752 14.7684 16.2602 14.3209 14.7684 13.7242C14.0226 13.4259 13.1275 13.7242 12.8292 14.4701L11.7849 16.2602C8.65222 14.6193 6.11623 11.9341 4.47529 8.95057L6.41458 7.90634C7.16046 7.60799 7.45881 6.71293 7.16046 5.96705C6.56375 4.47529 6.11623 2.83435 5.96705 1.34259C5.96705 0.596704 5.22117 0 4.47529 0H0.745882C0.298353 0 5.69062e-07 0.298352 5.69062e-07 0.745881C5.69062e-07 3.72941 0.596704 6.71293 1.93929 9.3981C3.87858 13.575 7.30964 16.8569 11.3374 18.7962C14.0226 20.1388 17.0061 20.7355 19.9896 20.7355C20.4371 20.7355 20.7355 20.4371 20.7355 19.9896V16.4094C20.7355 15.5143 20.1388 14.9176 19.3929 14.9176Z" transform="translate(9.07179 9.07178)" fill="white" />
        </svg>
      )
    }
  ];

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const hideWidget = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`transition-all duration-300 ${isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4 pointer-events-none'}`}>
        {/* Channel List */}
        <div className="flex flex-col space-y-3 mb-4">
          {channels.map((channel) => (
            <div key={channel.id} className="group relative">
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                {channel.hoverText}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800"></div>
              </div>
              
              {/* Channel Button */}
              <a
                href={channel.href}
                target={channel.target}
                rel="nofollow noopener"
                aria-label={channel.ariaLabel}
                className="block transform hover:scale-110 transition-transform duration-200"
              >
                {channel.icon}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Main Toggle Button */}
      <div className="relative">
        {/* Contact Us Text */}
        <div className={`absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-purple-400 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          Liên hệ chúng tôi
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-purple-400"></div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleWidget}
          className="w-14 h-14 bg-purple-400 hover:bg-purple-500 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
          aria-label={isOpen ? "Close contact menu" : "Open contact menu"}
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
            {isOpen ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
              </svg>
            )}
          </div>
        </button>

        {/* Hide Button */}
        {isOpen && (
          <button
            onClick={hideWidget}
            className="absolute -top-2 -right-2 w-6 h-6 bg-purple-400 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors duration-200"
            aria-label="Hide contact widget"
          >
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatyWidget;