import { Mail, MapPin, MessageCircle, Phone, Plus, X } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { contactInfo } from '../../../shared/config/site';

const ChatBox = lazy(() => import('../../chat/ChatBox'));

const contactActions = [
  { id: 'phone', label: `Gọi ${contactInfo.hotline}`, href: contactInfo.phoneHref, icon: Phone },
  {
    id: 'zalo',
    label: 'Nhắn Zalo',
    href: contactInfo.zaloHref,
    icon: MessageCircle,
    target: '_blank',
  },
  { id: 'mail', label: 'Gửi email', href: contactInfo.emailHref, icon: Mail },
  {
    id: 'map',
    label: 'Xem văn phòng',
    href: contactInfo.mapHref,
    icon: MapPin,
    target: '_blank',
  },
];

export default function ChatyWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      {showChat && (
        <div className="fixed inset-x-3 bottom-24 z-50 sm:inset-x-auto sm:right-5 sm:w-96">
          <Suspense
            fallback={
              <div
                className="h-96 rounded-lg border border-brand-line bg-white shadow-soft"
                aria-hidden="true"
              />
            }
          >
            <ChatBox onClose={() => setShowChat(false)} />
          </Suspense>
        </div>
      )}

      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 sm:right-5">
        {isOpen && (
          <div
            id="quick-contact-menu"
            className="flex flex-col items-end gap-2"
            aria-label="Liên hệ nhanh"
          >
            <button
              type="button"
              onClick={() => {
                setShowChat(true);
                setIsOpen(false);
              }}
              className="group flex min-h-12 items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-semibold text-gray-900 shadow-soft ring-1 ring-brand-line transition-colors hover:text-brand-primaryDark"
            >
              Chat trực tuyến
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-brand-ink">
                <MessageCircle size={18} aria-hidden="true" />
              </span>
            </button>
            {contactActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.id}
                  href={action.href}
                  target={action.target}
                  rel={action.target ? 'noreferrer' : undefined}
                  className="group flex min-h-12 items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm font-semibold text-gray-900 shadow-soft ring-1 ring-brand-line transition-colors hover:text-brand-primaryDark"
                >
                  {action.label}
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-ink text-white group-hover:bg-brand-primaryDark">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                </a>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-soft transition-colors hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primaryDark"
          aria-label={isOpen ? 'Đóng liên hệ nhanh' : 'Mở liên hệ nhanh'}
          aria-expanded={isOpen}
          aria-controls="quick-contact-menu"
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Plus size={24} aria-hidden="true" />}
        </button>
      </div>
    </>
  );
}
